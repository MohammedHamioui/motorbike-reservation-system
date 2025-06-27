import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Motorbikes() {
  const [motorbikes, setMotorbikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ make: '', model: '', year: '', price: '' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMotorbike, setEditMotorbike] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  const fetchMotorbikes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/motorbikes');
      setMotorbikes(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch motorbikes');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMotorbikes();
    fetch('http://localhost:8080/user', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.name) setUser(data);
        else setUser(null);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      await api.post('/motorbikes', form);
      setForm({ make: '', model: '', year: '', price: '' });
      fetchMotorbikes();
      setSnackbar({ open: true, message: 'Motorbike added!', severity: 'success' });
    } catch {
      setError('Failed to add motorbike');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/motorbikes/${id}`);
      fetchMotorbikes();
      setSnackbar({ open: true, message: 'Motorbike deleted!', severity: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete motorbike';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleEditOpen = (motorbike) => {
    setEditMotorbike(motorbike);
    setForm({ make: motorbike.make, model: motorbike.model, year: motorbike.year, price: motorbike.price });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditMotorbike(null);
  };

  const handleEditSave = async () => {
    try {
      await api.put(`/motorbikes/${editMotorbike.id}`, form);
      fetchMotorbikes();
      setSnackbar({ open: true, message: 'Motorbike updated!', severity: 'success' });
      handleEditClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update motorbike';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  return (
    <div className="py-3">
      <h2 className="fw-bold mb-4">Motorbikes</h2>
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
            <div className="col-md-3">
              <label className="form-label">Make</label>
              <input className="form-control" name="make" value={form.make} onChange={handleChange} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Model</label>
              <input className="form-control" name="model" value={form.model} onChange={handleChange} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Year</label>
              <input className="form-control" name="year" value={form.year} onChange={handleChange} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Price</label>
              <input className="form-control" name="price" value={form.price} onChange={handleChange} type="number" required />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">Add</button>
            </div>
          </form>
        </div>
      </div>
      <div className="mb-3 d-flex justify-content-end">
        <input
          type="text"
          className="form-control w-auto"
          placeholder="Search by make or model..."
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
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {motorbikes
                .filter(m =>
                  m.make.toLowerCase().includes(search.toLowerCase()) ||
                  m.model.toLowerCase().includes(search.toLowerCase())
                )
                .map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.make}</td>
                    <td>{m.model}</td>
                    <td>{m.year}</td>
                    <td>€{m.price}</td>
                    <td>
                      {user && (
                        <>
                          <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEditOpen(m)}>Edit</button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(m.id)}>Delete</button>
                        </>
                      )}
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
                <h5 className="modal-title">Edit Motorbike</h5>
                <button type="button" className="btn-close" onClick={handleEditClose}></button>
              </div>
              <div className="modal-body">
                <form className="row g-2">
                  <div className="col-6">
                    <label className="form-label">Make</label>
                    <input className="form-control" name="make" value={form.make} onChange={handleChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Model</label>
                    <input className="form-control" name="model" value={form.model} onChange={handleChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Year</label>
                    <input className="form-control" name="year" value={form.year} onChange={handleChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Price</label>
                    <input className="form-control" name="price" value={form.price} onChange={handleChange} type="number" required />
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