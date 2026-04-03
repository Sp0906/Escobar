import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';
import { getJersey } from '../api/jersey';
import { saveDesign, getDesign, updateDesign, uploadLogo } from '../api/design';
import { addItemToCart } from '../store/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiSave, FiShoppingCart, FiTrash2, FiUpload, FiBold,
  FiItalic, FiAlignCenter, FiRotateCcw, FiCopy,
} from 'react-icons/fi';
import './Designer.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function Designer() {
  const { jerseyId, designId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const logoInputRef = useRef(null);

  const [jersey, setJersey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedObj, setSelectedObj] = useState(null);
  const [designName, setDesignName] = useState('My Jersey Design');

  // Text tool state
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(36);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  // Cart
  const [size, setSize] = useState('M');
  const [addingToCart, setAddingToCart] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState(designId || null);

  const fonts = ['Arial', 'Georgia', 'Impact', 'Verdana', 'Courier New', 'Times New Roman'];

  // Load jersey template
  useEffect(() => {
    const loadJersey = async () => {
      try {
        const { data } = await getJersey(jerseyId);
        setJersey(data.jersey);
      } catch {
        toast.error('Failed to load jersey template');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    loadJersey();
  }, [jerseyId, navigate]);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!jersey || !canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 600,
      height: 600,
      backgroundColor: '#f0f0f0',
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    // Load jersey background image
    fabric.Image.fromURL(
      jersey.imageUrl,
      (img) => {
        img.scaleToWidth(600);
        img.scaleToHeight(600);
        img.set({ selectable: false, evented: false, crossOrigin: 'anonymous' });
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      },
      { crossOrigin: 'anonymous' }
    );

    canvas.on('selection:created', (e) => setSelectedObj(e.selected[0]));
    canvas.on('selection:updated', (e) => setSelectedObj(e.selected[0]));
    canvas.on('selection:cleared', () => setSelectedObj(null));
    canvas.on('object:modified', () => setSelectedObj(canvas.getActiveObject()));

    // Load existing design if editing
    if (designId) {
      getDesign(designId).then(({ data }) => {
        canvas.loadFromJSON(data.design.canvasData, () => {
          canvas.renderAll();
          setDesignName(data.design.name);
        });
      }).catch(() => toast.error('Failed to load design'));
    }

    return () => canvas.dispose();
  }, [jersey, designId]);

  const addText = () => {
    if (!textInput.trim()) return;
    const text = new fabric.IText(textInput, {
      left: 200,
      top: 250,
      fontSize,
      fill: textColor,
      fontFamily,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      textAlign: 'center',
      editable: true,
    });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
    setTextInput('');
  };

  const addPlayerName = () => {
    const text = new fabric.IText('PLAYER NAME', {
      left: 150,
      top: 320,
      fontSize: 28,
      fill: textColor,
      fontFamily,
      fontWeight: 'bold',
      textAlign: 'center',
      editable: true,
      name: 'playerName',
    });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
  };

  const addNumber = () => {
    const text = new fabric.IText('10', {
      left: 220,
      top: 200,
      fontSize: 80,
      fill: textColor,
      fontFamily: 'Impact',
      fontWeight: 'bold',
      textAlign: 'center',
      editable: true,
      name: 'playerNumber',
    });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    try {
      const { data } = await uploadLogo(formData);
      fabric.Image.fromURL(data.url, (img) => {
        img.scaleToWidth(120);
        img.set({ left: 30, top: 30, crossOrigin: 'anonymous' });
        fabricRef.current.add(img);
        fabricRef.current.setActiveObject(img);
        fabricRef.current.renderAll();
      }, { crossOrigin: 'anonymous' });
    } catch {
      // Fallback: load from local file
      const reader = new FileReader();
      reader.onload = (ev) => {
        fabric.Image.fromURL(ev.target.result, (img) => {
          img.scaleToWidth(120);
          img.set({ left: 30, top: 30 });
          fabricRef.current.add(img);
          fabricRef.current.setActiveObject(img);
          fabricRef.current.renderAll();
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const updateSelectedText = (prop, value) => {
    const obj = fabricRef.current?.getActiveObject();
    if (!obj || obj.type !== 'i-text') return;
    obj.set(prop, value);
    fabricRef.current.renderAll();
  };

  const deleteSelected = () => {
    const obj = fabricRef.current?.getActiveObject();
    if (!obj) return;
    fabricRef.current.remove(obj);
    fabricRef.current.renderAll();
    setSelectedObj(null);
  };

  const duplicateSelected = () => {
    const obj = fabricRef.current?.getActiveObject();
    if (!obj) return;
    obj.clone((cloned) => {
      cloned.set({ left: obj.left + 20, top: obj.top + 20 });
      fabricRef.current.add(cloned);
      fabricRef.current.setActiveObject(cloned);
      fabricRef.current.renderAll();
    });
  };

  const clearCanvas = () => {
    fabricRef.current.remove(...fabricRef.current.getObjects());
    fabricRef.current.renderAll();
    setSelectedObj(null);
  };

  const getCanvasPreview = () =>
    fabricRef.current.toDataURL({ format: 'png', quality: 0.9, multiplier: 1 });

  const handleSave = useCallback(async () => {
    if (!user) { toast.error('Please login to save'); navigate('/login'); return; }
    setSaving(true);
    try {
      const canvasData = fabricRef.current.toJSON();
      const previewImageBase64 = getCanvasPreview();

      const objects = fabricRef.current.getObjects();
      const nameObj = objects.find((o) => o.name === 'playerName');
      const numObj = objects.find((o) => o.name === 'playerNumber');

      const payload = {
        jerseyId,
        name: designName,
        canvasData,
        previewImageBase64,
        customizations: {
          playerName: nameObj?.text || '',
          playerNumber: numObj?.text || '',
          textColor,
          fontSize,
        },
      };

      if (savedDesignId) {
        await updateDesign(savedDesignId, payload);
        toast.success('Design updated!');
        return savedDesignId;
      } else {
        const { data } = await saveDesign(payload);
        setSavedDesignId(data.design._id);
        toast.success('Design saved!');
        return data.design._id;
      }
    } catch {
      toast.error('Failed to save design');
      return null;
    } finally {
      setSaving(false);
    }
  }, [jerseyId, designName, textColor, fontSize, savedDesignId, user, navigate]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    let currentDesignId = savedDesignId;
    if (!currentDesignId) {
      toast('Saving design first...');
      currentDesignId = await handleSave();
    }
    if (!currentDesignId) return;
    setAddingToCart(true);
    try {
      await dispatch(addItemToCart({
        itemType: 'custom',
        designId: currentDesignId,
        jerseyId,
        quantity: 1,
        size,
      }));
      toast.success('Added to cart!');
      navigate('/cart');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="designer-page">
      <div className="designer-header">
        <div className="container">
          <div className="designer-header-inner">
            <div className="design-name-input">
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="form-control"
                placeholder="Design name..."
              />
            </div>
            <div className="designer-actions">
              <button className="btn btn-secondary" onClick={handleSave} disabled={saving}>
                <FiSave size={16} /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="btn btn-primary" onClick={handleAddToCart} disabled={addingToCart}>
                <FiShoppingCart size={16} /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container designer-layout">
        {/* Left Panel - Tools */}
        <aside className="tools-panel card">
          <h3 className="panel-title">Design Tools</h3>

          {/* Text */}
          <section className="tool-section">
            <h4>Add Text</h4>
            <input
              type="text"
              className="form-control"
              placeholder="Enter text..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addText()}
            />
            <button className="btn btn-secondary w-full mt-xs" onClick={addText}>Add Text</button>
            <div className="quick-add">
              <button className="btn btn-outline btn-sm" onClick={addPlayerName}>+ Name</button>
              <button className="btn btn-outline btn-sm" onClick={addNumber}>+ Number</button>
            </div>
          </section>

          {/* Text Style */}
          <section className="tool-section">
            <h4>Text Style</h4>
            <div className="form-group">
              <label>Font Family</label>
              <select
                className="form-control"
                value={fontFamily}
                onChange={(e) => { setFontFamily(e.target.value); updateSelectedText('fontFamily', e.target.value); }}
              >
                {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Font Size: {fontSize}px</label>
              <input
                type="range"
                min="10"
                max="120"
                value={fontSize}
                onChange={(e) => { setFontSize(Number(e.target.value)); updateSelectedText('fontSize', Number(e.target.value)); }}
                className="range-input"
              />
            </div>
            <div className="style-row">
              <div className="form-group">
                <label>Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => { setTextColor(e.target.value); updateSelectedText('fill', e.target.value); }}
                  className="color-picker"
                />
              </div>
              <div className="style-btns">
                <button
                  className={`btn btn-secondary btn-icon ${isBold ? 'active' : ''}`}
                  onClick={() => { setIsBold(!isBold); updateSelectedText('fontWeight', !isBold ? 'bold' : 'normal'); }}
                  title="Bold"
                ><FiBold /></button>
                <button
                  className={`btn btn-secondary btn-icon ${isItalic ? 'active' : ''}`}
                  onClick={() => { setIsItalic(!isItalic); updateSelectedText('fontStyle', !isItalic ? 'italic' : 'normal'); }}
                  title="Italic"
                ><FiItalic /></button>
              </div>
            </div>
          </section>

          {/* Logo */}
          <section className="tool-section">
            <h4>Upload Logo</h4>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleLogoUpload}
            />
            <button className="btn btn-secondary w-full" onClick={() => logoInputRef.current.click()}>
              <FiUpload size={14} /> Upload Logo / Image
            </button>
          </section>

          {/* Selected object controls */}
          {selectedObj && (
            <section className="tool-section">
              <h4>Selected Element</h4>
              <div className="selected-controls">
                <button className="btn btn-secondary btn-icon" onClick={duplicateSelected} title="Duplicate"><FiCopy /></button>
                <button className="btn btn-secondary btn-icon" onClick={clearCanvas} title="Clear all"><FiRotateCcw /></button>
                <button className="btn btn-danger btn-icon" onClick={deleteSelected} title="Delete"><FiTrash2 /></button>
              </div>
            </section>
          )}

          {/* Size & Cart */}
          <section className="tool-section">
            <h4>Select Size</h4>
            <div className="size-grid">
              {SIZES.map((s) => (
                <button
                  key={s}
                  className={`size-btn ${size === s ? 'active' : ''}`}
                  onClick={() => setSize(s)}
                >{s}</button>
              ))}
            </div>
          </section>
        </aside>

        {/* Canvas */}
        <main className="canvas-wrapper">
          <div className="canvas-container">
            <canvas ref={canvasRef} />
          </div>
          <p className="canvas-hint">Click elements to select, drag to move, handles to resize</p>
        </main>
      </div>
    </div>
  );
}
