import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import api from '../api/axios';
import './FeaturedProducts.css';
import './NewArrivalsSection.css';

function NewArrivalsSection() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const trackRef = useRef(null);
    const autoScrollRef = useRef(null);

  useEffect(() => {
    api.get('/products')
      .then((res) => {
        const sorted = [...res.data]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 6);
        setProducts(sorted);
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
  
  const startAutoScroll = () => {
    autoScrollRef.current = setInterval(() => {
      if (!trackRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 5) {
        trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const card = trackRef.current.querySelector('.featured-card-wrapper');
        const cardWidth = card ? card.offsetWidth + 24 : 280;
        trackRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 3000);
  };
  
  const stopAutoScroll = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
  };
  
  useEffect(() => {
    if (products.length > 0) startAutoScroll();
    return () => stopAutoScroll();
  }, [products]);

  if (loading || products.length === 0) return null;

  const showArrows = products.length > 5;

  return (
    <section className="featured-products nas-section-wrapper">
      <div className="featured-products-header">
        <div className="nas-titles">
          <span className="nas-label">Dernières arrivées</span>
          <h2 className="featured-products-title">Nouveautés</h2>
          <p className="featured-products-subtitle">
            Découvrez les dernières pièces ajoutées à notre collection
          </p>
        </div>
        <Link to="/catalogue" className="nas-btn-all">
          Voir tous nos produits
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="15" height="15">
            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
            <polyline points="12 5 19 12 12 19" strokeWidth="2" />
          </svg>
        </Link>
      </div>

      <div
  className="featured-products-carousel"
  onMouseEnter={stopAutoScroll}
  onMouseLeave={startAutoScroll}
>
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

export default NewArrivalsSection;