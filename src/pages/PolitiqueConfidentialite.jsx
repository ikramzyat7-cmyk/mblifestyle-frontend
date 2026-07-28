import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Legal.css';

function PolitiqueConfidentialite() {
  return (
    <div className="legal-page">
      <Header searchTerm="" onSearchChange={() => {}} />
      <div className="legal-hero">
        <div className="legal-breadcrumb">
          <Link to="/">Accueil</Link><span>›</span><span>Politique de confidentialité</span>
        </div>
        <h1>Politique de Confidentialité</h1>
      </div>
      <div className="legal-container">
        <div className="legal-content">

          <div className="legal-section">
            <h2>1. Collecte des données</h2>
            <p>MBLifestyle collecte uniquement les données nécessaires au traitement de vos commandes : nom, prénom, numéro de téléphone et adresse de livraison. Ces données sont transmises via WhatsApp et ne sont pas stockées sur nos serveurs.</p>
          </div>

          <div className="legal-section">
            <h2>2. Utilisation des données</h2>
            <p>Les données collectées sont utilisées uniquement pour :</p>
            <ul>
              <li>Traiter et livrer vos commandes</li>
              <li>Vous contacter concernant votre commande</li>
              <li>Améliorer nos services</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>3. Cookies</h2>
            <p>Notre site utilise des cookies techniques pour :</p>
            <ul>
              <li>Sauvegarder votre panier entre les sessions</li>
              <li>Maintenir votre session de navigation</li>
            </ul>
            <p>Nous n'utilisons pas de cookies publicitaires ou de tracking.</p>
          </div>

          <div className="legal-section">
            <h2>4. Partage des données</h2>
            <p>MBLifestyle ne vend, ne loue et ne partage pas vos données personnelles avec des tiers. Vos informations sont strictement confidentielles.</p>
          </div>

          <div className="legal-section">
            <h2>5. Sécurité</h2>
            <p>Nous mettons en œuvre toutes les mesures nécessaires pour protéger vos données personnelles contre tout accès non autorisé.</p>
          </div>

          <div className="legal-section">
            <h2>6. Vos droits</h2>
            <p>Conformément à la loi marocaine 09-08, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, contactez-nous via WhatsApp.</p>
          </div>

          <div className="legal-section">
            <h2>7. Contact</h2>
            <p>Pour toute question concernant notre politique de confidentialité, contactez-nous via la page <Link to="/contact">Contact</Link>.</p>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PolitiqueConfidentialite;