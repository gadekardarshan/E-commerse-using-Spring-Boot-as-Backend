import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWishlist, removeFromWishlist } from '../api/wishlistApi';
import { addToCart } from '../api/cartApi';
import type { Product } from '../types/product';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';

const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const fetchWishlist = async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await getWishlist(user.id);
      setProducts(data.products);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch wishlist.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const handleRemove = async (productId: number) => {
    if (!user) return;
    try {
      await removeFromWishlist(user.id, productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setSuccess('Item removed from wishlist.');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to remove item.');
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!user) return;
    setAddingToCartId(productId);
    setError('');
    try {
      await addToCart(user.id, productId, 1);
      setSuccess('Item added to cart!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add item to cart.');
      }
    } finally {
      setAddingToCartId(null);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <header className="products-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 className="products-title" style={{ fontSize: '2rem', fontWeight: 700 }}>Your Wishlist</h1>
          <p className="products-subtitle" style={{ color: 'var(--text-secondary)' }}>Review products you bookmarked for later</p>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="btn logout-btn" 
          style={{ 
            borderColor: 'rgba(255,255,255,0.2)', 
            color: 'var(--text-secondary)', 
            width: 'auto',
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </button>
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
          <p style={{ marginTop: '16px' }}>Loading your wishlist...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--card-bg)',
          borderRadius: '24px',
          border: '1px solid var(--card-border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <Heart className="w-16 h-16 text-pink-500 opacity-60" />
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '12px' }}>Your wishlist is empty</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
            Bookmark electronics you like while browsing the store catalogue.
          </p>
          <button onClick={() => navigate('/')} className="btn" style={{ maxWidth: '200px', margin: '0 auto', cursor: 'pointer' }}>
            Browse Catalogue
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="product-card" 
              onClick={() => navigate(`/product/${product.id}`)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <div className="product-img-wrapper">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="product-card-img"
                  loading="lazy"
                />
                <span className="product-card-category">{product.category}</span>
              </div>
              
              <div className="product-card-details" style={{ display: 'flex', flexDirection: 'column', height: '170px', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="product-card-title" style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    maxHeight: '2.4rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>{product.title}</h3>
                  <span className="product-card-price" style={{ fontSize: '1.2rem', fontWeight: 700, display: 'block', marginTop: '6px' }}>${product.price.toFixed(2)}</span>
                </div>
                
                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn logout-btn" 
                    style={{ padding: '10px', fontSize: '0.8rem', flex: 0.5, borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(product.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button 
                    className="btn" 
                    style={{ 
                      padding: '10px', 
                      fontSize: '0.8rem', 
                      flex: 1.5, 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    disabled={addingToCartId === product.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product.id);
                    }}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {addingToCartId === product.id ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
