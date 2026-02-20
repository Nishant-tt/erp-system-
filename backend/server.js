require("dotenv").config(); // MUST be first
const connectDB = require("./config/db");
const app = require("./app");

// dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));