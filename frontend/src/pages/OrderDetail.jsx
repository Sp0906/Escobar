import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder, cancelOrder } from '../api/order';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiXCircle } from 'react-icons/fi';

const STATUS_COLORS = {
  placed: 'badge-info', confirmed: 'badge-warning', processing: 'badge-warning',
  shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-error',
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getOrder(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => { toast.error('Order not found'); navigate('/orders'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await cancelOrder(id, 'Cancelled by customer');
      setOrder(data.order);
      toast.success('Order cancelled');
    } catch {
      toast.error('Could not cancel order at this stage');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!order) return null;

  const canCancel = ['placed', 'confirmed'].includes(order.orderStatus);

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }} onClick={() => navigate('/orders')}>
          <FiArrowLeft size={14} /> Back to Orders
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
          {/* Items */}
          <div>
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem' }}>Order #{order.orderNumber}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                </div>
                <span className={`badge ${STATUS_COLORS[order.orderStatus]}`}>{order.orderStatus}</span>
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                  <img src={item.previewImageUrl || item.readyMadeDesign?.imageUrl} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius)', background: 'var(--secondary)' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.3rem' }}>{item.itemType === 'custom' ? item.design?.name || 'Custom Design' : item.readyMadeDesign?.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Size: {item.size} &bull; Qty: {item.quantity}</p>
                    {item.playerName && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Name: {item.playerName} &bull; #{item.playerNumber}</p>}
                  </div>
                  <p style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Status History */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Status History</h3>
              {order.statusHistory.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <p style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.9rem' }}>{s.status}</p>
                    {s.note && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.note}</p>}
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(s.updatedAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Shipping Address</h3>
              <p style={{ fontWeight: 600 }}>{order.shippingAddress.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
                Phone: {order.shippingAddress.phone}
              </p>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Payment Info</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                <span>{order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span>Total</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Payment ID: {order.razorpayPaymentId || 'N/A'}
              </p>
            </div>

            {canCancel && (
              <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCancel} disabled={cancelling}>
                <FiXCircle size={14} /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
