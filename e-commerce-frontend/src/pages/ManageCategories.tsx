import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../api/categoryApi';
import type { Category } from '../types/category';
import { Plus, Edit2, Trash2, ArrowLeft, X } from 'lucide-react';

const ManageCategories: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form fields state
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchCategoriesList = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch categories list.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!name.trim()) {
      setError('Category name is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, name, description);
        setSuccess('Category updated successfully!');
      } else {
        await createCategory(name, description);
        setSuccess('Category created successfully!');
      }
      setIsModalOpen(false);
      fetchCategoriesList();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save category.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this category? Products inside this category might lose their references.')) return;
    setError('');
    try {
      await deleteCategory(id);
      setSuccess('Category deleted successfully!');
      setCategories(prev => prev.filter(c => c.id !== id));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete category.');
      }
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <header className="products-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 className="products-title" style={{ fontSize: '2rem', fontWeight: 700 }}>Manage Categories</h1>
          <p className="products-subtitle" style={{ color: 'var(--text-secondary)' }}>Add, edit, or delete store categories</p>
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
            onClick={openAddModal} 
            className="btn" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus className="w-4 h-4" />
            Add Category
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
          <p>Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--card-border)' }}>
          <p>No categories found.</p>
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
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Category Name</th>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Description</th>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'middle' }}>
                  <td style={{ padding: '16px 20px', fontSize: '0.95rem', fontWeight: 600 }}>{cat.name}</td>
                  <td style={{ padding: '16px 20px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{cat.description || 'No description provided'}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => openEditModal(cat)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: 'white' }}
                      >
                        <Edit2 className="w-4 h-4 text-blue-400" />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
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
            maxWidth: '440px',
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
              {editingCategory ? 'Edit Category Details' : 'Add New Category'}
            </h2>

            {error && (
              <div className="alert alert-error" style={{ padding: '8px 12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.85rem' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Smart Home"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                {isSubmitting ? 'Saving changes...' : editingCategory ? 'Save Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;
