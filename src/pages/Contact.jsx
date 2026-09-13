import { useState } from 'react';
import emailjs from '@emailjs/browser';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { useSettings } from '../hooks/useSettings';
import './Contact.css';

const EMAILJS_SERVICE_ID  = 'service_hn7jefj';
const EMAILJS_TEMPLATE_ID = 'template_c3og5z8';
const EMAILJS_PUBLIC_KEY  = 'Hovb6D9-b_WI2Vmt6';

function Contact() {
  const settings = useSettings();
  const whatsappNumber = settings.whatsapp_number || '212786972636';
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');

    emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        from_name:  form.name,
        from_email: form.email,
        phone:      form.phone || 'Non renseigné',
        message:    form.message,
      },
      EMAILJS_PUBLIC_KEY
    )
    .then(() => {
      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
    })
    .catch((err) => {
      console.error('EmailJS error:', err);
      setStatus('error');
    });
  };

  return (
    <div className="contact-page">
      <Header searchTerm="" onSearchChange={() => {}} />

      <div className="contact-banner">
        <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1600&q=80" alt="Contact MBLIFESTYLE" />
        <div className="contact-banner-overlay">
          <h1>Contactez-nous</h1>
        </div>
      </div>

      <div className="contact-content">

        <div className="contact-form-section">
          <h2>Écrivez-nous</h2>

          {status === 'success' && (
            <div className="contact-alert contact-alert-success">
              ✅ Message envoyé ! On vous répond très vite.
            </div>
          )}
          {status === 'error' && (
            <div className="contact-alert contact-alert-error">
              ❌ Erreur lors de l'envoi. Contactez-nous sur WhatsApp.
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Votre nom"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Votre email *"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Numéro de téléphone"
              value={form.phone}
              onChange={handleChange}
            />
            <textarea
              name="message"
              placeholder="Votre message..."
              value={form.message}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="contact-submit-btn"
              disabled={status === 'sending'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              {status === 'sending' ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>
          </form>
        </div>

        <div className="contact-info-section">
          <div className="contact-info-block">
            <h3>Notre contact</h3>
            <a href="mailto:ikram.zyat7@gmail.com" className="contact-info-row">
              <span className="contact-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16" strokeWidth="2">
                  <path d="M4 4h16v16H4V4z"/><path d="M4 6l8 7 8-7"/>
                </svg>
              </span>
              ikram.zyat7@gmail.com
            </a>
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="contact-info-row">
              <span className="contact-info-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </span>
              +{whatsappNumber}
            </a>
            {settings.address && (
              <div className="contact-info-row">
                <span className="contact-info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
                {settings.address}
              </div>
            )}
            {settings.working_hours && (
              <div className="contact-info-row">
                <span className="contact-info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </span>
                {settings.working_hours}
              </div>
            )}
          </div>

          <div className="contact-info-block">
            <h3>Suivez-nous</h3>
            <a href={settings.instagram_url || 'https://instagram.com/mblifestyle.ma'} target="_blank" rel="noopener noreferrer" className="contact-info-row">
              <span className="contact-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </span>
              Instagram — mblifestyle.ma
            </a>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default Contact;