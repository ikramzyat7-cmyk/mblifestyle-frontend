import './VideoBanner.css';
import bannerVideo from '../assets/video-banner.mp4';

function VideoBanner({ onEnded }) {
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
        playsInline
        onEnded={onEnded}
        src={bannerVideo}
      ></video>

      <div className="video-banner-overlay"></div>

      <button className="video-banner-btn" onClick={handleScrollToCategories}>
        Découvrir nos catégories
        {/* ton svg ici, inchangé */}
      </button>
    </section>
  );
}

export default VideoBanner;