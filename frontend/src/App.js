import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import ForgetPasswordPage from './pages/LoginPage/ForgetPasswordPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProfilePage from './pages/Profile/ProfilePage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import RoleManagement from './pages/Admin/RoleManagement';
import DepartmentManagement from './pages/Admin/DepartmentManagement';
import SupplierManagement from './pages/Admin/SupplierManagement';
import ItemMaster from './pages/Admin/ItemMaster';
import CompanySettings from './pages/Admin/CompanySettings';
import FinancialYearManagement from './pages/Admin/FinancialYearManagement';
import CustomerManagement from './pages/Admin/CustomerManagement';
import PRManagement from './pages/PR/PRManagement';
import RaisePR from './pages/PR/RaisePR';
import PRDetails from './pages/PR/PRDetails';
import ApprovalQueue from './pages/PR/ApprovalQueue';
import Performance from './pages/Reports/Performance';
import DashboardLayout from './components/Layout/DashboardLayout';

// Procurement Flow
import PurchaseOrderManagement from './pages/PurchaseOrder/PurchaseOrderManagement';
import CreatePurchaseOrder from './pages/PurchaseOrder/CreatePurchaseOrder';
import GRNManagement from './pages/GRN/GRNManagement';
import CreateGRN from './pages/GRN/CreateGRN';
import InvoiceManagement from './pages/Invoice/InvoiceManagement';
import CreateInvoice from './pages/Invoice/CreateInvoice';
import PaymentManagement from './pages/Payment/ProcessPayment';
import ProcessPayment from './pages/Payment/ProcessPayment';

// Sales & CRM Flow
import LeadManagement from './pages/CRM/LeadManagement';
import LeadForm from './pages/CRM/LeadForm';
import OpportunityManagement from './pages/CRM/OpportunityManagement';
import OpportunityForm from './pages/CRM/OpportunityForm';
import QuotationManagement from './pages/Sales/QuotationManagement';
import QuotationForm from './pages/Sales/QuotationForm';
import SalesOrderManagement from './pages/Sales/SalesOrderManagement';
import SalesOrderForm from './pages/Sales/SalesOrderForm';
import DeliveryManagement from './pages/Sales/DeliveryManagement';
import DeliveryNoteForm from './pages/Sales/DeliveryNoteForm';
import SalesInvoiceManagement from './pages/Sales/SalesInvoiceManagement';
import SalesInvoiceForm from './pages/Sales/SalesInvoiceForm';
import CustomerPaymentManagement from './pages/Sales/CustomerPaymentManagement';
import CustomerPaymentForm from './pages/Sales/CustomerPaymentForm';
import SalesAnalytics from './pages/Reports/SalesAnalytics';

// Finance Module
import ChartOfAccounts from './pages/Finance/ChartOfAccounts';
import JournalEntries from './pages/Finance/JournalEntries';
import TrialBalance from './pages/Finance/TrialBalance';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgetPasswordPage />} />

        {/* Dashboard Routes with Layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin Suite */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/roles" element={<RoleManagement />} />
          <Route path="/admin/departments" element={<DepartmentManagement />} />
          <Route path="/admin/suppliers" element={<SupplierManagement />} />
          <Route path="/admin/customers" element={<CustomerManagement />} />
          <Route path="/admin/items" element={<ItemMaster />} />
          <Route path="/admin/company" element={<CompanySettings />} />
          <Route path="/admin/financial-years" element={<FinancialYearManagement />} />

          {/* Requisition Flow */}
          <Route path="/prs" element={<PRManagement />} />
          <Route path="/prs/create" element={<RaisePR />} />
          <Route path="/prs/approvals" element={<ApprovalQueue />} />
          <Route path="/prs/:id" element={<PRDetails />} />

          {/* Procurement Lifecycle */}
          <Route path="/purchase-orders" element={<PurchaseOrderManagement />} />
          <Route path="/purchase-orders/create" element={<CreatePurchaseOrder />} />
          <Route path="/grns" element={<GRNManagement />} />
          <Route path="/grns/create" element={<CreateGRN />} />
          <Route path="/invoices" element={<InvoiceManagement />} />
          <Route path="/invoices/create" element={<CreateInvoice />} />
          <Route path="/payments" element={<PaymentManagement />} />
          <Route path="/payments/process" element={<ProcessPayment />} />

          {/* Sales & CRM Lifecycle */}
          <Route path="/leads" element={<LeadManagement />} />
          <Route path="/leads/create" element={<LeadForm />} />
          <Route path="/leads/edit/:id" element={<LeadForm />} />
          <Route path="/opportunities" element={<OpportunityManagement />} />
          <Route path="/opportunities/create" element={<OpportunityForm />} />
          <Route path="/opportunities/edit/:id" element={<OpportunityForm />} />
          <Route path="/quotations" element={<QuotationManagement />} />
          <Route path="/quotations/create" element={<QuotationForm />} />
          <Route path="/quotations/edit/:id" element={<QuotationForm />} />
          <Route path="/sales-orders" element={<SalesOrderManagement />} />
          <Route path="/sales-orders/create" element={<SalesOrderForm />} />
          <Route path="/sales-orders/edit/:id" element={<SalesOrderForm />} />
          <Route path="/delivery-notes" element={<DeliveryManagement />} />
          <Route path="/delivery-notes/create" element={<DeliveryNoteForm />} />
          <Route path="/delivery-notes/edit/:id" element={<DeliveryNoteForm />} />
          <Route path="/sales-invoices" element={<SalesInvoiceManagement />} />
          <Route path="/sales-invoices/create" element={<SalesInvoiceForm />} />
          <Route path="/sales-invoices/edit/:id" element={<SalesInvoiceForm />} />
          <Route path="/customer-payments" element={<CustomerPaymentManagement />} />
          <Route path="/customer-payments/create" element={<CustomerPaymentForm />} />
          <Route path="/customer-payments/edit/:id" element={<CustomerPaymentForm />} />

          {/* Reports & Analytics */}
          <Route path="/performance" element={<Performance />} />
          <Route path="/sales-analytics" element={<SalesAnalytics />} />

          {/* Finance Lifecycle */}
          <Route path="/chart-of-accounts" element={<ChartOfAccounts />} />
          <Route path="/journal-entries" element={<JournalEntries />} />
          <Route path="/trial-balance" element={<TrialBalance />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
