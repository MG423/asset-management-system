import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";
import app from "../src/app.js";

process.env.JWT_SECRET ??= "test-secret-not-for-production";

const TEST_URI =
  process.env.MONGO_URI_TEST || "mongodb://127.0.0.1:27017/asset_management_test";
if (!TEST_URI.split("?")[0].endsWith("_test")) {
  throw new Error("Refusing to run tests: the database name must end with _test");
}

const api = request(app);
const auth = (token) => ({ Authorization: `Bearer ${token}` });
const state = {}; // values shared between tests (tokens, ids)

async function createAsset(tag, extra = {}) {
  const res = await api
    .post("/api/assets")
    .set(auth(state.adminToken))
    .send({ assetTag: tag, name: `Test ${tag}`, category: "Laptop", ...extra });
  return res.body.asset;
}

async function createEmployee(id, extra = {}) {
  const res = await api
    .post("/api/employees")
    .set(auth(state.adminToken))
    .send({
      employeeId: id,
      name: `Employee ${id}`,
      email: `${id.toLowerCase()}@test.com`,
      department: "IT",
      ...extra,
    });
  return res.body.employee;
}

const getAsset = async (id) =>
  (await api.get(`/api/assets/${id}`).set(auth(state.adminToken))).body.asset;

before(async () => {
  await mongoose.connect(TEST_URI);
  await mongoose.connection.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe("auth", () => {
  test("first registration creates an admin", async () => {
    const res = await api
      .post("/api/auth/register")
      .send({ name: "Admin", email: "Admin@Test.com", password: "secret123" });
    assert.equal(res.status, 201);
    assert.equal(res.body.user.role, "admin");
    assert.equal(res.body.user.email, "admin@test.com");
    state.adminToken = res.body.token;
  });

  test("registration is closed after the first user", async () => {
    const res = await api
      .post("/api/auth/register")
      .send({ name: "Other", email: "other@test.com", password: "secret123" });
    assert.equal(res.status, 403);
  });

  test("login rejects a wrong password", async () => {
    const res = await api
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "wrong-password" });
    assert.equal(res.status, 401);
  });

  test("login rejects non-string input", async () => {
    const res = await api
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: { $gt: "" } });
    assert.equal(res.status, 400);
  });

  test("login works and /me returns the user", async () => {
    const login = await api
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "secret123" });
    assert.equal(login.status, 200);

    const me = await api.get("/api/auth/me").set(auth(login.body.token));
    assert.equal(me.status, 200);
    assert.equal(me.body.user.email, "admin@test.com");
  });

  test("protected routes need a token", async () => {
    const res = await api.get("/api/assets");
    assert.equal(res.status, 401);
  });

  test("admin can create a staff user, and staff cannot list users", async () => {
    const created = await api
      .post("/api/users")
      .set(auth(state.adminToken))
      .send({ name: "Staff", email: "staff@test.com", password: "secret123" });
    assert.equal(created.status, 201);
    assert.equal(created.body.user.role, "staff");

    const login = await api
      .post("/api/auth/login")
      .send({ email: "staff@test.com", password: "secret123" });
    state.staffToken = login.body.token;

    const list = await api.get("/api/users").set(auth(state.staffToken));
    assert.equal(list.status, 403);
  });
});

