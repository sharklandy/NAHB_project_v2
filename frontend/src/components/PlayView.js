import React, { useState, useEffect } from 'react';
import './PlayView.css';

export default function PlayView({ api, token, storyId, onBackToList }){
  console.log('PlayView mounted with storyId:', storyId);
  const [currentStoryId, setCurrentStoryId] = useState(storyId);
  const [page, setPage] = useState(null);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyTheme, setStoryTheme] = useState('');
  const [userThemeMode, setUserThemeMode] = useState('light'); // light ou dark
  
  useEffect(() => {
    console.log('PlayView useEffect, storyId:', storyId);
    if(storyId) {
      setCurrentStoryId(storyId);
      startStory(storyId);
    }
  }, [storyId]);
  
  async function startStory(id){
    const r2 = await fetch(api + '/play/' + id + '/start', { 
      method: 'POST', 
      headers: { Authorization: 'Bearer ' + token }
    });
    const j = await r2.json();
    if(j.error) {
      alert('Erreur: ' + j.error);
      return;
    }
    setPage(j.page);
    const res = await fetch(api + '/stories/' + id);
    const story = await res.json();
    setStoryTitle(story.title || 'Histoire');
    
    // Déterminer le thème basé sur le champ theme de l'histoire
    setStoryTheme(story.theme || 'Fantasy');
  }
  
  async function choose(choiceIndex){
    const res = await fetch(api + '/play/' + currentStoryId + '/choose', { 
      method: 'POST', 
      headers: { 
        Authorization: 'Bearer ' + token, 
        'Content-Type': 'application/json' 
      }, 
      body: JSON.stringify({ currentPageId: page.pageId, choiceIndex })
    });
    const j = await res.json();
    if(j.error) {
      alert('Erreur: ' + j.error);
      return;
    }
    if(j.page) setPage(j.page);
    else { 
      alert('Fin de l histoire'); 
      setPage(null); 
    }
  }
  
  // Déterminer la classe de thème
  const getThemeClass = () => {
    if (storyTheme === 'Fantasy' && userThemeMode === 'light') {
      return 'theme-fantasy-light';
    }
    // Ajouter d'autres thèmes ici plus tard
    return '';
  };
  
  return (
    <div className={`play-view-container ${getThemeClass()}`}>
      {/* Éléments de décor pour fantasy-light */}
      {storyTheme === 'Fantasy' && userThemeMode === 'light' && (
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
              <h4>Fin de cette histoire !</h4>
              <p>Vous avez terminé cette aventure. Que souhaitez-vous faire ?</p>
              <div className="ending-actions">
                <button onClick={() => startStory(currentStoryId)}>
                  Rejouer cette histoire
                </button>
                <button onClick={() => { 
                  setPage(null); 
                  setCurrentStoryId(null); 
                  if(onBackToList) onBackToList();
                }}>
                  Retour à la liste des histoires
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
    </div>
  );
}
