import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const userResponse = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
});

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const isFirstUser = (await User.countDocuments()) === 0;
  const user = await User.create({
    name,
    email,
    password,
    role: isFirstUser ? "admin" : "staff",
  });
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
  res.json({ token: generateToken(user._id), user: userResponse(user) });
};

export const getMe = (req, res) => {
  res.json({ user: userResponse(req.user) });
};