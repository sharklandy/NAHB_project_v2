import React, { useState, useEffect } from 'react';
import '../styles/MyReviews.css';

const api = 'http://localhost:4000/api';

export default function MyReviews() {
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('nahb_user') || 'null');
    setIsAdmin(user && user.email === 'admin@nahb.local');
    loadMyReviews();
  }, []);

  async function loadMyReviews() {
    const token = localStorage.getItem('nahb_token');
    if (!token) return;

    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('nahb_user') || 'null');
    const adminMode = user && user.email === 'admin@nahb.local';

    try {
      setLoading(true);
      const endpoint = adminMode ? `${api}/ratings/all` : `${api}/ratings/user/me`;
      const res = await fetch(endpoint, {
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

  async function deleteReview(storyId, userId = null) {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }

    const token = localStorage.getItem('nahb_token');
    try {
      // If admin and userId is provided, use admin route
      const endpoint = isAdmin && userId 
        ? `${api}/ratings/${storyId}/user/${userId}`
        : `${api}/ratings/${storyId}`;
        
      const res = await fetch(endpoint, {
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

  // Filtrer les avis avec storyId null
  const validReviews = myReviews.filter(review => review.storyId != null);

  return (
    <div className="my-reviews-container">
      <div className="my-reviews-header">
        <h2>{isAdmin ? 'Tous les Avis' : 'Mes Avis'}</h2>
        <p className="reviews-count">{validReviews.length} avis {isAdmin ? 'au total' : 'laissé' + (validReviews.length > 1 ? 's' : '')}</p>
      </div>

      {validReviews.length === 0 ? (
        <div className="no-reviews">
          <p>Vous n'avez pas encore laissé d'avis.</p>
          <p className="hint">Jouez à une histoire et laissez votre première évaluation !</p>
        </div>
      ) : (
        <div className="reviews-grid">
          {validReviews.map((review) => {
            // Vérifier si storyId existe
            if (!review.storyId) {
              return null; // Ignorer les avis avec storyId null
            }

            const storyId = typeof review.storyId === 'object' 
              ? (review.storyId._id || review.storyId.id) 
              : review.storyId;
            const storyTitle = typeof review.storyId === 'object' 
              ? review.storyId.title 
              : 'Histoire';
            const userName = typeof review.userId === 'object' && review.userId
              ? review.userId.username
              : 'Utilisateur';
            const userId = typeof review.userId === 'object' && review.userId
              ? (review.userId._id || review.userId.id)
              : review.userId;
            const isEditing = editingReview === storyId;

            // Ne pas afficher si storyId est invalide
            if (!storyId) {
              return null;
            }

            return (
              <div key={storyId} className="my-review-card">
                <div className="review-story-info">
                  <h3>{storyTitle}</h3>
                  {isAdmin && (
                    <p className="review-user">👤 {userName}</p>
                  )}
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
                      <button className="btn-delete" onClick={() => deleteReview(storyId, userId)}>
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
