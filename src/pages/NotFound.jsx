import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="nf-page">
      <Header searchTerm="" onSearchChange={() => {}} />

      <div className="nf-container">
        <div className="nf-content">
          <div className="nf-code">404</div>
          <div className="nf-divider" />
          <h1 className="nf-title">Page introuvable</h1>
          <p className="nf-text">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="nf-btns">
            <button className="nf-btn-home" onClick={() => navigate('/')}>
              ← Retour à l'accueil
            </button>
            <button className="nf-btn-catalogue" onClick={() => navigate('/catalogue')}>
              Voir nos produits
            </button>
          </div>
          <div className="nf-links">
            <span onClick={() => navigate('/nouveautes')} className="nf-link">Nouveautés</span>
            <span onClick={() => navigate('/categories')} className="nf-link">Catégories</span>
            <span onClick={() => navigate('/contact')} className="nf-link">Contact</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default NotFound;