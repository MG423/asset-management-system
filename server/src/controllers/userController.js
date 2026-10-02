import User from "../models/User.js";
import { pickFields } from "../utils/queryHelpers.js";

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  active: u.active,
  createdAt: u.createdAt,
});

export const getUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: 1 });
  res.json({ users: users.map(publicUser) });
};

export const createUser = async (req, res) => {
  const data = pickFields(req.body, ["name", "email", "password", "role"]);
  const user = await User.create(data);
  res.status(201).json({ user: publicUser(user) });
};

export const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const data = pickFields(req.body, ["name", "role", "active", "password"]);

  // Admins can't lock themselves out
  const isSelf = user._id.equals(req.user._id);
  const changesRole = data.role !== undefined && data.role !== user.role;
  if (isSelf && (changesRole || data.active === false)) {
    res.status(400);
    throw new Error("You can't change your own role or deactivate your own account");
  }

  Object.assign(user, data);
  await user.save();
  res.json({ user: publicUser(user) });
};