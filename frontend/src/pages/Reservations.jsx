import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [details, setDetails] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [form, setForm] = useState({ clientId: '', motorbikeId: '', reservationDate: '', startDate: '', endDate: '' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editReservation, setEditReservation] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState([]);
  const [motorbikes, setMotorbikes] = useState([]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reservations');
      setReservations(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch reservations');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
    api.get('/clients').then(res => setClients(res.data)).catch(() => setClients([]));
    api.get('/motorbikes').then(res => setMotorbikes(res.data)).catch(() => setMotorbikes([]));
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
      await api.post('/reservations', form);
      setForm({ clientId: '', motorbikeId: '', reservationDate: '', startDate: '', endDate: '' });
      fetchReservations();
      setSnackbar({ open: true, message: 'Reservation added!', severity: 'success' });
    } catch (err) {
      const msg = err.response?.data || 'Failed to add reservation';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleShowDetails = async (id) => {
    try {
      const res = await api.get(`/reservations/${id}/details`);
      setDetails(res.data);
      setDetailsOpen(true);
    } catch {
      setError('Failed to fetch reservation details');
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setDetails(null);
  };

  const handleEditOpen = (reservation) => {
    setEditReservation(reservation);
    setForm({
      clientId: reservation.clientId,
      motorbikeId: reservation.motorbikeId,
      reservationDate: reservation.reservationDate,
      startDate: reservation.startDate,
      endDate: reservation.endDate
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditReservation(null);
  };

  const handleEditSave = async () => {
    try {
      await api.put(`/reservations/${editReservation.id}`, form);
      fetchReservations();
      setSnackbar({ open: true, message: 'Reservation updated!', severity: 'success' });
      handleEditClose();
    } catch (err) {
      const msg = err.response?.data || 'Failed to update reservation';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reservations/${id}`);
      fetchReservations();
      setSnackbar({ open: true, message: 'Reservation deleted!', severity: 'success' });
    } catch (err) {
      const msg = err.response?.data || 'Failed to delete reservation';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  return (
    <div className="py-3">
      <h2 className="fw-bold mb-4">Reservations</h2>
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
              <label className="form-label">Client ID</label>
              <input className="form-control" name="clientId" value={form.clientId} onChange={handleFormChange} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Motorbike ID</label>
              <input className="form-control" name="motorbikeId" value={form.motorbikeId} onChange={handleFormChange} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Reservation Date</label>
              <input className="form-control" name="reservationDate" value={form.reservationDate} onChange={handleFormChange} type="date" required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Start Date</label>
              <input className="form-control" name="startDate" value={form.startDate} onChange={handleFormChange} type="date" required />
            </div>
            <div className="col-md-2">
              <label className="form-label">End Date</label>
              <input className="form-control" name="endDate" value={form.endDate} onChange={handleFormChange} type="date" required />
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
          placeholder="Search by client, motorbike, or date..."
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
                <th>Client</th>
                <th>Motorbike</th>
                <th>Reservation Date</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations
                .filter(r => {
                  const client = clients.find(c => c.id === r.clientId);
                  const motorbike = motorbikes.find(m => m.id === r.motorbikeId);
                  return (
                    (client?.name || r.clientId.toString()).toLowerCase().includes(search.toLowerCase()) ||
                    (motorbike ? `${motorbike.make} ${motorbike.model}` : r.motorbikeId.toString()).toLowerCase().includes(search.toLowerCase()) ||
                    r.reservationDate.toLowerCase().includes(search.toLowerCase())
                  );
                })
                .map((r) => {
                  const client = clients.find(c => c.id === r.clientId);
                  const motorbike = motorbikes.find(m => m.id === r.motorbikeId);
                  return (
                    <tr key={r.id}>
                      <td>{client ? client.name : r.clientId}</td>
                      <td>{motorbike ? `${motorbike.make} ${motorbike.model}` : r.motorbikeId}</td>
                      <td>{r.reservationDate}</td>
                      <td>{r.startDate}</td>
                      <td>{r.endDate}</td>
                      <td>
                        <button className="btn btn-outline-info btn-sm me-2" onClick={() => handleShowDetails(r.id)}>Details</button>
                        {user && <>
                          <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEditOpen(r)}>Edit</button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(r.id)}>Delete</button>
                        </>}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
      {/* Details Modal */}
      {detailsOpen && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reservation Details</h5>
                <button type="button" className="btn-close" onClick={handleCloseDetails}></button>
              </div>
              <div className="modal-body">
                {details ? (
                  <div>
                    <h6>Client</h6>
                    <p>Name: {details.client?.name}</p>
                    <p>Email: {details.client?.email}</p>
                    <p>Phone: {details.client?.phone}</p>
                    <p>Address: {details.client?.address}</p>
                    <hr />
                    <h6>Motorbike</h6>
                    <p>Make: {details.motorbike?.make}</p>
                    <p>Model: {details.motorbike?.model}</p>
                    <p>Year: {details.motorbike?.year}</p>
                    <p>Price: {details.motorbike?.price}</p>
                    <hr />
                    <h6>Reservation</h6>
                    <p>Reservation ID: {details.id}</p>
                    <p>Reservation Date: {details.reservationDate}</p>
                    <p>Start Date: {details.startDate}</p>
                    <p>End Date: {details.endDate}</p>
                  </div>
                ) : (
                  <div>Loading...</div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDetails}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editDialogOpen && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Reservation</h5>
                <button type="button" className="btn-close" onClick={handleEditClose}></button>
              </div>
              <div className="modal-body">
                <form className="row g-2">
                  <div className="col-6">
                    <label className="form-label">Client ID</label>
                    <input className="form-control" name="clientId" value={form.clientId} onChange={handleFormChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Motorbike ID</label>
                    <input className="form-control" name="motorbikeId" value={form.motorbikeId} onChange={handleFormChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Reservation Date</label>
                    <input className="form-control" name="reservationDate" value={form.reservationDate} onChange={handleFormChange} type="date" required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Start Date</label>
                    <input className="form-control" name="startDate" value={form.startDate} onChange={handleFormChange} type="date" required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">End Date</label>
                    <input className="form-control" name="endDate" value={form.endDate} onChange={handleFormChange} type="date" required />
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