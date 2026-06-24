import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProducts, createProduct, updateProduct, deleteProduct, syncProducts } from '../api/productApi';
import { getAllCategories } from '../api/categoryApi';
import type { Product } from '../types/product';
import type { Category } from '../types/category';
import { Plus, Edit2, Trash2, ArrowLeft, RefreshCw, X } from 'lucide-react';

const ManageProducts: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form fields state
  const [title, setTitle] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [image, setImage] = useState<string>('');
  const [stock, setStock] = useState<number>(100);
  const [description, setDescription] = useState<string>('');

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const prodData = await getAllProducts();
      setProducts(prodData);

      const catData = await getAllCategories();
      setCategories(catData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch catalog data.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setPrice(0);
    setCategoryId(categories.length > 0 ? categories[0].id : 0);
    setImage('');
    setStock(100);
    setDescription('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setPrice(product.price);
    setCategoryId(product.categoryId || (categories.length > 0 ? categories[0].id : 0));
    setImage(product.image);
    setStock(product.stock);
    setDescription(product.description);
    setError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!title.trim() || price <= 0 || categoryId === 0) {
      setError('Title, price, and category are required.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      title,
      price,
      categoryId,
      image: image.trim() || 'https://via.placeholder.com/150',
      stock,
      description,
      category: categories.find(c => c.id === categoryId)?.name || ''
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        setSuccess('Product updated successfully!');
      } else {
        await createProduct(payload);
        setSuccess('Product added successfully!');
      }
      setIsModalOpen(false);
      fetchAllData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save product.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setError('');
    try {
      await deleteProduct(id);
      setSuccess('Product deleted successfully!');
      setProducts(prev => prev.filter(p => p.id !== id));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete product.');
      }
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    setError('');
    try {
      await syncProducts();
      setSuccess('Products synced from API successfully!');
      fetchAllData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Sync failed.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <header className="products-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 className="products-title" style={{ fontSize: '2rem', fontWeight: 700 }}>Manage Products</h1>
          <p className="products-subtitle" style={{ color: 'var(--text-secondary)' }}>Add, edit, adjust stock, or delete catalog items</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className="btn logout-btn" 
            style={{ 
              borderColor: 'rgba(255,255,255,0.2)', 
              color: 'var(--text-secondary)', 
              width: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          <button 
            onClick={handleSync} 
            className="btn logout-btn" 
            style={{ 
              borderColor: '#a78bfa', 
              color: '#a78bfa', 
              width: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Sync from API
          </button>
          <button 
            onClick={openAddModal} 
            className="btn" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </header>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '24px' }}>
          <span>{success}</span>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container" style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner"></div>
          <p>Loading products list...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--card-border)' }}>
          <p>No products found in database.</p>
        </div>
      ) : (
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-main)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--card-border)' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Product</th>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Category</th>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Price</th>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Stock</th>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'middle' }}>
                  <td style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'white', padding: '4px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img src={product.image} alt={product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>{product.title}</span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.95rem' }}>{product.category}</td>
                  <td style={{ padding: '16px 20px', fontSize: '0.95rem', fontWeight: 600 }}>${product.price.toFixed(2)}</td>
                  <td style={{ padding: '16px 20px', fontSize: '0.95rem' }}>
                    <span style={{
                      color: product.stock <= 0 ? '#ef4444' : product.stock <= 10 ? '#f59e0b' : '#10b981',
                      fontWeight: 600
                    }}>
                      {product.stock} left
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => openEditModal(product)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: 'white' }}
                      >
                        <Edit2 className="w-4 h-4 text-blue-400" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-gradient)',
            border: '1px solid var(--card-border)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '540px',
            padding: '32px',
            position: 'relative'
          }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X className="w-6 h-6" />
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px' }}>
              {editingProduct ? 'Edit Product Details' : 'Add New Product'}
            </h2>

            {error && (
              <div className="alert alert-error" style={{ padding: '8px 12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.85rem' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Product Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. iPhone 15 Pro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="999.99"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Stock Count</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="100"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value))}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(parseInt(e.target.value))}
                  disabled={isSubmitting}
                  style={{
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--input-border)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    width: '100%',
                    outline: 'none',
                    fontSize: '1rem'
                  }}
                >
                  <option value={0}>Select a Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Image URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://example.com/product.jpg"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  placeholder="Enter details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn" disabled={isSubmitting} style={{ marginTop: '12px', height: '44px', cursor: 'pointer', fontWeight: 600 }}>
                {isSubmitting ? 'Saving changes...' : editingProduct ? 'Save Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
