import { useState, useEffect } from 'react';
import api from '../api/axios';
import './Testimonials.css';

function StarRating({ rating, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= (hover || rating) ? 'filled' : ''}`}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', product: '', rating: 5, comment: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get('/reviews').then((res) => {
      const approved = res.data
        .filter((r) => r.status === 'approved')
        .slice(-3)
        .reverse();
      setReviews(approved);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', form);
      setSubmitted(true);
      setShowForm(false);
      setForm({ name: '', product: '', rating: 5, comment: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="testimonials">
      <div className="testimonials-header">
        <h2 className="testimonials-title">Ce que disent nos clients</h2>
        <p className="testimonials-subtitle">Des milliers de clients satisfaits à travers le Maroc</p>
        <button
          className="testimonials-add-btn"
          onClick={() => { setShowForm(!showForm); setSubmitted(false); }}
        >
          {showForm ? 'Fermer' : '+ Laisser un avis'}
        </button>
      </div>

      {submitted && (
        <div className="testimonials-success">
          ✓ Merci pour votre avis ! Il sera publié après validation.
        </div>
      )}

      {showForm && (
        <form className="testimonials-form" onSubmit={handleSubmit}>
          <h3>Partagez votre expérience</h3>

          <div className="testimonials-form-grid">
            <div className="tf-field">
              <label>Votre nom *</label>
              <input
                type="text"
                placeholder="Ex: Ahmed M."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="tf-field">
              <label>Produit acheté</label>
              <input
                type="text"
                placeholder="Ex: Dior, Balenciaga, ..."
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
              />
            </div>
          </div>

          <div className="tf-field">
            <label>Note *</label>
            <StarRating rating={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
          </div>

          <div className="tf-field">
            <label>Votre avis *</label>
            <textarea
              placeholder="Décrivez votre expérience..."
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              required
              rows={4}
            ></textarea>
          </div>

          <button type="submit" className="tf-submit">Envoyer mon avis</button>
        </form>
      )}

      {reviews.length > 0 ? (
        <div className="testimonials-grid">
          {reviews.map((review) => (
            <div key={review.id} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  {review.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="testimonial-name">{review.name}</p>
                  {review.product && (
                    <p className="testimonial-product">{review.product}</p>
                  )}
                </div>
              </div>
              <StarRating rating={review.rating} />
              <p className="testimonial-text">"{review.comment}"</p>
              <p className="testimonial-date">
                {new Date(review.created_at).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="testimonials-empty">Aucun avis pour le moment. Soyez le premier !</p>
      )}
    </section>
  );
}

export default Testimonials;