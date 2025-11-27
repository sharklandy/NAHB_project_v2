import React, { useState, useEffect } from 'react';
import './RatingSection.css';

export default function RatingSection({ api, token, storyId, isAuthenticated }) {
  const [statistics, setStatistics] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRatings();
    loadStatistics();
    if (isAuthenticated) {
      loadUserRating();
    }
  }, [storyId, isAuthenticated]);

  async function loadStatistics() {
    try {
      const res = await fetch(`${api}/ratings/${storyId}/statistics`);
      const stats = await res.json();
      setStatistics(stats);
    } catch (e) {
      console.error('Error loading statistics:', e);
    }
  }

  async function loadRatings() {
    try {
      const res = await fetch(`${api}/ratings/${storyId}`);
      const data = await res.json();
      setRatings(data);
    } catch (e) {
      console.error('Error loading ratings:', e);
    }
  }

  async function loadUserRating() {
    try {
      const res = await fetch(`${api}/ratings/${storyId}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data) {
        setUserRating(data);
        setSelectedRating(data.rating);
        setComment(data.comment || '');
      }
    } catch (e) {
      console.error('Error loading user rating:', e);
    }
  }

  async function submitRating() {
    if (selectedRating === 0) {
      alert('Veuillez sélectionner une note');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${api}/ratings/${storyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating: selectedRating, comment })
      });

      if (res.ok) {
        await loadRatings();
        await loadStatistics();
        await loadUserRating();
        setShowForm(false);
        alert('Votre note a été enregistrée !');
      } else {
        alert('Erreur lors de l\'enregistrement de la note');
      }
    } catch (e) {
      console.error('Error submitting rating:', e);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  }

  const renderStars = (rating, interactive = false, size = 'medium') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : ''} ${size} ${interactive ? 'interactive' : ''}`}
          onClick={() => interactive && setSelectedRating(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="rating-section">
      <div className="rating-header">
        <h3>📊 Notes et Commentaires</h3>
        {statistics && (
          <div className="rating-overview">
            <div className="average-rating">
              <div className="rating-number">{statistics.averageRating.toFixed(1)}</div>
              <div className="rating-stars">{renderStars(Math.round(statistics.averageRating))}</div>
              <div className="rating-count">{statistics.totalRatings} avis</div>
            </div>
            
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="distribution-row">
                  <span className="star-label">{star} ★</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-fill"
                      style={{ 
                        width: `${statistics.totalRatings > 0 ? (statistics.distribution[star] / statistics.totalRatings) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="distribution-count">{statistics.distribution[star]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isAuthenticated && (
        <div className="user-rating-section">
          {userRating ? (
            <div className="user-rating-display">
              <p>Votre note : {renderStars(userRating.rating)} </p>
              {userRating.comment && <p className="user-comment">"{userRating.comment}"</p>}
              <button onClick={() => setShowForm(!showForm)} className="btn-edit-rating">
                Modifier ma note
              </button>
            </div>
          ) : (
            <button onClick={() => setShowForm(!showForm)} className="btn-add-rating">
              ⭐ Laisser une note
            </button>
          )}

          {showForm && (
            <div className="rating-form">
              <h4>Votre avis</h4>
              <div className="star-selector">
                {renderStars(selectedRating, true, 'large')}
              </div>
              <textarea
                placeholder="Partagez votre expérience (optionnel)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
              <div className="form-actions">
                <button onClick={submitRating} disabled={loading} className="btn-submit">
                  {loading ? 'Envoi...' : 'Enregistrer'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-cancel">
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="ratings-list">
        <h4>Commentaires des lecteurs</h4>
        {ratings.length === 0 ? (
          <p className="no-ratings">Aucun commentaire pour le moment.</p>
        ) : (
          <div className="ratings-grid">
            {ratings.map((rating) => (
              <div key={rating.id} className="rating-card">
                <div className="rating-card-header">
                  <span className="rating-username">{rating.username}</span>
                  <span className="rating-stars-small">{renderStars(rating.rating, false, 'small')}</span>
                </div>
                {rating.comment && <p className="rating-comment">{rating.comment}</p>}
                <span className="rating-date">
                  {new Date(rating.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
