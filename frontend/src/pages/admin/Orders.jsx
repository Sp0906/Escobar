import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/admin';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const ORDER_STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  placed: 'badge-info', confirmed: 'badge-warning', processing: 'badge-warning',
  shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-error',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await getAllOrders({ status: filterStatus || undefined, page, limit: 15 });
      setOrders(data.orders);
      setTotalPages(data.pages);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filterStatus, page]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { orderStatus: newStatus });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <AdminLayout title="Manage Orders">
      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className={`filter-btn ${filterStatus === '' ? 'active' : ''}`} onClick={() => { setFilterStatus(''); setPage(1); }}>All</button>
        {ORDER_STATUSES.map((s) => (
          <button key={s} className={`filter-btn ${filterStatus === s ? 'active' : ''}`} onClick={() => { setFilterStatus(s); setPage(1); }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state"><h3>No orders found</h3></div>
      ) : (
        <>
          <div className="card orders-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{order.orderNumber}</td>
                    <td>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{order.user?.name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{order.user?.email}</p>
                    </td>
                    <td>{order.items.length} item{order.items.length > 1 ? 's' : ''}</td>
                    <td style={{ fontWeight: 700 }}>₹{order.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
              <span style={{ padding: '0.4rem 0.8rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Page {page} / {totalPages}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
