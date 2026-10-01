import Employee from "../models/Employee.js";
import { pickFields, escapeRegex } from "../utils/queryHelpers.js";

const FIELDS = ["employeeId", "name", "email", "department", "designation", "status"];

const notFoundError = (res) => {
  res.status(404);
  return new Error("Employee not found");
};

export const getEmployees = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const { q, status, department } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (department) filter.department = department;
  if (typeof q === "string" && q.trim()) {
    const regex = new RegExp(escapeRegex(q.trim()), "i");
    filter.$or = [{ name: regex }, { email: regex }, { employeeId: regex }];
  }

  const total = await Employee.countDocuments(filter);
  const employees = await Employee.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ employees, page, pages: Math.ceil(total / limit), total });
};

export const getEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) throw notFoundError(res);
  res.json({ employee });
};

export const createEmployee = async (req, res) => {
  const employee = await Employee.create(pickFields(req.body, FIELDS));
  res.status(201).json({ employee });
};

export const updateEmployee = async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    pickFields(req.body, FIELDS),
    { new: true, runValidators: true }
  );
  if (!employee) throw notFoundError(res);
  res.json({ employee });
};

export const deleteEmployee = async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) throw notFoundError(res);
  res.json({ message: "Employee deleted" });
};