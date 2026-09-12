import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home/home';
import Career from './pages/career/Career';
import Apply from './pages/career/Apply';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function Placeholder({ name }) {
  return (
    <div className="placeholder">
      <h1>{name} page — coming next</h1>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <Header />
      {/* Header is position: fixed, so it no longer occupies space in the
          normal flow. This padding-top (matching the header's height)
          keeps page content from starting underneath it. */}
      <main style={{ paddingTop: '78px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Placeholder name="About" />} />
          <Route path="/services" element={<Placeholder name="Services" />} />
          <Route path="/how-we-work" element={<Placeholder name="How We Work" />} />
          <Route path="/expertise" element={<Placeholder name="Expertise" />} />
          <Route path="/industries" element={<Placeholder name="Industries" />} />
          <Route path="/why-bharyat" element={<Placeholder name="Why Bharyat" />} />
          <Route path="/team" element={<Placeholder name="Team" />} />
          <Route path="/trust" element={<Placeholder name="Trust" />} />
          <Route path="/contact" element={<Placeholder name="Contact" />} />

          {/* ---------- Careers ---------- */}
          <Route path="/careers" element={<Career />} />
          <Route path="/careers/apply/:id" element={<Apply />} />

          {/* ---------- Admin (not linked from public nav) ---------- */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}