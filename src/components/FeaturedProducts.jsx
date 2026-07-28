import { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import api from '../api/axios';
import './FeaturedProducts.css';

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);

  useEffect(() => {
    api.get('/products')
      .then((res) => {
        const featured = res.data
  .filter((p) => p.is_featured)
  .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        setProducts(featured);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const scroll = (direction) => {
    if (!trackRef.current) return;
    const card = trackRef.current.querySelector('.featured-card-wrapper');
    const cardWidth = card ? card.offsetWidth + 24 : 280;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    });
  };

  if (loading || products.length === 0) return null;

  const showArrows = products.length > 4;

  return (
    <section className="featured-products">
      <div className="featured-products-header">
        <h2 className="featured-products-title">Nos Coups de Cœur</h2>
        <p className="featured-products-subtitle">
          Une sélection de pièces que nous aimons particulièrement
        </p>
      </div>

      <div className="featured-products-carousel">
        {showArrows && (
          <button className="carousel-arrow left" onClick={() => scroll('left')}>
            ‹
          </button>
        )}

        <div className="featured-products-track" ref={trackRef}>
          {products.map((product) => (
            <div className="featured-card-wrapper" key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {showArrows && (
          <button className="carousel-arrow right" onClick={() => scroll('right')}>
            ›
          </button>
        )}
      </div>
    </section>
  );
}

export default FeaturedProducts;