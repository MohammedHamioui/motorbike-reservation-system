import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clients');
      setClients(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch clients');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
    fetch('http://localhost:8080/user', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.name) setUser(data);
        else setUser(null);
      });
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      await api.post('/clients', form);
      setForm({ name: '', email: '', phone: '', address: '' });
      fetchClients();
      setSnackbar({ open: true, message: 'Client added!', severity: 'success' });
    } catch (err) {
      const msg = err.response?.data || 'Failed to add client';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleEditOpen = (client) => {
    setEditClient(client);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditClient(null);
  };

  const handleEditSave = async () => {
    try {
      await api.put(`/clients/${editClient.id}`, form);
      fetchClients();
      setSnackbar({ open: true, message: 'Client updated!', severity: 'success' });
      handleEditClose();
    } catch (err) {
      const msg = err.response?.data || 'Failed to update client';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
      setSnackbar({ open: true, message: 'Client deleted!', severity: 'success' });
    } catch (err) {
      const msg = err.response?.data || 'Failed to delete client';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  return (
    <div className="py-3">
      <h2 className="fw-bold mb-4">Clients</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {snackbar.open && (
        <div className={`alert alert-${snackbar.severity} alert-dismissible fade show`} role="alert">
          {snackbar.message}
          <button type="button" className="btn-close" onClick={() => setSnackbar({ ...snackbar, open: false })}></button>
        </div>
      )}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form className="row g-2 align-items-end" onSubmit={e => { e.preventDefault(); handleAdd(); }}>
            <div className="col-md-2">
              <label className="form-label">Name</label>
              <input className="form-control" name="name" value={form.name} onChange={handleFormChange} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Email</label>
              <input className="form-control" name="email" value={form.email} onChange={handleFormChange} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Phone</label>
              <input className="form-control" name="phone" value={form.phone} onChange={handleFormChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Address</label>
              <input className="form-control" name="address" value={form.address} onChange={handleFormChange} required />
            </div>
            <div className="col-md-2 d-grid">
              <label className="form-label" style={{ visibility: 'hidden' }}>Add</label>
              <button type="submit" className="btn btn-primary">Add</button>
            </div>
          </form>
        </div>
      </div>
      <div className="mb-3 d-flex justify-content-end">
        <input
          type="text"
          className="form-control w-auto"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ minWidth: 250 }}
        />
      </div>
      {loading ? (
        <div className="d-flex justify-content-center my-5"><div className="spinner-border" role="status"></div></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients
                .filter(c =>
                  c.name.toLowerCase().includes(search.toLowerCase()) ||
                  c.email.toLowerCase().includes(search.toLowerCase()) ||
                  c.phone.toLowerCase().includes(search.toLowerCase())
                )
                .map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>{c.address}</td>
                    <td>
                      {user && <>
                        <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEditOpen(c)}>Edit</button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                      </>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Edit Modal */}
      {editDialogOpen && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Client</h5>
                <button type="button" className="btn-close" onClick={handleEditClose}></button>
              </div>
              <div className="modal-body">
                <form className="row g-2">
                  <div className="col-6">
                    <label className="form-label">Name</label>
                    <input className="form-control" name="name" value={form.name} onChange={handleFormChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Email</label>
                    <input className="form-control" name="email" value={form.email} onChange={handleFormChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Phone</label>
                    <input className="form-control" name="phone" value={form.phone} onChange={handleFormChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Address</label>
                    <input className="form-control" name="address" value={form.address} onChange={handleFormChange} required />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleEditClose}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleEditSave}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 