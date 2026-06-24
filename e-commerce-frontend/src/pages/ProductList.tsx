import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllProducts } from '../api/productApi';
import { getAllCategories } from '../api/categoryApi';
import { addToCart } from '../api/cartApi';
import { addToWishlist, getWishlist, removeFromWishlist } from '../api/wishlistApi';
import type { Product } from '../types/product';
import type { Category } from '../types/category';
import { Search, Heart, ShoppingCart, Filter, ArrowUpDown } from 'lucide-react';

const ProductList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<number[]>([]);
  
  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('default');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Load products & categories
  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const prodData = await getAllProducts(
        searchQuery || undefined,
        selectedCategory || undefined,
        sortBy !== 'default' ? sortBy : undefined
      );
      setProducts(prodData);

      const catData = await getAllCategories();
      setCategories(catData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch store catalog.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sync wishlist items if user is logged in
  useEffect(() => {
    if (user) {
      getWishlist(user.id)
        .then((wish) => {
          setWishlistProductIds(wish.products.map(p => p.id));
        })
        .catch(() => {});
    }
  }, [user]);

  // Reload products when filters change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadData();
    }, 300); // Debounce search query changes
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedCategory, sortBy]);

  // Handle adding product to cart
  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>, productId: number) => {
    e.stopPropagation();
    setError('');
    
    if (!user) {
      navigate('/login');
      return;
    }

    setAddingToCartId(productId);
    try {
      await addToCart(user.id, productId, 1);
      setSuccess('Item added to cart!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add product to cart.');
      }
    } finally {
      setAddingToCartId(null);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    const isSaved = wishlistProductIds.includes(productId);
    try {
      if (isSaved) {
        await removeFromWishlist(user.id, productId);
        setWishlistProductIds(prev => prev.filter(id => id !== productId));
      } else {
        await addToWishlist(user.id, productId);
        setWishlistProductIds(prev => [...prev, productId]);
      }
    } catch (err) {
      setError('Could not update wishlist.');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header section */}
      <header className="products-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="products-title" style={{ fontSize: '2rem', fontWeight: 700 }}>Discover ElectroStore</h1>
          <p className="products-subtitle" style={{ color: 'var(--text-secondary)' }}>Explore cutting-edge electronics and accessories</p>
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

      {/* Search, Filter & Sort Controls */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '32px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', flexGrow: 1, maxWidth: '400px' }}>
          <Search className="w-5 h-5 text-gray-400" style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)'
          }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search electronics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px', background: 'rgba(15, 12, 27, 0.4)' }}
          />
        </div>

        {/* Sorting Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpDown className="w-4 h-4 text-purple-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: 'var(--input-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--input-border)',
              padding: '10px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              outline: 'none',
              fontSize: '0.95rem'
            }}
          >
            <option value="default">Sort By: Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Rating: Highest First</option>
          </select>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '32px',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          <Filter className="w-4 h-4 text-purple-400" />
          <span>Categories:</span>
        </div>
        <button
          onClick={() => setSelectedCategory(null)}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            border: selectedCategory === null ? 'none' : '1px solid var(--card-border)',
            background: selectedCategory === null ? 'var(--btn-gradient)' : 'rgba(255, 255, 255, 0.05)',
            color: 'white',
            transition: 'all 0.2s'
          }}
        >
          All Products
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              border: selectedCategory === cat.id ? 'none' : '1px solid var(--card-border)',
              background: selectedCategory === cat.id ? 'var(--btn-gradient)' : 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              transition: 'all 0.2s'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Catalog Display */}
      {isLoading ? (
        <div className="loading-container" style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '16px' }}>Loading catalog items...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--card-bg)',
          borderRadius: '24px',
          border: '1px solid var(--card-border)'
        }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>No products found matching filters.</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '8px' }}>
            Try adjusting your search query or selecting a different category.
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => {
            const isSaved = wishlistProductIds.includes(product.id);
            return (
              <div 
                key={product.id} 
                className="product-card" 
                onClick={() => navigate(`/product/${product.id}`)}
                style={{ position: 'relative', cursor: 'pointer' }}
              >
                {/* Wishlist Button Overlay */}
                <button
                  onClick={(e) => handleWishlistToggle(e, product.id)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 5,
                    background: 'rgba(15, 12, 27, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-pink-500 text-pink-500' : 'text-gray-300'}`} />
                </button>

                <div className="product-img-wrapper">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="product-card-img"
                    loading="lazy"
                  />
                  <span className="product-card-category">{product.category}</span>
                </div>
                
                <div className="product-card-details" style={{ display: 'flex', flexDirection: 'column', height: '180px', justifyContent: 'space-between' }}>
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
                    
                    {/* Stock status indicator */}
                    <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="product-card-price" style={{ fontSize: '1.25rem', fontWeight: 700 }}>${product.price.toFixed(2)}</span>
                      {product.stock <= 0 ? (
                        <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '12px' }}>Out of Stock</span>
                      ) : product.stock <= 10 ? (
                        <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '12px' }}>Only {product.stock} Left</span>
                      ) : (
                        <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '12px' }}>In Stock</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn logout-btn" 
                      style={{ padding: '10px', fontSize: '0.8rem', flex: 1, borderColor: 'rgba(255,255,255,0.15)', color: 'var(--text-primary)', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.id}`);
                      }}
                    >
                      Details
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
                      disabled={addingToCartId === product.id || product.stock <= 0}
                      onClick={(e) => handleAddToCart(e, product.id)}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {addingToCartId === product.id ? 'Adding...' : product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductList;
