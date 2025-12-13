// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TenantDashboard from "./pages/TenantDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import PropertyDetails from "./pages/PropertyDetails";
import BookingForm from "./pages/BookingForm";
import LeaseTerms from "./pages/LeaseTerms";
import Agreement from "./pages/Agreement";
import PaymentPage from "./pages/PaymentPage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/tenant/dashboard" element={<TenantDashboard />} />
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/booking/:propertyId" element={<BookingForm />} />
        <Route path="/lease-terms/:bookingId" element={<LeaseTerms />} />
        <Route path="/agreement/:bookingId" element={<Agreement />} />
        <Route path="/payment/:bookingId" element={<PaymentPage />} />
      </Routes>
    </Router>
  );
}

export default App;