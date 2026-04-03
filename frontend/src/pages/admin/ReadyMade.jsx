import { useEffect, useRef, useState } from 'react';
import { getReadyMadeDesigns, uploadReadyMade, deleteReadyMade } from '../../api/admin';
import { FiUpload, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const CATEGORIES = ['football', 'cricket', 'basketball', 'hockey', 'custom'];

export default function AdminReadyMade() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const [form, setForm] = useState({ name: '', description: '', category: 'football', price: '' });
  const [preview, setPreview] = useState(null);

  const fetchAll = async () => {
    try {
      const { data } = await getReadyMadeDesigns();
      setDesigns(data.designs);
    } catch {
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileRef.current.files[0]) { toast.error('Please select an image'); return; }
    if (!form.name || !form.price) { toast.error('Please fill name and price'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', fileRef.current.files[0]);
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('price', form.price);
      await uploadReadyMade(formData);
      toast.success('Design uploaded!');
      setForm({ name: '', description: '', category: 'football', price: '' });
      setPreview(null);
      fileRef.current.value = '';
      fetchAll();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this design?')) return;
    try {
      await deleteReadyMade(id);
      toast.success('Design deleted');
      setDesigns((prev) => prev.filter((d) => d._id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <AdminLayout title="Ready-Made Designs">
      {/* Upload Form */}
      <div className="card upload-form">
        <h2>Upload New Ready-Made Design</h2>
        <form onSubmit={handleUpload}>
          <div className="file-drop-area" onClick={() => fileRef.current.click()}>
            {preview ? (
              <img src={preview} alt="preview" style={{ maxHeight: 200, borderRadius: 8 }} />
            ) : (
              <>
                <FiUpload size={32} style={{ marginBottom: '0.5rem', color: 'var(--accent)' }} />
                <p>Click to select design image</p>
              </>
            )}
            <input type="file" ref={fileRef} accept="image/*" onChange={handleFileChange} />
          </div>
          <div className="upload-grid">
            <div className="form-group">
              <label>Design Name *</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Price (₹) *</label>
              <input type="number" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            <FiUpload size={14} /> {uploading ? 'Uploading...' : 'Upload Design'}
          </button>
        </form>
      </div>

      {/* Designs Grid */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : designs.length === 0 ? (
        <div className="empty-state"><h3>No ready-made designs uploaded yet</h3></div>
      ) : (
        <div className="admin-design-grid">
          {designs.map((design) => (
            <div key={design._id} className="card admin-design-card">
              <img src={design.imageUrl} alt={design.name} className="admin-design-img" />
              <div className="admin-design-info">
                <h4>{design.name}</h4>
                <p>₹{design.price} &bull; {design.category}</p>
                {design.description && <p style={{ marginTop: '0.2rem' }}>{design.description}</p>}
                <div className="admin-design-footer">
                  <span className={`badge ${design.isActive ? 'badge-success' : 'badge-error'}`}>
                    {design.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(design._id)}>
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
