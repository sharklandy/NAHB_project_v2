import React, { useState, useEffect } from 'react';
import './StoryList.css';

export default function StoryList({ api, token, onEdit, onSelectStory }) {
  const [stories, setStories] = useState([]);
  const [q, setQ] = useState('');
  
  useEffect(() => { 
    fetchList(); 
  }, []);
  
  async function fetchList(){
    try {
      const res = await fetch(api + '/stories?published=1' + (q ? '&q=' + encodeURIComponent(q) : ''));
      const j = await res.json();
      console.log('Fetched stories:', j);
      console.log('First story:', j[0]);
      console.log('First story keys:', j[0] ? Object.keys(j[0]) : 'no stories');
      setStories(j);
    } catch(e) {
      console.error('Error fetching stories:', e);
      setStories([]);
    }
  }
  
  return (
    <div className="story-list-container">
      <div className="story-list-header">
        <h2>Histoires Interactives</h2>
        <p>Choisissez votre aventure et vivez une expérience unique</p>
        
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
      
      {stories.length === 0 ? (
        <div className="no-stories">
          <p>Aucune histoire disponible pour le moment...</p>
        </div>
      ) : (
        <div className="story-grid">
          {stories.map(s => {
            const storyId = s.id || s._id;
            return (
              <div key={storyId} className="story-card" onClick={() => {
                console.log('Clicked story, id:', storyId, 's.id:', s.id, 's._id:', s._id); 
                if(onSelectStory) {
                  onSelectStory(storyId);
                } else {
                  console.error('onSelectStory is not defined!');
                }
              }}>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
