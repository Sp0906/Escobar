import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJerseys } from '../api/jersey';
import { FiEdit3, FiShoppingCart, FiTruck, FiAward } from 'react-icons/fi';
import './Home.css';

export default function Home() {
  const [jerseys, setJerseys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  const categories = ['football', 'cricket', 'basketball', 'hockey', 'custom'];

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await getJerseys(category ? { category } : {});
        setJerseys(data.jerseys);
      } catch {
        setJerseys([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [category]);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Design Your <span className="highlight">Perfect Jersey</span></h1>
            <p>Customize every detail — name, number, colors, and logo. Get your unique jersey delivered to your doorstep.</p>
            <div className="hero-actions">
              <Link to="/ready-made" className="btn btn-primary btn-lg">Shop Ready-Made</Link>
              <a href="#templates" className="btn btn-outline btn-lg">Custom Design</a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            {[
              { icon: <FiEdit3 size={28} />, title: 'Design Online', desc: 'Use our powerful editor to create your dream jersey in minutes.' },
              { icon: <FiAward size={28} />, title: 'Premium Quality', desc: 'High-quality materials with vivid, long-lasting prints.' },
              { icon: <FiShoppingCart size={28} />, title: 'Easy Ordering', desc: 'Secure checkout with Razorpay. Fast and hassle-free.' },
              { icon: <FiTruck size={28} />, title: 'Fast Delivery', desc: 'Delivered anywhere in India within 7-10 business days.' },
            ].map((f) => (
              <div key={f.title} className="feature-card card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="templates-section" id="templates">
        <div className="container">
          <h2 className="section-title">Choose a Jersey Template</h2>
          <div className="category-filters">
            <button
              className={`filter-btn ${category === '' ? 'active' : ''}`}
              onClick={() => setCategory('')}
            >All</button>
            {categories.map((c) => (
              <button
                key={c}
                className={`filter-btn ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : jerseys.length === 0 ? (
            <div className="empty-state">
              <h3>No templates available yet</h3>
              <p>Check back soon — the admin is adding new designs!</p>
            </div>
          ) : (
            <div className="grid-3 templates-grid">
              {jerseys.map((jersey) => (
                <div key={jersey._id} className="jersey-card card">
                  <div className="jersey-img-wrapper">
                    <img src={jersey.imageUrl} alt={jersey.name} />
                    <span className="jersey-category badge badge-info">{jersey.category}</span>
                  </div>
                  <div className="jersey-info">
                    <h3>{jersey.name}</h3>
                    {jersey.description && <p className="jersey-desc">{jersey.description}</p>}
                    <div className="jersey-footer">
                      <span className="jersey-price">₹{jersey.basePrice.toFixed(2)}</span>
                      <Link to={`/designer/${jersey._id}`} className="btn btn-primary">
                        <FiEdit3 size={14} /> Customize
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
