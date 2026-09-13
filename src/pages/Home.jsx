import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import PromoPopup from '../components/PromoPopup';
import ProductCard from '../components/ProductCard';
import MarqueeBanner from '../components/MarqueeBanner';
import BannerGrid from '../components/BannerGrid';
import Testimonials from '../components/Testimonials';
import api from '../api/axios';
import './Home.css';

// ===== HOOK SCROLL ANIMATION =====
function useScrollAnimation() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const checkVisible = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        setVisible(true);
      }
    };
    
    checkVisible();
    window.addEventListener('scroll', checkVisible);
    return () => window.removeEventListener('scroll', checkVisible);
  }, []);
  
  return [ref, visible];
}

const brandLogos = [
  { name: 'Nike', color: '#111111' }, { name: 'Adidas', color: '#111111' },
  { name: 'Zara', color: '#111111' }, { name: 'H&M', color: '#cc0000' },
  { name: 'Lacoste', color: '#1e7a1e' }, { name: "Levi's", color: '#cc0000' },
  { name: 'Ralph Lauren', color: '#1e3a8a' }, { name: 'Tommy Hilfiger', color: '#cc0000' },
  { name: 'Calvin Klein', color: '#111111' }, { name: 'Puma', color: '#111111' },
  { name: 'New Balance', color: '#cc0000' }, { name: 'Gucci', color: '#111111' },
];

