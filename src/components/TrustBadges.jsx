import './TrustBadges.css';

const badges = [
  {
    title: 'Commande facile',
    description: 'Commandez directement via WhatsApp en quelques clics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="28" height="28">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'Paiement à la livraison',
    description: 'Payez en toute sécurité à la réception de votre colis',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="28" height="28">
        <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" />
        <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'Qualité garantie',
    description: 'Des pièces sélectionnées avec soin pour leur qualité',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="28" height="28">
        <path d="M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.5 5.5 21 7.5 13.5 2 9h7z" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'Livraison rapide',
    description: 'Votre commande livrée rapidement où que vous soyez',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="28" height="28">
        <rect x="1" y="3" width="15" height="13" strokeWidth="2" />
        <path d="M16 8h4l3 3v5h-7V8z" strokeWidth="2" />
        <circle cx="5.5" cy="18.5" r="2.5" strokeWidth="2" />
        <circle cx="18.5" cy="18.5" r="2.5" strokeWidth="2" />
      </svg>
    ),
  },
];

function TrustBadges() {
  return (
    <section className="trust-badges">
      <div className="trust-badges-grid">
        {badges.map((badge, index) => (
          <div className="trust-badge" key={index}>
            <div className="trust-badge-icon">{badge.icon}</div>
            <h3 className="trust-badge-title">{badge.title}</h3>
            <p className="trust-badge-description">{badge.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustBadges;