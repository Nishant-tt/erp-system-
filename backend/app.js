const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const cors = require("cors");
const path = require("path");

const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  res.send("PO Manager Backend Running 🚀");
});
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/roles", require("./routes/role.routes"));
app.use("/api/modules", require("./routes/module.routes"));
app.use("/api/org", require("./routes/org.routes"));
app.use("/api/suppliers", require("./routes/supplier.routes"));
app.use("/api/prs", require("./routes/pr.routes"));



module.exports = app;
