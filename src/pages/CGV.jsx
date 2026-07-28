import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Legal.css';

function CGV() {
  return (
    <div className="legal-page">
      <Header searchTerm="" onSearchChange={() => {}} />
      <div className="legal-hero">
        <div className="legal-breadcrumb">
          <Link to="/">Accueil</Link><span>›</span><span>CGV</span>
        </div>
        <h1>Conditions Générales de Vente</h1>
      </div>
      <div className="legal-container">
        <div className="legal-content">

          <div className="legal-section">
            <h2>1. Présentation</h2>
            <p>Le site MBLifestyle est une boutique en ligne de vêtements et accessoires de mode, basée à Casablanca, Maroc. Toute commande passée sur ce site implique l'acceptation des présentes conditions générales de vente.</p>
          </div>

          <div className="legal-section">
            <h2>2. Produits</h2>
            <p>Les produits proposés sont conformes à la législation marocaine en vigueur. Les photos et descriptions des produits sont aussi fidèles que possible. En cas d'erreur ou d'omission, notre responsabilité ne saurait être engagée.</p>
          </div>

          <div className="legal-section">
            <h2>3. Commandes</h2>
            <p>Les commandes sont passées via WhatsApp après validation du panier sur notre site. Une commande est considérée comme définitive après confirmation par notre équipe via WhatsApp.</p>
          </div>

          <div className="legal-section">
            <h2>4. Prix</h2>
            <p>Tous les prix sont indiqués en Dirhams Marocains (DH) et sont valables dans la limite des stocks disponibles. MBLifestyle se réserve le droit de modifier ses prix à tout moment.</p>
          </div>

          <div className="legal-section">
            <h2>5. Paiement</h2>
            <p>Le paiement s'effectue à la livraison (cash on delivery). Aucun paiement en ligne n'est requis pour passer commande.</p>
          </div>

          <div className="legal-section">
            <h2>6. Livraison</h2>
            <p>Nous livrons dans les principales villes du Maroc. Les frais de livraison varient selon la ville de destination et sont indiqués lors de la commande. Le délai de livraison est estimé entre 2 et 5 jours ouvrables selon la destination.</p>
          </div>

          <div className="legal-section">
            <h2>7. Retours et Échanges</h2>
            <p>Vous disposez de 30 jours après réception de votre commande pour nous contacter en cas de problème. Le produit doit être retourné dans son état d'origine, non porté, avec ses étiquettes. Les frais de retour sont à la charge du client sauf en cas d'erreur de notre part.</p>
          </div>

          <div className="legal-section">
            <h2>8. Service Client</h2>
            <p>Notre équipe est disponible via WhatsApp 7j/7 pour répondre à toutes vos questions concernant vos commandes.</p>
          </div>

          <div className="legal-section">
            <h2>9. Litiges</h2>
            <p>En cas de litige, une solution amiable sera recherchée avant tout recours judiciaire. Le droit marocain est applicable à tout litige relatif à l'utilisation de ce site.</p>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}

export default CGV;