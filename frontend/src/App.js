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
import PRManagement from './pages/PR/PRManagement';
import RaisePR from './pages/PR/RaisePR';
import PRDetails from './pages/PR/PRDetails';
import ApprovalQueue from './pages/PR/ApprovalQueue';
import Performance from './pages/Reports/Performance';
import DashboardLayout from './components/Layout/DashboardLayout';

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
          <Route path="/admin/items" element={<ItemMaster />} />

          {/* Requisition Flow */}
          <Route path="/prs" element={<PRManagement />} />
          <Route path="/prs/create" element={<RaisePR />} />
          <Route path="/prs/approvals" element={<ApprovalQueue />} />
          <Route path="/prs/:id" element={<PRDetails />} />

          {/* Reports & Analytics */}
          <Route path="/performance" element={<Performance />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
