import { Navigate, Route, Routes } from "react-router-dom";
import SiteLayout from "./components/layout/SiteLayout";
import DashboardShell from "./components/layout/DashboardShell";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import HomePage from "./pages/public/HomePage";
import AboutPage from "./pages/public/AboutPage";
import ServicesPage from "./pages/public/ServicesPage";
import ServiceDetailPage from "./pages/public/ServiceDetailPage";
import TestingProcessPage from "./pages/public/TestingProcessPage";
import RateListPage from "./pages/public/RateListPage";
import SampleGuidelinesPage from "./pages/public/SampleGuidelinesPage";
import ReportVerificationPage from "./pages/public/ReportVerificationPage";
import BlogListPage from "./pages/public/BlogListPage";
import BlogDetailPage from "./pages/public/BlogDetailPage";
import ContactPage from "./pages/public/ContactPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import UserDashboardPage from "./pages/user/UserDashboardPage";
import NewRequestPage from "./pages/user/NewRequestPage";
import MyRequestsPage from "./pages/user/MyRequestsPage";
import PaymentSuccessPage from "./pages/user/PaymentSuccessPage";
import PdfDownloadPage from "./pages/user/PdfDownloadPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminRequestsPage from "./pages/admin/AdminRequestsPage";
import AdminServicesPage from "./pages/admin/AdminServicesPage";
import AdminRatesPage from "./pages/admin/AdminRatesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminEnquiriesPage from "./pages/admin/AdminEnquiriesPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminBlogsPage from "./pages/admin/AdminBlogsPage";
import GoogleAnalytics from "./components/GoogleAnalytics";

function App() {
  return (
    <>
      <GoogleAnalytics />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/testing-process" element={<TestingProcessPage />} />
          <Route path="/rate-list" element={<RateListPage />} />
          <Route path="/sample-guidelines" element={<SampleGuidelinesPage />} />
          <Route path="/report-verification" element={<ReportVerificationPage />} />
          <Route path="/blogs" element={<BlogListPage />} />
          <Route path="/blogs/:slug" element={<BlogDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["user"]}>
              <DashboardShell variant="user" />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboardPage />} />
          <Route path="new-request" element={<NewRequestPage />} />
          <Route path="requests" element={<MyRequestsPage />} />
          <Route path="payment-success/:requestId" element={<PaymentSuccessPage />} />
          <Route path="requests/:requestId/documents" element={<PdfDownloadPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardShell variant="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="requests" element={<AdminRequestsPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="rates" element={<AdminRatesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="enquiries" element={<AdminEnquiriesPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="blogs" element={<AdminBlogsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
