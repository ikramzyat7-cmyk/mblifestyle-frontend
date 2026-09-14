import logo from '../assets/logo.png';
import './LoadingScreen.css';

function LoadingScreen() {
  return (
    <div className="admin-loading-screen">
      <img src={logo} alt="MBLIFESTYLE" className="admin-loading-logo" />
      <div className="admin-loading-bar">
        <div className="admin-loading-bar-fill"></div>
      </div>
    </div>
  );
}

export default LoadingScreen;