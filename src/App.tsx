import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import EquipmentDetail from "@/pages/EquipmentDetail";
import MyOrders from "@/pages/MyOrders";
import ReturnOrder from "@/pages/ReturnOrder";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminEquipment from "@/pages/admin/EquipmentManage";
import AdminOrders from "@/pages/admin/OrderManage";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requireRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/equipment" element={
          <ProtectedRoute requireRole="admin">
            <AdminEquipment />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute requireRole="admin">
            <AdminOrders />
          </ProtectedRoute>
        } />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/orders" element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } />
          <Route path="/orders/:id/return" element={
            <ProtectedRoute>
              <ReturnOrder />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
