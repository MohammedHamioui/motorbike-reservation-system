import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [details, setDetails] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [form, setForm] = useState({ reservationId: '', amount: '', paymentDate: '', status: '' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPayment, setEditPayment] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments');
      setPayments(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch payments');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
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
      await api.post('/payments', form);
      setForm({ reservationId: '', amount: '', paymentDate: '', status: '' });
      fetchPayments();
      setSnackbar({ open: true, message: 'Payment added!', severity: 'success' });
    } catch (err) {
      const msg = err.response?.data || 'Failed to add payment';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleShowDetails = async (id) => {
    try {
      const res = await api.get(`/payments/${id}/details`);
      setDetails(res.data);
      setDetailsOpen(true);
    } catch {
      setError('Failed to fetch payment details');
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setDetails(null);
  };

  const handleEditOpen = (payment) => {
    setEditPayment(payment);
    setForm({
      reservationId: payment.reservationId,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      status: payment.status
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditPayment(null);
  };

  const handleEditSave = async () => {
    try {
      await api.put(`/payments/${editPayment.id}`, form);
      fetchPayments();
      setSnackbar({ open: true, message: 'Payment updated!', severity: 'success' });
      handleEditClose();
    } catch (err) {
      const msg = err.response?.data || 'Failed to update payment';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/payments/${id}`);
      fetchPayments();
      setSnackbar({ open: true, message: 'Payment deleted!', severity: 'success' });
    } catch (err) {
      const msg = err.response?.data || 'Failed to delete payment';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  return (
    <div className="py-3">
      <h2 className="fw-bold mb-4">Payments</h2>
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
              <label className="form-label">Reservation ID</label>
              <input className="form-control" name="reservationId" value={form.reservationId} onChange={handleFormChange} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Amount</label>
              <input className="form-control" name="amount" value={form.amount} onChange={handleFormChange} type="number" required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Payment Date</label>
              <input className="form-control" name="paymentDate" value={form.paymentDate} onChange={handleFormChange} type="date" required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Status</label>
              <input className="form-control" name="status" value={form.status} onChange={handleFormChange} required />
            </div>
            <div className="col-md-1">
              <button type="submit" className="btn btn-primary w-100">Add</button>
            </div>
          </form>
        </div>
      </div>
      <div className="mb-3 d-flex justify-content-end">
        <input
          type="text"
          className="form-control w-auto"
          placeholder="Search by reservation, amount, date, or status..."
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
                <th>Reservation ID</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments
                .filter(p =>
                  p.reservationId.toString().toLowerCase().includes(search.toLowerCase()) ||
                  p.amount.toString().toLowerCase().includes(search.toLowerCase()) ||
                  p.paymentDate.toLowerCase().includes(search.toLowerCase()) ||
                  p.status.toLowerCase().includes(search.toLowerCase())
                )
                .map((p) => (
                  <tr key={p.id}>
                    <td>{p.reservationId}</td>
                    <td>€{p.amount}</td>
                    <td>{p.paymentDate}</td>
                    <td>{p.status}</td>
                    <td>
                      <button className="btn btn-outline-info btn-sm me-2" onClick={() => handleShowDetails(p.id)}>Details</button>
                      {user && <>
                        <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEditOpen(p)}>Edit</button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                      </>}
                    </td>
                  </tr>
                ))}
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
                <h5 className="modal-title">Payment Details</h5>
                <button type="button" className="btn-close" onClick={handleCloseDetails}></button>
              </div>
              <div className="modal-body">
                {details ? (
                  <div>
                    <h6>Payment</h6>
                    <p>Amount: {details.amount}</p>
                    <p>Status: {details.status}</p>
                    <p>Payment Date: {details.paymentDate}</p>
                    <hr />
                    <h6>Reservation</h6>
                    <p>Reservation Date: {details.reservationDetails?.reservationDate}</p>
                    <p>Start Date: {details.reservationDetails?.startDate}</p>
                    <p>End Date: {details.reservationDetails?.endDate}</p>
                    <hr />
                    <h6>Client</h6>
                    <p>Name: {details.reservationDetails?.client?.name}</p>
                    <p>Email: {details.reservationDetails?.client?.email}</p>
                    <p>Phone: {details.reservationDetails?.client?.phone}</p>
                    <p>Address: {details.reservationDetails?.client?.address}</p>
                    <hr />
                    <h6>Motorbike</h6>
                    <p>Make: {details.reservationDetails?.motorbike?.make}</p>
                    <p>Model: {details.reservationDetails?.motorbike?.model}</p>
                    <p>Year: {details.reservationDetails?.motorbike?.year}</p>
                    <p>Price: {details.reservationDetails?.motorbike?.price}</p>
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
                <h5 className="modal-title">Edit Payment</h5>
                <button type="button" className="btn-close" onClick={handleEditClose}></button>
              </div>
              <div className="modal-body">
                <form className="row g-2">
                  <div className="col-6">
                    <label className="form-label">Reservation ID</label>
                    <input className="form-control" name="reservationId" value={form.reservationId} onChange={handleFormChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Amount</label>
                    <input className="form-control" name="amount" value={form.amount} onChange={handleFormChange} type="number" required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Payment Date</label>
                    <input className="form-control" name="paymentDate" value={form.paymentDate} onChange={handleFormChange} type="date" required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Status</label>
                    <input className="form-control" name="status" value={form.status} onChange={handleFormChange} required />
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