import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function PrintLayout() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="p-0">
        <Outlet />
      </main>
    </div>
  );
}

