import './VideoBanner.css';
import bannerVideo from '../assets/video-banner.mp4';
function VideoBanner() {
  const handleScrollToCategories = () => {
    document.getElementById('categories-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <section className="video-banner">
      <video
  className="video-banner-media"
  autoPlay
  muted
  loop
  playsInline
  src={bannerVideo}
></video>

      <div className="video-banner-overlay"></div>

      <button className="video-banner-btn" onClick={handleScrollToCategories}>
        Découvrir nos catégories
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
          <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
          <polyline points="12 5 19 12 12 19" strokeWidth="2" />
        </svg>
      </button>
    </section>
  );
}

export default VideoBanner;