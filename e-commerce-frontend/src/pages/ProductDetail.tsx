import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProductById } from '../api/productApi';
import { addToCart } from '../api/cartApi';
import { getProductReviews, addReview, deleteReview } from '../api/reviewApi';
import { addToWishlist, getWishlist, removeFromWishlist } from '../api/wishlistApi';
import type { Product } from '../types/product';
import type { Review } from '../types/review';
import { Star, Heart, ShoppingCart, Trash, MessageSquare, Send } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<number[]>([]);
  
  // Input states
  const [quantity, setQuantity] = useState<number>(1);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>('');
  
  // Loading & Error states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [reviewError, setReviewError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const productId = id ? parseInt(id, 10) : NaN;

  const fetchProductAndReviews = async () => {
    if (isNaN(productId)) {
      setError('Invalid product ID.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const pData = await getProductById(productId);
      setProduct(pData);
      
      const rData = await getProductReviews(productId);
      setReviews(rData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load product details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductAndReviews();
  }, [productId]);

  // Sync wishlist status
  useEffect(() => {
    if (user && !isNaN(productId)) {
      getWishlist(user.id)
        .then((wish) => setWishlistProductIds(wish.products.map(p => p.id)))
        .catch(() => {});
    }
  }, [user, productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);
    setError('');
    try {
      await addToCart(user.id, product.id, quantity);
      setSuccess(`${quantity} item(s) added to cart!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add product to cart.');
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const isSaved = wishlistProductIds.includes(product.id);
    try {
      if (isSaved) {
        await removeFromWishlist(user.id, product.id);
        setWishlistProductIds(prev => prev.filter(pId => pId !== product.id));
      } else {
        await addToWishlist(user.id, product.id);
        setWishlistProductIds(prev => [...prev, product.id]);
      }
    } catch (err) {
      setError('Could not update wishlist.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    if (!user) {
      navigate('/login');
      return;
    }

    if (!commentInput.trim()) {
      setReviewError('Review comment cannot be empty.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await addReview(user.id, productId, ratingInput, commentInput);
      setCommentInput('');
      setRatingInput(5);
      
      // Refresh product details & reviews to update rating averages
      const pData = await getProductById(productId);
      setProduct(pData);
      const rData = await getProductReviews(productId);
      setReviews(rData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setReviewError(err.message);
      } else {
        setReviewError('Failed to submit review.');
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleReviewDelete = async (reviewId: number) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(reviewId);
      
      // Refresh
      const pData = await getProductById(productId);
      setProduct(pData);
      const rData = await getProductReviews(productId);
      setReviews(rData);
    } catch (err) {
      setError('Failed to delete review.');
    }
  };

  const renderStars = (rate: number = 0) => {
    const roundedRate = Math.round(rate);
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-4 h-4 ${star <= roundedRate ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate('/')} className="logout-btn" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          ← Back to Shop
        </button>
      </div>

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
          <p style={{ marginTop: '16px' }}>Loading product details...</p>
        </div>
      ) : !product ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--card-border)' }}>
          <p>Product not found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Main Details Card */}
          <div className="product-detail-card">
            <div className="product-detail-img-col">
              <img 
                src={product.image} 
                alt={product.title} 
                className="product-detail-img"
              />
            </div>
            
            <div className="product-detail-info-col">
              <span className="product-card-category" style={{ display: 'inline-block', position: 'static', marginBottom: '16px' }}>
                {product.category}
              </span>
              <h1 className="product-detail-title" style={{ fontSize: '1.8rem', fontWeight: 700, margin: '8px 0 16px 0' }}>{product.title}</h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                {product.rating && product.rating.count > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {renderStars(product.rating.rate)}
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <strong>{product.rating.rate.toFixed(1)}</strong> ({product.rating.count} reviews)
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No reviews yet</span>
                )}

                {/* Stock badge */}
                {product.stock <= 0 ? (
                  <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(239,68,68,0.1)', padding: '4px 12px', borderRadius: '12px' }}>Out of Stock</span>
                ) : (
                  <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(16,185,129,0.1)', padding: '4px 12px', borderRadius: '12px' }}>
                    In Stock ({product.stock} items left)
                  </span>
                )}
              </div>

              <div className="product-detail-price-box" style={{ marginBottom: '24px' }}>
                <span className="price-tag" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>${product.price.toFixed(2)}</span>
              </div>

              <div className="product-detail-description" style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Description</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{product.description}</p>
              </div>

              {/* Purchase Actions */}
              {product.stock > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--card-border)',
                  padding: '20px',
                  borderRadius: '16px'
                }}>
                  {/* Quantity selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Quantity</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button 
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold' }}
                      >-</button>
                      <span style={{ fontSize: '1.1rem', fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
                      <button 
                        onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold' }}
                      >+</button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button 
                    className="btn" 
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    style={{ flexGrow: 1, height: '48px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600, marginTop: 'auto' }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                  </button>

                  {/* Bookmark Wishlist */}
                  <button
                    onClick={handleWishlistToggle}
                    style={{
                      height: '48px',
                      width: '48px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--card-border)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 'auto',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                  >
                    <Heart className={`w-5 h-5 ${wishlistProductIds.includes(product.id) ? 'fill-pink-500 text-pink-500' : 'text-gray-300'}`} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reviews section */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '24px',
            padding: '32px'
          }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare className="w-5 h-5 text-purple-400" />
              Customer Reviews ({reviews.length})
            </h2>

            {/* Write a Review Section */}
            {user ? (
              <form onSubmit={handleReviewSubmit} style={{
                background: 'rgba(15, 12, 27, 0.3)',
                border: '1px solid var(--card-border)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '32px'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Write a review</h3>
                
                {reviewError && (
                  <div className="alert alert-error" style={{ padding: '8px 12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.85rem' }}>{reviewError}</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Rating:</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <Star className={`w-6 h-6 ${star <= ratingInput ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <textarea
                    className="form-input"
                    placeholder="Share your thoughts about this product..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    style={{ minHeight: '80px', paddingRight: '48px', resize: 'vertical', background: 'rgba(15, 12, 27, 0.5)' }}
                    disabled={isSubmittingReview}
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      bottom: '12px',
                      background: 'var(--btn-gradient)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '16px',
                background: 'rgba(15, 12, 27, 0.2)',
                border: '1px dashed var(--card-border)',
                borderRadius: '16px',
                marginBottom: '32px',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                Please <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>login</Link> to write a review.
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                There are no reviews for this product yet. Be the first to review!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.map((rev) => {
                  const isAuthor = user && user.name === rev.userName;
                  const isAdmin = user && user.role === 'ADMIN';
                  return (
                    <div 
                      key={rev.id}
                      style={{
                        paddingBottom: '20px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{rev.userName}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          {renderStars(rev.rating)}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                          {rev.comment}
                        </p>
                      </div>

                      {/* Delete review button (For author or Admin) */}
                      {(isAuthor || isAdmin) && (
                        <button
                          onClick={() => handleReviewDelete(rev.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                          onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
