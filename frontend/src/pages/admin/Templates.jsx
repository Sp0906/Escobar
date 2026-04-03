import { useEffect, useRef, useState } from 'react';
import { getJerseys, uploadJerseyTemplate, deleteJersey, updateJersey } from '../../api/jersey';
import { FiUpload, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const CATEGORIES = ['football', 'cricket', 'basketball', 'hockey', 'custom'];

export default function AdminTemplates() {
  const [jerseys, setJerseys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const [form, setForm] = useState({ name: '', description: '', category: 'football', basePrice: '' });
  const [preview, setPreview] = useState(null);

  const fetchAll = async () => {
    try {
      // Fetch all (including inactive) - use admin route if needed; for now reuse public endpoint
      const { data } = await getJerseys({});
      setJerseys(data.jerseys);
    } catch {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileRef.current.files[0]) { toast.error('Please select an image'); return; }
    if (!form.name || !form.basePrice) { toast.error('Please fill name and price'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', fileRef.current.files[0]);
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('basePrice', form.basePrice);
      await uploadJerseyTemplate(formData);
      toast.success('Template uploaded!');
      setForm({ name: '', description: '', category: 'football', basePrice: '' });
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
    if (!window.confirm('Delete this template?')) return;
    try {
      await deleteJersey(id);
      toast.success('Template deleted');
      setJerseys((prev) => prev.filter((j) => j._id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  const toggleActive = async (jersey) => {
    try {
      await updateJersey(jersey._id, { isActive: !jersey.isActive });
      setJerseys((prev) => prev.map((j) => j._id === jersey._id ? { ...j, isActive: !j.isActive } : j));
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <AdminLayout title="Jersey Templates">
      {/* Upload Form */}
      <div className="card upload-form">
        <h2>Upload New Template</h2>
        <form onSubmit={handleUpload}>
          <div
            className="file-drop-area"
            onClick={() => fileRef.current.click()}
          >
            {preview ? (
              <img src={preview} alt="preview" style={{ maxHeight: 200, borderRadius: 8 }} />
            ) : (
              <>
                <FiUpload size={32} style={{ marginBottom: '0.5rem', color: 'var(--accent)' }} />
                <p>Click to select jersey image</p>
                <p style={{ fontSize: '0.75rem' }}>PNG, JPG, SVG up to 10MB</p>
              </>
            )}
            <input type="file" ref={fileRef} accept="image/*" onChange={handleFileChange} />
          </div>
          <div className="upload-grid">
            <div className="form-group">
              <label>Template Name *</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Base Price (₹) *</label>
              <input type="number" className="form-control" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} required min="0" />
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
            <FiUpload size={14} /> {uploading ? 'Uploading...' : 'Upload Template'}
          </button>
        </form>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : jerseys.length === 0 ? (
        <div className="empty-state"><h3>No templates uploaded yet</h3></div>
      ) : (
        <div className="admin-design-grid">
          {jerseys.map((jersey) => (
            <div key={jersey._id} className="card admin-design-card">
              <img src={jersey.imageUrl} alt={jersey.name} className="admin-design-img" />
              <div className="admin-design-info">
                <h4>{jersey.name}</h4>
                <p>₹{jersey.basePrice} &bull; {jersey.category}</p>
                <div className="admin-design-footer">
                  <button
                    className={`btn btn-sm ${jersey.isActive ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => toggleActive(jersey)}
                    title={jersey.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {jersey.isActive ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                    {jersey.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(jersey._id)}>
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
