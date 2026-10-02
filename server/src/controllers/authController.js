import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const userResponse = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
});
export const register = async (req, res) => {
  // Only the very first account can self-register (it becomes the admin).
  // After that, admins create accounts from Settings.
  if ((await User.countDocuments()) > 0) {
    res.status(403);
    throw new Error("Registration is closed. Ask an administrator to create your account");
  }
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password, role: "admin" });
  res.status(201).json({ token: generateToken(user._id), user: userResponse(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  if (!user.active) {
    res.status(403);
    throw new Error("Account is deactivated. Contact an administrator");
  }
  res.json({ token: generateToken(user._id), user: userResponse(user) });
};

export const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user._id);
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  await user.save();
  res.json({ user: userResponse(user) });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current and new password are required");
  }
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated" });
};

export const getMe = (req, res) => {
  res.json({ user: userResponse(req.user) });
};