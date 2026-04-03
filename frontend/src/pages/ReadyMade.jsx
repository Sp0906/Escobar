import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReadyMadeDesigns } from '../api/admin';
import { addItemToCart } from '../store/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import { FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ReadyMade.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ReadyMade() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    getReadyMadeDesigns()
      .then(({ data }) => setDesigns(data.designs.filter((d) => d.isActive)))
      .catch(() => setDesigns([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (design) => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    const size = selectedSizes[design._id] || 'M';
    try {
      await dispatch(addItemToCart({ itemType: 'readymade', readyMadeDesignId: design._id, quantity: 1, size }));
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="ready-made-page">
      <div className="container">
        <h1 className="page-title">Ready-Made Designs</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Browse our collection of professionally designed jerseys, ready to order.
        </p>

        {designs.length === 0 ? (
          <div className="empty-state">
            <h3>No ready-made designs available yet</h3>
            <p>Check back soon!</p>
          </div>
        ) : (
          <div className="grid-3">
            {designs.map((design) => (
              <div key={design._id} className="rm-card card">
                <div className="rm-img-wrapper">
                  <img src={design.imageUrl} alt={design.name} />
                  <span className="badge badge-info" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                    {design.category}
                  </span>
                </div>
                <div className="rm-info">
                  <h3>{design.name}</h3>
                  {design.description && <p className="rm-desc">{design.description}</p>}
                  <p className="rm-price">₹{design.price.toFixed(2)}</p>
                  <div className="size-select-row">
                    <select
                      className="form-control"
                      value={selectedSizes[design._id] || 'M'}
                      onChange={(e) => setSelectedSizes({ ...selectedSizes, [design._id]: e.target.value })}
                    >
                      {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={() => handleAddToCart(design)}>
                      <FiShoppingCart size={14} /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
