import { NavLink } from 'react-router-dom';
import { FiGrid, FiImage, FiList, FiPackage } from 'react-icons/fi';
import './Admin.css';

const navLinks = [
  { to: '/admin', label: 'Dashboard', icon: <FiGrid size={16} />, end: true },
  { to: '/admin/templates', label: 'Templates', icon: <FiImage size={16} /> },
  { to: '/admin/orders', label: 'Orders', icon: <FiList size={16} /> },
  { to: '/admin/ready-made', label: 'Ready-Made', icon: <FiPackage size={16} /> },
];

export default function AdminLayout({ title, children }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar card">
        <h2 className="sidebar-title">Admin Panel</h2>
        <nav className="admin-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              {link.icon} {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="admin-content">
        <h1 className="page-title">{title}</h1>
        {children}
      </main>
    </div>
  );
}
