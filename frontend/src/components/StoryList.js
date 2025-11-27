import React, { useState, useEffect } from 'react';
import './StoryList.css';

const THEMES = [
  { value: '', label: 'Tous les thèmes' },
  { value: 'fantasy', label: '🧙 Fantasy' },
  { value: 'sci-fi', label: '🚀 Science-Fiction' },
  { value: 'horror', label: '👻 Horreur' },
  { value: 'mystery', label: '🔍 Mystère' },
  { value: 'romance', label: '❤️ Romance' },
  { value: 'adventure', label: '⚔️ Aventure' },
  { value: 'historical', label: '🏛️ Historique' },
  { value: 'comedy', label: '😄 Comédie' },
  { value: 'ocean', label: '🌊 Océan' }
];

export default function StoryList({ api, token, onEdit, onSelectStory }) {
  const [stories, setStories] = useState([]);
  const [q, setQ] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [ratings, setRatings] = useState({});
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedStoryReviews, setSelectedStoryReviews] = useState(null);
  const [reviewsData, setReviewsData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    // Decode token to get current user info
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({ id: payload.id, isAdmin: payload.isAdmin });
      } catch(e) {
        console.error('Error decoding token:', e);
      }
    }
  }, [token]);
  
  useEffect(() => { 
    fetchList(); 
  }, [selectedTheme]);
  
  async function fetchList(){
    try {
      let url = api + '/stories?published=1';
      if (q) url += '&q=' + encodeURIComponent(q);
      if (selectedTheme) url += '&theme=' + encodeURIComponent(selectedTheme);
      
      const res = await fetch(url);
      const j = await res.json();
      console.log('Fetched stories:', j);
      console.log('First story:', j[0]);
      console.log('First story keys:', j[0] ? Object.keys(j[0]) : 'no stories');
      setStories(j);
      
      // Load ratings for each story
      j.forEach(story => {
        loadRatingForStory(story.id || story._id);
      });
    } catch(e) {
      console.error('Error fetching stories:', e);
      setStories([]);
    }
  }
  
  async function loadRatingForStory(storyId) {
    try {
      const res = await fetch(api + '/ratings/' + storyId + '/statistics');
      const stats = await res.json();
      setRatings(prev => ({ ...prev, [storyId]: stats }));
    } catch(e) {
      console.error('Error loading rating for story:', storyId, e);
    }
  }
  
  async function loadReviews(storyId, storyTitle) {
    try {
      const res = await fetch(api + '/ratings/' + storyId);
      const data = await res.json();
      setSelectedStoryReviews({ id: storyId, title: storyTitle });
      // data is already an array, not an object with a ratings property
      setReviewsData(Array.isArray(data) ? data : []);
      setShowReviewsModal(true);
    } catch(e) {
      console.error('Error loading reviews:', e);
      alert('Erreur lors du chargement des avis');
    }
  }
  
  async function deleteReview(storyId, reviewUserId) {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }
    
    try {
      const res = await fetch(api + '/ratings/' + storyId, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + token
        }
      });
      
      if (res.ok) {
        // Reload reviews
        await loadReviews(storyId, selectedStoryReviews.title);
        // Reload ratings stats
        await loadRatingForStory(storyId);
      } else {
        const error = await res.json();
        console.error('Erreur:', error.error || 'Impossible de supprimer l\'avis');
      }
    } catch(e) {
      console.error('Error deleting review:', e);
    }
  }
  
  return (
    <div className="story-list-container">
      <div className="story-list-header">
        <h2>Histoires Interactives</h2>
        <p>Choisissez votre aventure et vivez une expérience unique</p>
        
        <div className="filters-section">
          <div className="theme-filters">
            {THEMES.map(theme => (
              <button
                key={theme.value}
                className={`theme-btn ${selectedTheme === theme.value ? 'active' : ''}`}
                onClick={() => setSelectedTheme(theme.value)}
              >
                {theme.label}
              </button>
            ))}
          </div>
          
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Rechercher une histoire par titre..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchList()}
            />
            <button onClick={fetchList}>Rechercher</button>
          </div>
        </div>
      </div>
      
      {stories.length === 0 ? (
        <div className="no-stories">
          <p>Aucune histoire disponible pour le moment...</p>
        </div>
      ) : (
        <div className="story-grid">
          {stories.map(s => {
            const storyId = s.id || s._id;
            return (
              <div key={storyId} className="story-card">
                {s.theme && (
                  <div className="story-theme-badge">
                    {THEMES.find(t => t.value === s.theme)?.label || s.theme}
                  </div>
                )}
                <div className="story-card-content" onClick={() => {
                  console.log('Clicked story, id:', storyId, 's.id:', s.id, 's._id:', s._id); 
                  if(onSelectStory) {
                    onSelectStory(storyId);
                  } else {
                    console.error('onSelectStory is not defined!');
                  }
                }}>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </div>
                {ratings[storyId] && ratings[storyId].totalRatings > 0 && (
                  <div className="story-rating">
                    <span className="rating-stars">
                      {'⭐'.repeat(Math.round(ratings[storyId].averageRating))}
                    </span>
                    <span className="rating-text">
                      {ratings[storyId].averageRating.toFixed(1)} ({ratings[storyId].totalRatings} avis)
                    </span>
                  </div>
                )}
                {s.tags && s.tags.length > 0 && (
                  <div className="story-tags">
                    {s.tags.map((tag, idx) => (
                      <span key={idx} className="story-tag">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="story-meta">
                  <span>Auteur: {s.author?.username || 'Anonyme'}</span>
                  <span>Pages: {s.pages?.length || 0}</span>
                </div>
                {ratings[storyId] && ratings[storyId].totalRatings > 0 && (
                  <button 
                    className="btn-view-reviews"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadReviews(storyId, s.title);
                    }}
                  >
                    💬 Voir les avis ({ratings[storyId].totalRatings})
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {showReviewsModal && selectedStoryReviews && (
        <div className="reviews-modal-overlay" onClick={() => setShowReviewsModal(false)}>
          <div className="reviews-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reviews-modal-header">
              <h2>💬 Avis sur "{selectedStoryReviews.title}"</h2>
              <button className="btn-close-modal" onClick={() => setShowReviewsModal(false)}>✕</button>
            </div>
            <div className="reviews-modal-content">
              {reviewsData.length === 0 ? (
                <p className="no-reviews">Aucun avis pour cette histoire</p>
              ) : (
                <div className="reviews-list">
                  {reviewsData.map((review, idx) => {
                    const canModify = currentUser && (
                      currentUser.id === review.userId?._id || 
                      currentUser.id === review.userId?.id ||
                      currentUser.isAdmin
                    );
                    
                    return (
                      <div key={idx} className="review-item">
                        <div className="review-header">
                          <div className="review-rating">
                            {'⭐'.repeat(review.rating)}
                            <span className="review-rating-number">({review.rating}/5)</span>
                          </div>
                          <div className="review-author">
                            {review.userId?.username || review.username || 'Anonyme'}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="review-comment">{review.comment}</p>
                        )}
                        <div className="review-footer">
                          <div className="review-date">
                            {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          {canModify && (
                            <div className="review-actions">
                              <button 
                                className="btn-delete-review"
                                onClick={() => deleteReview(selectedStoryReviews.id, review.userId?._id || review.userId?.id)}
                                title="Supprimer cet avis"
                              >
                                🗑️ Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
