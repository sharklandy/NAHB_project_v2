import React, { useState, useEffect } from 'react';
import '../styles/PlayView.css';
import '../styles/FantasyTheme.css';
import RatingSection from './RatingSection';
import ReportModal from './ReportModal';

export default function PlayView({ api, token, storyId, onBackToList }){
  console.log('PlayView mounted with storyId:', storyId);
  const [currentStoryId, setCurrentStoryId] = useState(storyId);
  const [page, setPage] = useState(null);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyTheme, setStoryTheme] = useState('');
  const [playId, setPlayId] = useState(null);
  const [path, setPath] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [pathStats, setPathStats] = useState(null);
  const [unlockedEndings, setUnlockedEndings] = useState([]);
  const [showEndings, setShowEndings] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showReadMoreModal, setShowReadMoreModal] = useState(false);
  const [readMoreContent, setReadMoreContent] = useState('');
  const [readMoreTitle, setReadMoreTitle] = useState('');
  const [userThemeMode, setUserThemeMode] = useState(() => {
    return localStorage.getItem('nahb_theme') || 'light';
  });
  
  // Écouter les changements de thème
  useEffect(() => {
    const handleThemeChange = () => {
      const newTheme = localStorage.getItem('nahb_theme') || 'light';
      console.log('Thème changé:', newTheme);
      setUserThemeMode(newTheme);
    };
    
    window.addEventListener('storage', handleThemeChange);
    
    // Vérifier périodiquement (pour les changements dans le même onglet)
    const interval = setInterval(() => {
      const currentTheme = localStorage.getItem('nahb_theme') || 'light';
      if (currentTheme !== userThemeMode) {
        console.log('Thème actuel:', currentTheme);
        setUserThemeMode(currentTheme);
      }
    }, 100);
    
    return () => {
      window.removeEventListener('storage', handleThemeChange);
      clearInterval(interval);
    };
  }, [userThemeMode]);
  
  useEffect(() => {
    console.log('PlayView useEffect, storyId:', storyId);
    if(storyId) {
      setCurrentStoryId(storyId);
      // Check if preview mode from URL
      const urlParams = new URLSearchParams(window.location.search);
      const preview = urlParams.get('preview') === 'true';
      setIsPreviewMode(preview);
      startStory(storyId, preview);
    }
  }, [storyId]);

  function excerpt(text, maxLength = 160) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
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
  
  async function startStory(id, preview = false){
    const headers = {};
    if (token) {
      headers.Authorization = 'Bearer ' + token;
    }
    const url = preview ? api + '/play/' + id + '/start?preview=true' : api + '/play/' + id + '/start';
    const r2 = await fetch(url, { 
      method: 'POST', 
      headers: headers
    });
    const j = await r2.json();
    if(j.error) {
      alert('Erreur: ' + j.error);
      return;
    }
    setPage(j.page);
    setPlayId(j.playId);
    setPath([j.page.pageId]);
    setIsPreviewMode(j.isPreview || false);
    
    const res = await fetch(api + '/stories/' + id);
    const story = await res.json();
    setStoryTitle(story.title || 'Histoire');
    setStoryTheme(story.theme || 'fantasy');
    
    // Load unlocked endings
    loadUnlockedEndings(id);
    
    // Show saved game notification
    if (j.savedGame) {
      console.log('Partie sauvegardée reprise');
    }
  }
  
  async function loadUnlockedEndings(id) {
    if (!token) {
      setUnlockedEndings([]);
      return;
    }
    try {
      const res = await fetch(api + '/play/' + id + '/endings', {
        headers: { Authorization: 'Bearer ' + token }
      });
      const endings = await res.json();
      setUnlockedEndings(endings);
    } catch(e) {
      console.error('Error loading endings:', e);
    }
  }
  
  async function choose(choiceIndex){
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = 'Bearer ' + token;
    }
    const res = await fetch(api + '/play/' + currentStoryId + '/choose', { 
      method: 'POST', 
      headers: headers, 
      body: JSON.stringify({ 
        currentPageId: page.pageId, 
        choiceIndex,
        playId 
      })
    });
    const j = await res.json();
    if(j.error) {
      alert('Erreur: ' + j.error);
      return;
    }
    if(j.page) {
      setPage(j.page);
      setPlayId(j.playId);
      setPath([...path, j.page.pageId]);
      
      // If reaching an end, load statistics
      if (j.page.isEnd) {
        await loadStatistics(currentStoryId, j.page.pageId);
        await loadUnlockedEndings(currentStoryId);
      }
    } else { 
      console.log('Fin de l\'histoire'); 
      setPage(null); 
    }
  }
  
  async function loadStatistics(id, endPageId) {
    try {
      // Load story statistics
      const statsRes = await fetch(api + '/play/' + id + '/statistics');
      const stats = await statsRes.json();
      setStatistics(stats);
      
      // Load path statistics only if token available
      if (token && path.length > 0) {
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers.Authorization = 'Bearer ' + token;
        }
        const pathRes = await fetch(api + '/play/' + id + '/path-stats', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ endPageId, userPath: path })
        });
        const pathSt = await pathRes.json();
        setPathStats(pathSt);
      }
    } catch(e) {
      console.error('Error loading statistics:', e);
    }
  }
  
  // Déterminer la classe de thème en se basant sur le thème global (body.dark-theme)
  const getThemeClass = () => {
    const isDark = typeof document !== 'undefined' && document.body.classList.contains('dark-theme');
    // si on est en mode clair et que l'histoire a un thème spécifique, appliquer les variantes "-light"
    if ((storyTheme === 'Fantasy' || storyTheme === 'fantasy') && !isDark) {
      return 'theme-fantasy-light';
    }
    if ((storyTheme === 'Ocean' || storyTheme === 'ocean') && !isDark) {
      return 'theme-ocean-light';
    }
    // Ajouter d'autres thèmes ici plus tard
    return '';
  };
  
  return (
    <div className={`play-view-container ${getThemeClass()}`}>
      {/* Preview mode banner */}
      {isPreviewMode && (
        <div className="preview-mode-banner">
          👁️ MODE PRÉVISUALISATION - Cette session ne sera pas enregistrée dans les statistiques
        </div>
      )}
      
      {/* Éléments de décor pour fantasy-light */}
      {(storyTheme === 'Fantasy' || storyTheme === 'fantasy') && userThemeMode === 'light' && (
        <div className="theme-background-fantasy-light">
          <div className="fantasy-bg-layer"></div>
          <div className="fantasy-tower"></div>
          <div className="fantasy-dragon"></div>
        </div>
      )}
      
      {storyTitle && (
        <div className="story-header">
          <h2>{storyTitle}</h2>
        </div>
      )}
      
      {!page && !currentStoryId && (
        <div className="select-message">
          <p>Sélectionnez une histoire dans la liste pour commencer à lire.</p>
        </div>
      )}
      
      {page && (
        <div className="story-page">
          <div className="story-content">
            <p>{page.content}</p>
          </div>
          
          {page.isEnd ? (
            <div className="ending-message">
              <h4>🎭 {page.endLabel || 'Fin de cette histoire !'}</h4>
              <p>Vous avez terminé cette aventure.</p>
              
              {pathStats && (
                <div className="path-statistics">
                  <p className="stat-highlight">
                    📊 Vous avez pris le même chemin que <strong>{pathStats.similarityPercentage}%</strong> des joueurs qui ont atteint cette fin.
                  </p>
                  <p className="stat-detail">
                    Cette fin a été atteinte {pathStats.totalPlays} fois.
                  </p>
                </div>
              )}
              
              {statistics && (
                <div className="story-statistics">
                  <h5>📈 Statistiques globales</h5>
                  <p>Total de parties jouées : <strong>{statistics.totalPlays}</strong></p>
                  {statistics.endings && statistics.endings.length > 0 && (
                    <div className="endings-distribution">
                      <h6>Répartition des fins :</h6>
                      {statistics.endings.map((ending, idx) => (
                        <div key={idx} className="ending-stat">
                          <span className="ending-label">{ending.label}</span>
                          <div className="ending-bar">
                            <div 
                              className="ending-bar-fill" 
                              style={{width: `${ending.percentage}%`}}
                            ></div>
                          </div>
                          <span className="ending-percentage">{ending.percentage}% ({ending.count} fois)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {unlockedEndings.length > 0 && (
                <div className="unlocked-endings">
                  <button 
                    className="btn-show-endings"
                    onClick={() => setShowEndings(!showEndings)}
                  >
                    🏆 Voir mes fins débloquées ({unlockedEndings.length})
                  </button>
                  {showEndings && (
                    <div className="endings-list">
                      {unlockedEndings.map((ending, idx) => (
                            <div key={idx} className="unlocked-ending-card">
                              <h6>{ending.label}</h6>
                              <div className="unlocked-ending-body">
                                <p>{excerpt(ending.content, 160)}</p>
                                {ending.content && ending.content.length > 160 && (
                                  <button className="read-more-btn" onClick={() => openReadMore(ending.content, ending.label)}>Lire la suite</button>
                                )}
                              </div>
                            </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="ending-actions">
                <button onClick={() => startStory(currentStoryId)}>
                  🔄 Rejouer cette histoire
                </button>
                <button onClick={() => { 
                  setPage(null); 
                  setCurrentStoryId(null); 
                  setStatistics(null);
                  setPathStats(null);
                  if(onBackToList) onBackToList();
                }}>
                  📚 Retour à la liste des histoires
                </button>
              </div>
              
              <RatingSection 
                api={api} 
                token={token} 
                storyId={currentStoryId}
                isAuthenticated={!!token}
              />
              
              <div className="report-section">
                <button 
                  className="btn-report-story"
                  onClick={() => setShowReportModal(true)}
                >
                  🚨 Signaler cette histoire
                </button>
              </div>
            </div>
          ) : (
            <div className="choices-container">
              <h4>Que voulez-vous faire ?</h4>
              {page.choices.map((c, idx) => (
                <button 
                  key={idx} 
                  className="choice-button"
                  onClick={() => choose(idx)}
                >
                  {c.text}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {showReportModal && (
        <ReportModal
          api={api}
          token={token}
          storyId={currentStoryId}
          storyTitle={storyTitle}
          onClose={() => setShowReportModal(false)}
        />
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

// Read More modal is rendered inside PlayView; keep helper exported if needed elsewhere
