import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../store/cartSlice';
import { getRazorpayKey, createRazorpayOrder, verifyPayment } from '../api/payment';
import toast from 'react-hot-toast';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [processing, setProcessing] = useState(false);

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
  });

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const items = cart?.items || [];
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePayment = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    const { name, phone, street, city, state, pincode } = address;
    if (!name || !phone || !street || !city || !state || !pincode) {
      toast.error('Please fill all address fields');
      return;
    }

    setProcessing(true);
    try {
      const { data: keyData } = await getRazorpayKey();
      const { data: orderData } = await createRazorpayOrder({ amount: total });

      const options = {
        key: keyData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Escobar Jerseys',
        description: 'Custom Jersey Order',
        order_id: orderData.order.id,
        prefill: { name: address.name, contact: address.phone, email: user?.email },
        theme: { color: '#e94560' },
        handler: async (response) => {
          try {
            const orderItems = items.map((item) => ({
              itemType: item.itemType,
              design: item.design?._id || item.design,
              readyMadeDesign: item.readyMadeDesign?._id || item.readyMadeDesign,
              jersey: item.jersey?._id || item.jersey,
              quantity: item.quantity,
              size: item.size,
              price: item.price,
              previewImageUrl: item.previewImageUrl,
            }));

            const { data } = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: {
                items: orderItems,
                shippingAddress: address,
                subtotal,
                shippingCharge: shipping,
              },
            });

            dispatch(fetchCart());
            toast.success('Order placed successfully!');
            navigate(`/orders/${data.order._id}`);
          } catch {
            toast.error('Payment verification failed');
          } finally {
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error('Payment initialization failed');
      setProcessing(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Checkout</h1>
        <form onSubmit={handlePayment} className="checkout-layout">
          {/* Shipping Address */}
          <div className="checkout-form card">
            <h2>Shipping Address</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input name="name" className="form-control" value={address.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input name="phone" className="form-control" value={address.phone} onChange={handleChange} required />
              </div>
              <div className="form-group span-2">
                <label>Street Address *</label>
                <input name="street" className="form-control" value={address.street} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input name="city" className="form-control" value={address.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input name="state" className="form-control" value={address.state} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Pincode *</label>
                <input name="pincode" className="form-control" value={address.pincode} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2>Order Summary</h2>
              <div className="checkout-items">
                {items.map((item) => (
                  <div key={item._id} className="checkout-item">
                    <img
                      src={item.previewImageUrl || item.readyMadeDesign?.imageUrl || '/placeholder-jersey.png'}
                      alt="jersey"
                    />
                    <div>
                      <p className="item-name">{item.itemType === 'custom' ? item.design?.name || 'Custom Design' : item.readyMadeDesign?.name}</p>
                      <p className="item-detail">Qty: {item.quantity} &bull; Size: {item.size}</p>
                    </div>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="checkout-totals">
                <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                <div className="summary-row total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={processing || items.length === 0}>
                {processing ? 'Processing...' : `Pay ₹${total.toFixed(2)} with Razorpay`}
              </button>
              <p className="secure-note">🔒 Secured by Razorpay</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