describe("assets", () => {
  test("creates an asset and uppercases the tag", async () => {
    const asset = await createAsset("tst-1");
    assert.equal(asset.assetTag, "TST-1");
    assert.equal(asset.status, "available");
  });

  test("rejects a duplicate asset tag", async () => {
    const res = await api
      .post("/api/assets")
      .set(auth(state.adminToken))
      .send({ assetTag: "TST-1", name: "Duplicate", category: "Laptop" });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /already exists/);
  });

  test("search finds assets", async () => {
    const res = await api.get("/api/assets?q=tst-1").set(auth(state.adminToken));
    assert.equal(res.status, 200);
    assert.equal(res.body.total, 1);
  });

  test("cannot create an asset with a managed status", async () => {
    const res = await api
      .post("/api/assets")
      .set(auth(state.adminToken))
      .send({ assetTag: "TST-3", name: "Sneaky", category: "Laptop", status: "assigned" });
    assert.equal(res.status, 400);
  });

  test("staff cannot delete assets, admin can", async () => {
    const asset = await createAsset("TST-2");

    const staffRes = await api
      .delete(`/api/assets/${asset._id}`)
      .set(auth(state.staffToken));
    assert.equal(staffRes.status, 403);

    const adminRes = await api
      .delete(`/api/assets/${asset._id}`)
      .set(auth(state.adminToken));
    assert.equal(adminRes.status, 200);
  });
});

describe("assignments and maintenance", () => {
  test("assigning marks the asset as assigned", async () => {
    state.asset = await createAsset("ASG-1");
    state.employee = await createEmployee("E-1");

    const res = await api
      .post("/api/assignments")
      .set(auth(state.adminToken))
      .send({ asset: state.asset._id, employee: state.employee._id });
    assert.equal(res.status, 201);
    state.assignmentId = res.body.assignment._id;

    assert.equal((await getAsset(state.asset._id)).status, "assigned");
  });

  test("an assigned asset cannot be assigned again", async () => {
    const res = await api
      .post("/api/assignments")
      .set(auth(state.adminToken))
      .send({ asset: state.asset._id, employee: state.employee._id });
    assert.equal(res.status, 400);
  });

  test("inactive employees cannot receive assets", async () => {
    state.spare = await createAsset("ASG-2");
    const inactive = await createEmployee("E-2", { status: "inactive" });

    const res = await api
      .post("/api/assignments")
      .set(auth(state.adminToken))
      .send({ asset: state.spare._id, employee: inactive._id });
    assert.equal(res.status, 400);
    assert.equal((await getAsset(state.spare._id)).status, "available");
  });

  test("returning makes the asset available again", async () => {
    const res = await api
      .patch(`/api/assignments/${state.assignmentId}/return`)
      .set(auth(state.adminToken));
    assert.equal(res.status, 200);
    assert.equal((await getAsset(state.asset._id)).status, "available");
  });

  test("assets with assignment history cannot be deleted", async () => {
    const res = await api
      .delete(`/api/assets/${state.asset._id}`)
      .set(auth(state.adminToken));
    assert.equal(res.status, 400);
  });

  test("an available asset can go into maintenance and be retired", async () => {
    const start = await api
      .post("/api/maintenance")
      .set(auth(state.adminToken))
      .send({ asset: state.spare._id, issue: "Screen cracked" });
    assert.equal(start.status, 201);
    assert.equal((await getAsset(state.spare._id)).status, "maintenance");

    const done = await api
      .patch(`/api/maintenance/${start.body.record._id}/complete`)
      .set(auth(state.adminToken))
      .send({ cost: 500, outcome: "retired" });
    assert.equal(done.status, 200);
    assert.equal((await getAsset(state.spare._id)).status, "retired");
  });

  test("an assigned asset cannot be sent for maintenance", async () => {
    await api
      .post("/api/assignments")
      .set(auth(state.adminToken))
      .send({ asset: state.asset._id, employee: state.employee._id });

    const res = await api
      .post("/api/maintenance")
      .set(auth(state.adminToken))
      .send({ asset: state.asset._id, issue: "Strange noise" });
    assert.equal(res.status, 400);
  });

  test("the dashboard counts add up", async () => {
    const res = await api.get("/api/dashboard").set(auth(state.adminToken));
    assert.equal(res.status, 200);

    const { total, available, assigned, maintenance, retired } = res.body.stats;
    assert.equal(total, available + assigned + maintenance + retired);
    assert.equal(assigned, 1);
    assert.equal(retired, 1);
  });
});