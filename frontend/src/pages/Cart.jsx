import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateItem, removeItem, emptyCart } from '../store/cartSlice';
import { FiTrash2, FiShoppingBag, FiArrowRight, FiMinus, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Cart.css';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading } = useSelector((state) => state.cart);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const handleQtyChange = (itemId, qty) => {
    if (qty < 1) return;
    dispatch(updateItem({ itemId, data: { quantity: qty } }));
  };

  const handleRemove = (itemId) => {
    dispatch(removeItem(itemId));
    toast.success('Item removed');
  };

  const handleClear = () => {
    dispatch(emptyCart());
    toast.success('Cart cleared');
  };

  const items = cart?.items || [];
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="empty-state">
            <FiShoppingBag size={64} />
            <h3>Your cart is empty</h3>
            <p>Add some custom jerseys to get started</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Templates</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              <div className="cart-header">
                <span>{items.length} item{items.length > 1 ? 's' : ''}</span>
                <button className="btn btn-danger btn-sm" onClick={handleClear}>
                  <FiTrash2 size={13} /> Clear Cart
                </button>
              </div>

              {items.map((item) => (
                <div key={item._id} className="cart-item card">
                  <img
                    src={item.previewImageUrl || item.readyMadeDesign?.imageUrl || '/placeholder-jersey.png'}
                    alt="jersey"
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <h3>{item.itemType === 'custom' ? item.design?.name || 'Custom Design' : item.readyMadeDesign?.name || 'Ready-Made Design'}</h3>
                    <p className="item-meta">Size: <strong>{item.size}</strong> &bull; Type: <strong>{item.itemType}</strong></p>
                    <p className="item-price">₹{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-control">
                      <button onClick={() => handleQtyChange(item._id, item.quantity - 1)}><FiMinus size={12} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQtyChange(item._id, item.quantity + 1)}><FiPlus size={12} /></button>
                    </div>
                    <p className="item-total">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <button className="btn btn-danger btn-icon" onClick={() => handleRemove(item._id)}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary card">
              <h2>Order Summary</h2>
              <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              {shipping > 0 && <p className="shipping-note">Free shipping on orders above ₹999</p>}
              <div className="summary-row total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
              <button className="btn btn-primary w-full" onClick={() => navigate('/checkout')}>
                Proceed to Checkout <FiArrowRight size={16} />
              </button>
              <Link to="/" className="btn btn-secondary w-full" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
