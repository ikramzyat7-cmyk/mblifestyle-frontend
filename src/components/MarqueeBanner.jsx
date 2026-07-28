import { useSettings } from '../hooks/useSettings';
import logo from '../assets/logo.png';
import './MarqueeBanner.css';

function MarqueeBanner() {
  const settings = useSettings();
  const shopName = settings.shop_name || 'MBLIFESTYLE';

  const items = Array(15).fill(null);

  return (
    <div className="marquee-banner">
      <div className="marquee-track">
        {[...items, ...items].map((_, i) => (
          <div key={i} className="marquee-item">
            <img src={logo} alt="MB" className="marquee-logo" />
            <span className="marquee-text">{shopName}</span>
            <span className="marquee-separator">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarqueeBanner;