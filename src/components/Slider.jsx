import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Slider.css';

function Slider() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  useEffect(() => {
    api.get('/slides').then((res) => {
      setSlides(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [slides]);

  if (loading || slides.length === 0) return null;

  const slide = slides[current];
  const imageUrl = slide.image
    ? `http://127.0.0.1:8000/storage/${slide.image}`
    : 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80';

  return (
    <div className="slider">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`slider-slide ${i === current ? 'active' : ''}`}
          style={{
            backgroundImage: `url(${s.image
              ? `http://127.0.0.1:8000/storage/${s.image}`
              : 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80'
            })`,
          }}
        >
          <div className="slider-overlay">
            <div className="slider-content">
              {s.title && <h1 className="slider-title">{s.title}</h1>}
              {s.subtitle && <p className="slider-subtitle">{s.subtitle}</p>}
              {s.button_text && (
                <button
                  className="slider-btn"
                  onClick={() => s.button_link && navigate(s.button_link)}
                >
                  {s.button_text}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            className="slider-arrow slider-arrow-left"
            onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
          >
            ‹
          </button>
          <button
            className="slider-arrow slider-arrow-right"
            onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
          >
            ›
          </button>

          <div className="slider-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`slider-dot ${i === current ? 'active' : ''}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Slider;