import React, { useState, useEffect } from 'react';
import './MyReviews.css';

const api = 'http://localhost:4000/api';

export default function MyReviews() {
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  useEffect(() => {
    loadMyReviews();
  }, []);

  async function loadMyReviews() {
    const token = localStorage.getItem('nahb_token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${api}/ratings/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setMyReviews(data);
      } else {
        console.error('Failed to load reviews:', res.status);
      }
    } catch (e) {
      console.error('Error loading reviews:', e);
    } finally {
      setLoading(false);
    }
  }

  async function deleteReview(storyId) {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }

    const token = localStorage.getItem('nahb_token');
    try {
      const res = await fetch(`${api}/ratings/${storyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        await loadMyReviews();
      } else {
        console.error('Erreur lors de la suppression');
      }
    } catch (e) {
      console.error('Error deleting review:', e);
    }
  }

  async function updateReview(storyId) {
    if (editRating === 0) {
      return;
    }

    const token = localStorage.getItem('nahb_token');
    try {
      const res = await fetch(`${api}/ratings/${storyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating: editRating, comment: editComment })
      });

      if (res.ok) {
        setEditingReview(null);
        setEditRating(0);
        setEditComment('');
        await loadMyReviews();
      } else {
        console.error('Erreur lors de la modification');
      }
    } catch (e) {
      console.error('Error updating review:', e);
    }
  }

  function startEdit(review) {
    const storyId = typeof review.storyId === 'object' 
      ? (review.storyId._id || review.storyId.id) 
      : review.storyId;
    setEditingReview(storyId);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  }

  function cancelEdit() {
    setEditingReview(null);
    setEditRating(0);
    setEditComment('');
  }

  if (loading) {
    return <div className="my-reviews-container"><p className="loading-text">Chargement...</p></div>;
  }

  return (
    <div className="my-reviews-container">
      <div className="my-reviews-header">
        <h2>Mes Avis</h2>
        <p className="reviews-count">{myReviews.length} avis laissé{myReviews.length > 1 ? 's' : ''}</p>
      </div>

      {myReviews.length === 0 ? (
        <div className="no-reviews">
          <p>Vous n'avez pas encore laissé d'avis.</p>
          <p className="hint">Jouez à une histoire et laissez votre première évaluation !</p>
        </div>
      ) : (
        <div className="reviews-grid">
          {myReviews.map((review) => {
            const storyId = typeof review.storyId === 'object' 
              ? (review.storyId._id || review.storyId.id) 
              : review.storyId;
            const storyTitle = typeof review.storyId === 'object' 
              ? review.storyId.title 
              : 'Histoire';
            const isEditing = editingReview === storyId;

            return (
              <div key={storyId} className="my-review-card">
                <div className="review-story-info">
                  <h3>{storyTitle}</h3>
                  <p className="review-date">
                    {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {isEditing ? (
                  <div className="edit-form">
                    <div className="edit-rating">
                      <label>Note:</label>
                      <div className="star-selector">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span
                            key={star}
                            className={`star ${star <= editRating ? 'selected' : ''}`}
                            onClick={() => setEditRating(star)}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="edit-comment">
                      <label>Commentaire:</label>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        placeholder="Votre commentaire (optionnel)..."
                        rows="4"
                      />
                    </div>
                    <div className="edit-actions">
                      <button className="btn-save" onClick={() => updateReview(storyId)}>
                        Enregistrer
                      </button>
                      <button className="btn-cancel" onClick={cancelEdit}>
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="review-content">
                      <div className="review-rating-display">
                        {'⭐'.repeat(review.rating)}
                        <span className="rating-number">({review.rating}/5)</span>
                      </div>
                      {review.comment && (
                        <p className="review-comment-text">{review.comment}</p>
                      )}
                    </div>
                    <div className="review-actions">
                      <button className="btn-edit" onClick={() => startEdit(review)}>
                        ✏️ Modifier
                      </button>
                      <button className="btn-delete" onClick={() => deleteReview(storyId)}>
                        🗑️ Supprimer
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
