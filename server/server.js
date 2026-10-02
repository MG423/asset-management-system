import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const missing = ["MONGO_URI", "JWT_SECRET"].filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(", ")}. Check server/.env`);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

await connectDB();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));