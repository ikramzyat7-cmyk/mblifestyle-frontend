import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './BannerGrid.css';

function BannerGrid() {
  const [banners, setBanners] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/banners').then((res) => setBanners(res.data));
  }, []);

  const handleClick = (link) => {
    if (link) navigate(link);
  };

  const main = banners['main'];
  const topRight = banners['top-right'];
  const bottomRight = banners['bottom-right'];

  if (!main && !topRight && !bottomRight) return null;

  return (
    <div className="banner-grid">
      {/* Grande bannière gauche */}
      {main && (
        <div
          className="banner-main"
          onClick={() => handleClick(main.link)}
          style={{
            backgroundImage: main.image
              ? `url(https://mblifestyle-backend-production.up.railway.app/storage/${main.image})`
              : 'linear-gradient(135deg, #cc0000, #660000)',
            cursor: main.link ? 'pointer' : 'default',
          }}
        >
          <div className="banner-overlay">
            {main.badge_text && (
              <div className="banner-badge-circle">
                <span>Jusqu'à</span>
                <strong>{main.badge_text}</strong>
              </div>
            )}
            <div className="banner-main-content">
              {main.title && <h2 className="banner-main-title">{main.title}</h2>}
              {main.subtitle && <p className="banner-main-subtitle">{main.subtitle}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Colonne droite */}
      {(topRight || bottomRight) && (
        <div className="banner-side">
          {topRight && (
            <div
              className="banner-small"
              onClick={() => handleClick(topRight.link)}
              style={{
                backgroundImage: topRight.image
                  ? `url(https://mblifestyle-backend-production.up.railway.app/storage/${topRight.image})`
                  : 'linear-gradient(135deg, #111111, #333333)',
                cursor: topRight.link ? 'pointer' : 'default',
              }}
            >
              <div className="banner-overlay">
                {topRight.badge_text && (
                  <span className="banner-small-badge">{topRight.badge_text}</span>
                )}
                {topRight.title && <h3 className="banner-small-title">{topRight.title}</h3>}
                {topRight.subtitle && <p className="banner-small-subtitle">{topRight.subtitle}</p>}
              </div>
            </div>
          )}

          {bottomRight && (
            <div
              className="banner-small banner-small-bottom"
              onClick={() => handleClick(bottomRight.link)}
              style={{
                backgroundImage: bottomRight.image
                  ? `url(https://mblifestyle-backend-production.up.railway.app/storage/${bottomRight.image})`
                  : 'linear-gradient(135deg, #1e3a8a, #0a1f5c)',
                cursor: bottomRight.link ? 'pointer' : 'default',
              }}
            >
              <div className="banner-overlay banner-overlay-light">
                {bottomRight.badge_text && (
                  <span className="banner-small-badge">{bottomRight.badge_text}</span>
                )}
                {bottomRight.title && <h3 className="banner-small-title">{bottomRight.title}</h3>}
                {bottomRight.subtitle && <p className="banner-small-subtitle">{bottomRight.subtitle}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BannerGrid;