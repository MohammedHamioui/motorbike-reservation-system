import React, { useEffect, useState } from 'react';
import Motorbikes from './pages/Motorbikes';
import Clients from './pages/Clients';
import Reservations from './pages/Reservations';
import Payments from './pages/Payments';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

function AuthStatus() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/user', {
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.name) setUser(data);
        else setUser(null);
      });
  }, []);

  const handleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const handleLogout = () => {
    window.location.href = "http://localhost:8080/logout";
  };

  if (user) {
    return (
      <>
        <span className="me-3">Welcome, {user.name}</span>
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
      </>
    );
  } else {
    return (
      <button className="btn btn-outline-light btn-sm" onClick={handleLogin}>
        Login with Google
      </button>
    );
  }
}

function Sidebar() {
  const location = useLocation();
  return (
    <div className="d-none d-md-block bg-white border-end vh-100 position-fixed" style={{ width: 220, top: 0, left: 0, zIndex: 1030 }}>
      <div className="pt-4">
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/motorbikes' ? 'active fw-bold' : ''}`} to="/motorbikes">Motorbikes</Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/clients' ? 'active fw-bold' : ''}`} to="/clients">Clients</Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/reservations' ? 'active fw-bold' : ''}`} to="/reservations">Reservations</Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${location.pathname === '/payments' ? 'active fw-bold' : ''}`} to="/payments">Payments</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <div className="p-4">
      <h4>{title}</h4>
      <p className="mt-2">This is the {title} page. Welcome to the Motorbike Reservation System where you can manage all your reservations for riding activities.</p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="d-flex" style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        <nav style={{ width: 220, background: '#fff', borderRight: '1px solid #eee' }}>
          <Sidebar />
        </nav>
        <div className="flex-grow-1">
          {/* Header */}
          <header style={{
            height: 64,
            background: '#1677ff',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}>
            <span className="navbar-brand fw-bold">Motorbike Reservation System</span>
            <div className="d-flex align-items-center ms-auto">
              <AuthStatus />
            </div>
          </header>
          {/* Main content */}
          <main style={{ padding: '2rem' }}>
            <div className="container-fluid">
              <div className="row">
                <div>
                  <Routes>
                    <Route path="/motorbikes" element={<Motorbikes />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/reservations" element={<Reservations />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="*" element={<Placeholder title="Dashboard" />} />
                  </Routes>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
} 