// ===== CARROUSEL CATÉGORIES =====
function CategoriesCarousel({ categories }) {
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const catIntervalRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const cardWidth = 220;
  const gap = 8;

  useEffect(() => {
    if (categories.length <= 5) return;
    catIntervalRef.current = setInterval(() => {
      setOffset((prev) => {
        const maxOffset = (categories.length - 5) * (cardWidth + gap);
        if (prev >= maxOffset) return 0;
        return prev + (cardWidth + gap);
      });
    }, 5000);
    return () => clearInterval(catIntervalRef.current);
  }, [categories]);

  return (
    <section className="cats-carousel-section">
      <div className="cats-carousel-inner">
        <div className="home-section-header" style={{ marginBottom: '16px', padding: '0 32px' }}>
          <h2 className="home-section-title">Nos catégories</h2>
          <Link to="/categories" className="home-section-link">Voir tout →</Link>
        </div>
        <div className="cats-scroll-outer">
          <div ref={trackRef} className="cats-scroll-track" style={{ transform: `translateX(-${offset}px)` }}>
            {categories.map((cat) => (
              <div key={cat.id} className="cat-big-card" onClick={() => navigate(`/categorie/${cat.slug}`)}>
                {cat.image ? (
                  <img src={`http://127.0.0.1:8000/storage/${cat.image}`} alt={cat.name} className="cat-big-img" />
                ) : (
                  <div className="cat-big-placeholder">👕</div>
                )}
                <div className="cat-big-overlay"><span className="cat-big-name">{cat.name}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== NOUVEAUTÉS =====
function NewArrivalsSection({ products, featuredImage }) {
  const navigate = useNavigate();
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4;
  const intervalRef = useRef(null);

  useEffect(() => {
    if (products.length <= visibleCount) return;
    intervalRef.current = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [products]);

  const goLeft = () => {
    clearInterval(intervalRef.current);
    setStartIndex((prev) => (prev - 1 + products.length) % products.length);
    intervalRef.current = setInterval(() => setStartIndex((prev) => (prev + 1) % products.length), 4000);
  };

  const goRight = () => {
    clearInterval(intervalRef.current);
    setStartIndex((prev) => (prev + 1) % products.length);
    intervalRef.current = setInterval(() => setStartIndex((prev) => (prev + 1) % products.length), 4000);
  };

  const getVisible = () => {
    const result = [];
    for (let i = 0; i < Math.min(visibleCount, products.length); i++) {
      result.push(products[(startIndex + i) % products.length]);
    }
    return result;
  };

  return (
    <section className="new-arrivals-section">
      <div className="new-arrivals-inner">
        <div className="new-arrivals-featured">
          {featuredImage ? (
            <img src={`http://127.0.0.1:8000/storage/${featuredImage}`} alt="Nouveautés" className="new-arrivals-featured-img" />
          ) : (
            <div className="new-arrivals-featured-placeholder">
              <span>📷</span><p>Ajoutez une image depuis<br/>les paramètres admin</p>
            </div>
          )}
          <div className="new-arrivals-featured-overlay">
            <span className="new-arrivals-featured-label">✨ Nouveautés</span>
          </div>
        </div>
        <div className="new-arrivals-right">
          <div className="new-arrivals-header">
            <h2 className="home-section-title">Nouveautés</h2>
            <div className="new-arrivals-controls">
              <button className="cats-carousel-arrow" onClick={goLeft}>‹</button>
              <button className="cats-carousel-arrow" onClick={goRight}>›</button>
              <Link to="/nouveautes" className="home-section-link">Voir tout →</Link>
            </div>
          </div>
          <div className="new-arrivals-track">
            {getVisible().map((product, i) => (
              <div key={product.id + '-' + i} className="new-arrivals-card" onClick={() => navigate(`/produit/${product.id}`)}>
                <div className="new-arrivals-card-img">
                  {product.discount > 0 && <span className="new-arrivals-badge">-{product.discount}%</span>}
                  {product.images?.[0] ? (
                    <img src={`http://127.0.0.1:8000/storage/${product.images[0]}`} alt={product.name} />
                  ) : <div className="new-arrivals-no-img">👕</div>}
                </div>
                <div className="new-arrivals-card-info">
                  {product.brand && <span className="new-arrivals-brand">{product.brand}</span>}
                  <p className="new-arrivals-name">{product.name}</p>
                  <div className="new-arrivals-prices">
                    {product.discount > 0 ? (
                      <>
                        <span className="new-arrivals-price-new">{(product.price - product.price * product.discount / 100).toFixed(2)} DH</span>
                        <span className="new-arrivals-price-old">{parseFloat(product.price).toFixed(2)} DH</span>
                      </>
                    ) : (
                      <span className="new-arrivals-price-new">{parseFloat(product.price).toFixed(2)} DH</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== COMPTEURS =====
function CountersSection() {
  const [animated, setAnimated] = useState(false);
  const [counts, setCounts] = useState({ clients: 0, produits: 0, ans: 0, commandes: 0 });
  const sectionRef = useRef(null);
  const targets = { clients: 500, produits: 1000, ans: 5, commandes: 2000 };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !animated) { setAnimated(true); animateCounters(); } },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [animated]);

  const animateCounters = () => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounts({
        clients: Math.floor(eased * targets.clients),
        produits: Math.floor(eased * targets.produits),
        ans: Math.floor(eased * targets.ans),
        commandes: Math.floor(eased * targets.commandes),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
  };

  const items = [
    { label: 'Clients satisfaits', value: counts.clients, suffix: '+',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="28" height="28" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: 'Produits disponibles', value: counts.produits, suffix: '+',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="28" height="28" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
    { label: "D'expérience", value: counts.ans, suffix: ' ans',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="28" height="28" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { label: 'Commandes livrées', value: counts.commandes, suffix: '+',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="28" height="28" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  ];

  return (
    <section className="counters-section" ref={sectionRef}>
      <div className="counters-inner">
        {items.map((item, i) => (
          <div key={i} className="counter-item">
            <div className="counter-icon-box">{item.icon}</div>
            <div className="counter-number">{item.value}{item.suffix}</div>
            <div className="counter-label">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===== HOME =====
function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [slides, setSlides] = useState([]);
  const [slidesLoading, setSlidesLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [latestByCat, setLatestByCat] = useState([]);
  const [popup, setPopup] = useState(null);
  const [nouveautesImage, setNouveautesImage] = useState(null);
  const [lookbook, setLookbook] = useState([]);
  const [promoData, setPromoData] = useState({
    title: "NOUVELLE COLLECTION", text: "Découvrez les dernières tendances",
    btn: "VOIR LA COLLECTION", link: '/catalogue', image: null,
  });
  const intervalRef = useRef(null);
  const isCurrentSlideVideo = slides[currentSlide]?.video != null;

  // Scroll animations
  const [selectionRef, selectionVisible] = useScrollAnimation();
  const [lookbookRef, lookbookVisible] = useScrollAnimation();
  const [coeurRef, coeurVisible] = useScrollAnimation();
  const [bannerRef, bannerVisible] = useScrollAnimation();
  const [flashRef, flashVisible] = useScrollAnimation();
  const [promoRef, promoVisible] = useScrollAnimation();
  const [nouveautesRef, nouveautesVisible] = useScrollAnimation();
  const [midBannerRef, midBannerVisible] = useScrollAnimation();
  const [testimonialsRef, testimonialsVisible] = useScrollAnimation();

  useEffect(() => {
    api.get('/slides').then((res) => { setSlides(res.data); setSlidesLoading(false); });
    api.get('/categories').then((res) => setCategories(res.data));
    api.get('/products').then((res) => {
      const all = res.data;
      setFeaturedProducts(all.filter((p) => p.is_featured).sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).slice(0, 8));
      setNewProducts([...all].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5));
      setLatestByCat([...all].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8));
    });
    api.get('/settings').then((res) => {
      if (res.data.nouveautes_image) setNouveautesImage(res.data.nouveautes_image);
      setPromoData({
        title: res.data.promo_title || "NOUVELLE COLLECTION",
        text: res.data.promo_text || "Découvrez les dernières tendances",
        btn: res.data.promo_btn || "VOIR LA COLLECTION",
        link: res.data.promo_link || '/catalogue',
        image: res.data.promo_image || null,
      });
      setLookbook([
        { title: res.data.lookbook_title_1, link: res.data.lookbook_link_1, image: res.data.lookbook_image_1 },
        { title: res.data.lookbook_title_2, link: res.data.lookbook_link_2, image: res.data.lookbook_image_2 },
        { title: res.data.lookbook_title_3, link: res.data.lookbook_link_3, image: res.data.lookbook_image_3 },
      ].filter((item) => item.image));
    }).catch(() => {});
    api.get('/popup').then((res) => {
      if (res.data?.is_active && res.data?.products?.length > 0) setPopup(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    intervalRef.current = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(intervalRef.current);
  }, [slides]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
  };

  return (
    <div className="home-page">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} forceWhite={isCurrentSlideVideo} />
      <PromoPopup />

      {/* 1. SLIDER */}
      <section className="slider-section">
        {slidesLoading ? (
          <div style={{ width: '100%', height: '100vh', backgroundColor: '#111111' }} />
        ) : slides.length > 0 ? (
          <div className="slider-wrapper">
            {slides.map((slide, index) => (
              <div key={slide.id} className={`slide ${index === currentSlide ? 'active' : ''}`}>
                {slide.style === 'fagor-banner' ? (
                  <div className="slide-fagor-banner">
                    <div className="sfb-diagonal" /><div className="sfb-bg-right" />
                    <div className="sfb-content">
                      <div className="sfb-brand">MBLIFESTYLE</div>
                      <h1 className="sfb-title">{slide.title || "NOUVELLE COLLECTION"}</h1>
                      <div className="sfb-divider" />
                      {slide.promo_amount && <div className="sfb-promo">Économisez <span>{slide.promo_amount}</span></div>}
                      {slide.promo_sub && <p className="sfb-sub">{slide.promo_sub}</p>}
                      {slide.subtitle && <p className="sfb-sub">{slide.subtitle}</p>}
                      {slide.button_text && <button className="sfb-cta" onClick={() => navigate(slide.button_link || '/catalogue')}>{slide.button_text}</button>}
                    </div>
                    <div className="sfb-photo">
                      {slide.product_image && <img src={`http://127.0.0.1:8000/storage/${slide.product_image}`} alt={slide.title} />}
                    </div>
                    <div className="sfb-badge"><span>QUALITÉ<br/>GARANTIE</span><div className="sfb-badge-stars">★★★★★</div></div>
                  </div>
                ) : slide.video ? (
                  <video className="slide-video" autoPlay muted loop playsInline src={`http://127.0.0.1:8000/storage/${slide.video}`} />
                ) : (
                  <div className="slide-bg" style={{
                    backgroundImage: slide.image ? `url(http://127.0.0.1:8000/storage/${slide.image})` : 'none',
                    backgroundColor: !slide.image ? '#111111' : 'transparent',
                  }} />
                )}
                {slide.style !== 'fagor-banner' && (
                  <div className="slide-overlay">
                    <div className="slide-content">
                      {slide.title && <h1 className="slide-title">{slide.title}</h1>}
                      {slide.subtitle && <p className="slide-subtitle">{slide.subtitle}</p>}
                      {slide.button_text && <button className="slide-btn" onClick={() => navigate(slide.button_link || '/catalogue')}>{slide.button_text}</button>}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {slides.length > 1 && (
              <>
                <button className="slider-arrow slider-arrow-left" onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}>‹</button>
                <button className="slider-arrow slider-arrow-right" onClick={() => goToSlide((currentSlide + 1) % slides.length)}>›</button>
                <div className="slider-dots">
                  {slides.map((_, i) => <button key={i} className={`slider-dot ${i === currentSlide ? 'active' : ''}`} onClick={() => goToSlide(i)} />)}
                </div>
              </>
            )}
          </div>
        ) : null}
      </section>

      {/* 2. MARQUEE */}
      <MarqueeBanner />

      {/* 3. CATÉGORIES */}
      {categories.length > 0 && <CategoriesCarousel categories={categories} />}

      {/* 4. SÉLECTION DU MOMENT */}
      {latestByCat.length > 0 && (
        <section ref={selectionRef} className={`home-section scroll-animate ${selectionVisible ? 'scroll-visible' : ''}`}>
          <div className="home-section-inner">
            <div className="home-section-header">
              <h2 className="home-section-title">Notre sélection du moment</h2>
              <Link to="/catalogue" className="home-section-link">Voir tout →</Link>
            </div>
            <div className="products-grid-4x2">
              {latestByCat.map((product, i) => (
                <div key={product.id} className={`scroll-animate-child ${selectionVisible ? 'scroll-visible' : ''}`} style={{ transitionDelay: `${i * 0.06}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. LOOKBOOK */}
      {lookbook.length > 0 && (
        <section ref={lookbookRef} className={`lookbook-section scroll-animate ${lookbookVisible ? 'scroll-visible' : ''}`}>
          <div className="lookbook-inner">
            <div className="home-section-header" style={{ marginBottom: '24px' }}>
              <h2 className="home-section-title">Nos collections</h2>
            </div>
            <div className={`lookbook-grid lookbook-grid-${lookbook.length}`}>
              {lookbook.map((item, i) => (
                <div key={i} className={`lookbook-card scroll-animate-child ${lookbookVisible ? 'scroll-visible' : ''}`}
                  style={{ transitionDelay: `${i * 0.15}s`, cursor: item.link ? 'pointer' : 'default' }}
                  onClick={() => item.link && navigate(item.link)}>
                  <img src={`http://127.0.0.1:8000/storage/${item.image}`} alt={item.title} className="lookbook-img" />
                  <div className="lookbook-overlay">
                    {item.title && <h3 className="lookbook-title">{item.title}</h3>}
                    {item.link && <span className="lookbook-btn">Découvrir →</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. NOS COUPS DE CŒUR */}
      {featuredProducts.length > 0 && (
        <section ref={coeurRef} className={`home-section home-section-gray scroll-animate ${coeurVisible ? 'scroll-visible' : ''}`}>
          <div className="home-section-inner">
            <div className="home-section-header">
              <h2 className="home-section-title">Nos coups de cœur</h2>
              <Link to="/catalogue" className="home-section-link">Voir tout →</Link>
            </div>
            <div className="products-grid-4x2">
              {featuredProducts.slice(0, 8).map((product, i) => (
                <div key={product.id} className={`scroll-animate-child ${coeurVisible ? 'scroll-visible' : ''}`} style={{ transitionDelay: `${i * 0.06}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. BANNIÈRES PROMO */}
      <div ref={bannerRef} className={`scroll-animate ${bannerVisible ? 'scroll-visible' : ''}`}>
        <BannerGrid />
      </div>

      {/* 8. OFFRES FLASH */}
      {popup && popup.products?.length > 0 && (
        <section ref={flashRef} className={`home-section home-section-dark scroll-animate ${flashVisible ? 'scroll-visible' : ''}`}>
          <div className="home-section-inner">
            <div className="home-section-header">
              <h2 className="home-section-title white">⚡ Offres Flash</h2>
              <Link to="/catalogue" className="home-section-link white">Voir tout →</Link>
            </div>
            <div className="flash-grid">
              {popup.products.map((product, i) => (
                <div key={product.id} className={`flash-card scroll-animate-child ${flashVisible ? 'scroll-visible' : ''}`}
                  style={{ transitionDelay: `${i * 0.1}s` }}
                  onClick={() => navigate(`/produit/${product.id}`)}>
                  <div className="flash-card-img">
                    {product.images?.[0] ? <img src={`http://127.0.0.1:8000/storage/${product.images[0]}`} alt={product.name} /> : <div className="flash-no-img">👕</div>}
                    {product.discount > 0 && <span className="flash-badge">-{product.discount}%</span>}
                  </div>
                  <div className="flash-info">
                    <p className="flash-brand">{product.brand}</p>
                    <p className="flash-name">{product.name}</p>
                    <div className="flash-prices">
                      {product.discount > 0 && <span className="flash-old">{parseFloat(product.price).toFixed(2)} DH</span>}
                      <span className="flash-new">{product.discount > 0 ? (product.price - product.price * product.discount / 100).toFixed(2) : parseFloat(product.price).toFixed(2)} DH</span>
                    </div>
                    <button className="flash-btn" onClick={(e) => { e.stopPropagation(); navigate(`/produit/${product.id}`); }}>Voir le produit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. BANNIÈRE COLLECTION */}
      <div ref={promoRef} className={`fagor-banner scroll-animate ${promoVisible ? 'scroll-visible' : ''}`}>
        <div className="fagor-banner__photo">
          <div className="fagor-banner__circle">
            {promoData.image ? (
              <img src={`http://127.0.0.1:8000/storage/${promoData.image}`} alt="Promo" />
            ) : (
              <div className="fagor-banner__placeholder-circle"><span>👕</span><p>Photo depuis<br/>les paramètres</p></div>
            )}
          </div>
        </div>
        <div className="fagor-banner__content">
          <div className="fagor-banner__brand">MBLIFESTYLE</div>
          <h2 className="fagor-banner__title">{promoData.title}</h2>
          <div className="fagor-banner__promo">{promoData.text}</div>
          <button className="fagor-banner__cta" onClick={() => navigate(promoData.link || '/catalogue')}>{promoData.btn}</button>
        </div>
      </div>

      {/* 10. NOUVEAUTÉS */}
      {newProducts.length > 0 && (
        <div ref={nouveautesRef} className={`scroll-animate ${nouveautesVisible ? 'scroll-visible' : ''}`}>
          <NewArrivalsSection products={newProducts} featuredImage={nouveautesImage} />
        </div>
      )}

      {/* 11. COMPTEURS */}
      <CountersSection />

      {/* 13. BANNIÈRE AVANTAGES */}
      <section ref={midBannerRef} className={`mid-banner scroll-animate ${midBannerVisible ? 'scroll-visible' : ''}`}>
        <div className="mid-banner-inner">
          {[
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, title: 'Livraison rapide', desc: 'Sur Casablanca' },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24" strokeWidth="1.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>, title: 'Retours gratuits', desc: 'Sous 30 jours' },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, title: 'Qualité garantie', desc: 'Produits certifiés' },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title: 'Commande WhatsApp', desc: 'Réponse 7j/7' },
          ].map((item, i, arr) => (
            <div key={i} style={{ display: 'contents' }}>
              <div className={`mid-banner-item scroll-animate-child ${midBannerVisible ? 'scroll-visible' : ''}`} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="mid-banner-icon-box">{item.icon}</div>
                <div>
                  <p className="mid-banner-title">{item.title}</p>
                  <p className="mid-banner-desc">{item.desc}</p>
                </div>
              </div>
              {i < arr.length - 1 && <div className="mid-banner-divider" />}
            </div>
          ))}
        </div>
      </section>

      {/* 14. AVIS CLIENTS */}
      <section ref={testimonialsRef} className={`home-section scroll-animate ${testimonialsVisible ? 'scroll-visible' : ''}`}>
        <div className="home-section-inner">
          <Testimonials />
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default Home;
