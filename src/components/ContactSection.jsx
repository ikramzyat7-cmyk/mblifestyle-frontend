import './ContactSection.css';

const whatsappNumber = '212786972636';

function ContactSection() {
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Bonjour, j'ai une question."
  )}`;

  return (
    <section className="contact-section">
      <div className="contact-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="36" height="36">
          <path d="M3 11l18-8-8 18-2-7-8-3z" strokeWidth="1.5" />
        </svg>
      </div>

      <h2 className="contact-title">Nous sommes à votre disposition</h2>
      <p className="contact-text">
        N'hésitez pas à nous contacter pour toute question, demande ou suivi de commande,
        par email ou directement sur WhatsApp.
      </p>

      <div className="contact-options">
        <a href="mailto:contact@mblifestyle.com" className="contact-btn contact-btn-email">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
            <path d="M4 4h16v16H4V4z" strokeWidth="2" />
            <path d="M4 6l8 7 8-7" strokeWidth="2" />
          </svg>
          contact@mblifestyle.com
        </a>

        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="contact-btn contact-btn-whatsapp">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M17.6 6.32A8.86 8.86 0 0 0 12.05 4a8.93 8.93 0 0 0-7.74 13.4L3 21l3.71-1.27A8.93 8.93 0 0 0 12.05 21a8.89 8.89 0 0 0 8.92-8.91 8.85 8.85 0 0 0-3.37-5.77zm-5.55 13.7a7.4 7.4 0 0 1-3.77-1.03l-.27-.16-2.79.95.94-2.72-.18-.28a7.4 7.4 0 0 1 6.07-11.4 7.32 7.32 0 0 1 7.36 7.37 7.4 7.4 0 0 1-7.36 7.27zm4.04-5.52c-.22-.11-1.3-.64-1.5-.71-.2-.08-.35-.11-.5.11-.15.22-.57.71-.7.86-.13.14-.26.16-.48.05-.22-.11-1.36-.5-1.95-1.93-.16-.27.15-.27.43-.9.05-.11.02-.21-.03-.3-.05-.08-.46-1.1-.63-1.5-.16-.4-.33-.34-.46-.35h-.4c-.13 0-.35.05-.53.27-.18.22-.7.69-.7 1.67 0 .98.7 1.93.8 2.06.1.14 1.39 2.13 3.4 2.9 1.66.65 2 .55 2.36.5.37-.06 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.1-.2-.16-.42-.27z" />
          </svg>
          Discuter sur WhatsApp
        </a>
      </div>
    </section>
  );
}

export default ContactSection;