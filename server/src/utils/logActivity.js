import Activity from "../models/Activity.js";

// A failed log entry must never break the action that triggered it
export const logActivity = async (type, message, userId) => {
  try {
    await Activity.create({ type, message, user: userId });
  } catch (err) {
    console.error("Activity log failed:", err.message);
  }
};