const express = require("express");  
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  res.send("PO Manager Backend Running 🚀");
});

// Route registration
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/roles", require("./routes/role.routes"));
app.use("/api/modules", require("./routes/module.routes"));
app.use("/api/org", require("./routes/org.routes"));
app.use("/api/suppliers", require("./routes/supplier.routes"));
app.use("/api/customers", require("./routes/customer.routes"));
app.use("/api/items", require("./routes/itemMaster.routes"));
app.use("/api/prs", require("./routes/pr.routes"));
app.use("/api/pos", require("./routes/po.routes"));
app.use("/api/grns", require("./routes/grn.routes"));
app.use("/api/procurement-quotations", require("./routes/procurementQuotation.routes"));
app.use("/api/invoices", require("./routes/purchaseInvoice.routes"));
app.use("/api/payments", require("./routes/vendorPayment.routes"));
app.use("/api/company", require("./routes/company.routes"));
app.use("/api/financial-years", require("./routes/financialYear.routes"));

// Sales & CRM Routes
app.use("/api/leads", require("./routes/lead.routes"));
app.use("/api/opportunities", require("./routes/opportunity.routes"));
app.use("/api/quotations", require("./routes/quotation.routes"));
app.use("/api/sales-orders", require("./routes/salesOrder.routes"));
app.use("/api/delivery-notes", require("./routes/deliveryNote.routes"));
app.use("/api/sales-invoices", require("./routes/salesInvoice.routes"));
app.use("/api/customer-payments", require("./routes/customerPayment.routes"));

// Finance Routes
app.use("/api/accounts", require("./routes/account.routes"));
app.use("/api/journal-entries", require("./routes/journalEntry.routes"));

module.exports = app;
