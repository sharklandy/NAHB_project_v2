import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MyStories.css';

export default function MyStories({ api, token, user }) {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [advancedStats, setAdvancedStats] = useState(null);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [showReadMoreModal, setShowReadMoreModal] = useState(false);
  const [readMoreContent, setReadMoreContent] = useState('');
  const [readMoreTitle, setReadMoreTitle] = useState('');

  useEffect(() => {
    loadAuthorStories();
  }, []);

  async function loadAuthorStories() {
    try {
      setLoading(true);
      const res = await fetch(api + '/author/stories', {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await res.json();
      setStories(data);
    } catch (e) {
      console.error('Error loading author stories:', e);
      alert('Erreur lors du chargement de vos histoires');
    } finally {
      setLoading(false);
    }
  }

  async function loadAdvancedStats(storyId) {
    try {
      const res = await fetch(api + '/author/stories/' + storyId + '/advanced-stats', {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await res.json();
      setAdvancedStats(data);
      setShowAdvancedModal(true);
    } catch (e) {
      console.error('Error loading advanced stats:', e);
      alert('Erreur lors du chargement des statistiques avancées');
    }
  }

  function excerpt(text, maxLength = 160) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    // Truncate at the last space before maxLength to avoid cutting words
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > Math.floor(maxLength * 0.6)) {
      return truncated.slice(0, lastSpace) + '…';
    }
    return truncated + '…';
  }

  function openReadMore(content, title = '') {
    setReadMoreContent(content || '');
    setReadMoreTitle(title || '');
    setShowReadMoreModal(true);
  }

  function closeReadMore() {
    setShowReadMoreModal(false);
    setReadMoreContent('');
    setReadMoreTitle('');
  }

  async function toggleStatus(story) {
    const newStatus = story.status === 'published' ? 'draft' : 'published';
    const confirmMsg = newStatus === 'published' 
      ? 'Publier cette histoire ? Elle sera visible par tous les lecteurs.'
      : 'Mettre cette histoire en brouillon ? Elle ne sera plus visible publiquement.';
    
    if (!window.confirm(confirmMsg)) return;
    
    try {
      const storyId = story.id || story._id;
      const res = await fetch(api + '/stories/' + storyId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        await loadAuthorStories();
        alert(newStatus === 'published' ? '✅ Histoire publiée avec succès !' : '✅ Histoire mise en brouillon');
      } else {
        alert('Erreur lors de la modification du statut');
      }
    } catch (e) {
      console.error('Error toggling status:', e);
      alert('Erreur lors de la modification du statut');
    }
  }

  async function deleteStory(story) {
    const confirmMsg = `Êtes-vous sûr de vouloir supprimer "${story.title}" ?\n\nCette action est irréversible et supprimera également toutes les statistiques associées.`;
    
    if (!window.confirm(confirmMsg)) return;
    
    try {
      const storyId = story.id || story._id;
      const res = await fetch(api + '/stories/' + storyId, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token }
      });
      
      if (res.ok) {
        await loadAuthorStories();
        alert('✅ Histoire supprimée avec succès');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (e) {
      console.error('Error deleting story:', e);
      alert('Erreur lors de la suppression');
    }
  }

  function previewStory(story) {
    const storyId = story.id || story._id;
    navigate(`/play/${storyId}?preview=true`);
  }

  function editStory(story) {
    navigate('/editor');
  }

  const getStatusBadge = (status) => {
    const badges = {
      published: { label: 'Publiée', className: 'status-published' },
      draft: { label: 'Brouillon', className: 'status-draft' },
      suspended: { label: 'Suspendue', className: 'status-suspended' }
    };
    const badge = badges[status] || badges.draft;
    return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
  };

  if (loading) {
    return <div className="my-stories-container"><p className="loading-message">⏳ Chargement de vos histoires...</p></div>;
  }

  return (
    <div className="my-stories-container">
      <div className="my-stories-header">
        <h2>📚 Mes Histoires</h2>
        <button className="btn-create-story" onClick={() => navigate('/editor')}>
          ✨ Créer une nouvelle histoire
        </button>
      </div>

      {stories.length === 0 ? (
        <div className="no-stories">
          <p>Vous n'avez pas encore créé d'histoires.</p>
          <button className="btn-primary" onClick={() => navigate('/editor')}>
            Créer ma première histoire
          </button>
        </div>
      ) : (
        <div className="stories-grid">
          {stories.map(story => {
            const storyId = story.id || story._id;
            const stats = story.stats || {};
            
            return (
              <div key={storyId} className="story-card">
                <div className="story-card-header">
                  <h3>{story.title}</h3>
                  {getStatusBadge(story.status)}
                </div>
                
                <p className="story-description">{story.description || 'Pas de description'}</p>
                
                <div className="story-metadata">
                  <span className="story-theme">{story.theme || 'Sans thème'}</span>
                  <span className="story-pages">{story.pages?.length || 0} pages</span>
                </div>

                <div className="story-stats">
                  <h4>📊 Statistiques</h4>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">👁️ Lectures</span>
                      <span className="stat-value">{stats.totalPlays || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">✅ Complétées</span>
                      <span className="stat-value">{stats.completedPlays || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">⭐ Note moyenne</span>
                      <span className="stat-value">{stats.avgRating || 0}/5</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">💬 Avis</span>
                      <span className="stat-value">{stats.totalRatings || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">📈 Taux complétion</span>
                      <span className="stat-value">{stats.completionRate || 0}%</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">❌ Abandons</span>
                      <span className="stat-value">{stats.abandonedPlays || 0}</span>
                    </div>
                  </div>
                  
                  {stats.endDistribution && stats.endDistribution.length > 0 && (
                    <div className="end-distribution">
                      <h5>🏆 Distribution des fins atteintes</h5>
                      {stats.endDistribution.map((end, idx) => (
                        <div key={idx} className="end-item">
                          <span className="end-label">{end.endLabel}</span>
                          <div className="end-bar-container">
                            <div 
                              className="end-bar" 
                              style={{ width: `${end.percentage}%` }}
                            />
                            <span className="end-count">{end.count} ({end.percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="story-actions">
                  <button 
                    className="btn-secondary btn-small" 
                    onClick={() => editStory(story)}
                    title="Modifier l'histoire"
                  >
                    ✏️ Éditer
                  </button>
                  
                  <button 
                    className="btn-secondary btn-small" 
                    onClick={() => previewStory(story)}
                    title="Tester l'histoire en mode preview"
                  >
                    👁️ Prévisualiser
                  </button>
                  
                  <button 
                    className="btn-secondary btn-small" 
                    onClick={() => loadAdvancedStats(storyId)}
                    title="Voir les statistiques détaillées"
                  >
                    📊 Stats avancées
                  </button>
                  
                  <button 
                    className={`btn-small ${story.status === 'published' ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => toggleStatus(story)}
                    title={story.status === 'published' ? 'Mettre en brouillon' : 'Publier'}
                  >
                    {story.status === 'published' ? '📦 Dépublier' : '🚀 Publier'}
                  </button>
                  
                  <button 
                    className="btn-danger btn-small" 
                    onClick={() => deleteStory(story)}
                    title="Supprimer définitivement l'histoire"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal des stats avancées */}
      {showAdvancedModal && advancedStats && (
        <div className="modal-overlay" onClick={() => setShowAdvancedModal(false)}>
          <div className="modal-content advanced-stats-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📊 Statistiques Avancées</h3>
              <button className="modal-close" onClick={() => setShowAdvancedModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="advanced-stats-grid">
                <div className="advanced-stat-card">
                  <h4>👥 Lecteurs uniques</h4>
                  <p className="big-number">{advancedStats.totalUniqueReaders || 0}</p>
                </div>
                
                <div className="advanced-stat-card">
                  <h4>📏 Longueur moyenne du parcours</h4>
                  <p className="big-number">{advancedStats.avgPathLength || 0} pages</p>
                </div>
                
                <div className="advanced-stat-card">
                  <h4>⏱️ Durée moyenne</h4>
                  <p className="big-number">{advancedStats.avgDuration || 0} min</p>
                </div>
                
                <div className="advanced-stat-card">
                  <h4>✅ Taux de complétion</h4>
                  <p className="big-number">{advancedStats.completionRate || 0}%</p>
                </div>
              </div>

              {advancedStats.mostVisitedPages && advancedStats.mostVisitedPages.length > 0 && (
                <div className="most-visited-pages">
                  <h4>🔥 Pages les plus visitées</h4>
                  <div className="pages-list">
                    {advancedStats.mostVisitedPages.map((page, idx) => (
                      <div key={idx} className="page-visit-item">
                        <span className="page-rank">#{idx + 1}</span>
                        <span className="page-content">{excerpt(page.content, 160)}</span>
                        <span className="page-visits">{page.visits} visites</span>
                        {page.content && page.content.length > 160 && (
                          <button className="read-more-btn" onClick={() => openReadMore(page.content, `Page #${idx + 1}`)}>Lire la suite</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {advancedStats.endDistribution && advancedStats.endDistribution.length > 0 && (
                <div className="end-distribution">
                  <h4>🏆 Distribution des fins</h4>
                  {advancedStats.endDistribution.map((end, idx) => (
                    <div key={idx} className="end-item">
                      <span className="end-label">{end.endLabel}</span>
                      <div className="end-bar-container">
                        <div 
                          className="end-bar" 
                          style={{ width: `${end.percentage}%` }}
                        />
                        <span className="end-count">{end.count} ({end.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAdvancedModal(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read More Modal */}
      {showReadMoreModal && (
        <div className="modal-overlay" onClick={closeReadMore}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{readMoreTitle || 'Contenu'}</h3>
              <button className="modal-close" onClick={closeReadMore}>✕</button>
            </div>
            <div className="modal-body">
              <div className="read-more-content">
                <p>{readMoreContent}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeReadMore}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
