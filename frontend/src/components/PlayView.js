import React, { useState, useEffect } from 'react';
import './PlayView.css';
import RatingSection from './RatingSection';
import ReportModal from './ReportModal';

export default function PlayView({ api, token, storyId, onBackToList }){
  console.log('PlayView mounted with storyId:', storyId);
  const [currentStoryId, setCurrentStoryId] = useState(storyId);
  const [page, setPage] = useState(null);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyTheme, setStoryTheme] = useState('');
  const [userThemeMode, setUserThemeMode] = useState('light'); // light ou dark
  const [playId, setPlayId] = useState(null);
  const [path, setPath] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [pathStats, setPathStats] = useState(null);
  const [unlockedEndings, setUnlockedEndings] = useState([]);
  const [showEndings, setShowEndings] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  useEffect(() => {
    console.log('PlayView useEffect, storyId:', storyId);
    if(storyId) {
      setCurrentStoryId(storyId);
      startStory(storyId);
    }
  }, [storyId]);
  
  async function startStory(id){
    const headers = {};
    if (token) {
      headers.Authorization = 'Bearer ' + token;
    }
    const r2 = await fetch(api + '/play/' + id + '/start', { 
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
  
  // Déterminer la classe de thème
  const getThemeClass = () => {
    if ((storyTheme === 'Fantasy' || storyTheme === 'fantasy') && userThemeMode === 'light') {
      return 'theme-fantasy-light';
    }
    if ((storyTheme === 'Ocean' || storyTheme === 'ocean') && userThemeMode === 'light') {
      return 'theme-ocean-light';
    }
    // Ajouter d'autres thèmes ici plus tard
    return '';
  };
  
  return (
    <div className={`play-view-container ${getThemeClass()}`}>
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
                          <p>{ending.content.substring(0, 100)}...</p>
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
    </div>
  );
}
