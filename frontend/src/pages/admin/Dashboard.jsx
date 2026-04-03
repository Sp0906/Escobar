import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../api/admin';
import { FiPackage, FiUsers, FiDollarSign, FiClock, FiImage, FiList } from 'react-icons/fi';
import AdminLayout from './AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: 'Total Orders', value: stats.totalOrders, icon: <FiPackage size={24} />, color: '#3b82f6' },
        { label: 'Total Users', value: stats.totalUsers, icon: <FiUsers size={24} />, color: '#10b981' },
        { label: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(2)}`, icon: <FiDollarSign size={24} />, color: '#e94560' },
        { label: 'Pending Orders', value: stats.pendingOrders, icon: <FiClock size={24} />, color: '#f59e0b' },
      ]
    : [];

  const quickLinks = [
    { to: '/admin/templates', icon: <FiImage size={20} />, label: 'Jersey Templates', desc: 'Upload and manage templates' },
    { to: '/admin/orders', icon: <FiList size={20} />, label: 'Manage Orders', desc: 'View and update order statuses' },
    { to: '/admin/ready-made', icon: <FiPackage size={20} />, label: 'Ready-Made Designs', desc: 'Upload pre-designed jerseys' },
  ];

  return (
    <AdminLayout title="Admin Dashboard">
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <>
          <div className="admin-stats-grid">
            {statCards.map((card) => (
              <div key={card.label} className="stat-card card">
                <div className="stat-icon" style={{ color: card.color }}>{card.icon}</div>
                <div>
                  <p className="stat-value">{card.value}</p>
                  <p className="stat-label">{card.label}</p>
                </div>
              </div>
            ))}
          </div>
          <h2 className="section-title" style={{ marginTop: '2rem' }}>Quick Actions</h2>
          <div className="quick-links-grid">
            {quickLinks.map((link) => (
              <Link key={link.to} to={link.to} className="quick-link-card card">
                <div className="quick-link-icon">{link.icon}</div>
                <div>
                  <h3>{link.label}</h3>
                  <p>{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
