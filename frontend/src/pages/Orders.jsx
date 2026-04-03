import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserOrders } from '../api/order';
import { FiPackage, FiArrowRight } from 'react-icons/fi';
import './Orders.css';

const STATUS_COLORS = {
  placed: 'badge-info',
  confirmed: 'badge-warning',
  processing: 'badge-warning',
  shipped: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-error',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="page-title">My Orders</h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <FiPackage size={64} />
            <h3>No orders yet</h3>
            <p>Once you place an order it will appear here</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card card">
                <div className="order-card-header">
                  <div>
                    <span className="order-number">#{order.orderNumber}</span>
                    <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-default'}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>

                <div className="order-items-preview">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.previewImageUrl || item.readyMadeDesign?.imageUrl || '/placeholder-jersey.png'}
                      alt="jersey"
                      className="order-preview-img"
                    />
                  ))}
                  {order.items.length > 3 && (
                    <div className="more-items">+{order.items.length - 3}</div>
                  )}
                </div>

                <div className="order-card-footer">
                  <div>
                    <p className="order-total">₹{order.totalAmount.toFixed(2)}</p>
                    <p className="order-payment-status">
                      Payment: <span className={order.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}>{order.paymentStatus}</span>
                    </p>
                  </div>
                  <Link to={`/orders/${order._id}`} className="btn btn-secondary btn-sm">
                    View Details <FiArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
