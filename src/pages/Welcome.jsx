import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Welcome.css';

function Welcome() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Step 0: logo apparaît (0ms)
    // Step 1: texte apparaît (800ms)
    // Step 2: message apparaît (1600ms)
    // Step 3: barre de chargement (2400ms)
    // Step 4: redirect (3800ms)

    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1600),
      setTimeout(() => setStep(3), 2400),
      setTimeout(() => navigate('/admin'), 3800),
    ];

    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  return (
    <div className="welcome-page">
      <div className="welcome-bg" />

      <div className="welcome-content">
        {/* Logo */}
        <div className={`welcome-logo ${step >= 0 ? 'visible' : ''}`}>
          <img src={logo} alt="MBLIFESTYLE" />
        </div>

        {/* Titre */}
        <div className={`welcome-title-wrapper ${step >= 1 ? 'visible' : ''}`}>
          <h1 className="welcome-title">
            Bienvenue chez <span>MBLIFESTYLE</span>
          </h1>
          <div className="welcome-title-line" />
        </div>

        {/* Message */}
        <div className={`welcome-message ${step >= 2 ? 'visible' : ''}`}>
          <div className="welcome-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p>Vous êtes bien connecté à votre espace administrateur</p>
        </div>

        {/* Barre chargement */}
        <div className={`welcome-bar-wrapper ${step >= 3 ? 'visible' : ''}`}>
          <div className="welcome-bar">
            <div className="welcome-bar-fill" />
          </div>
          <p className="welcome-bar-text">Chargement du tableau de bord...</p>
        </div>
      </div>
    </div>
  );
}

export default Welcome;