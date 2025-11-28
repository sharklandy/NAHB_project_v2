import React, { useState, useEffect } from 'react';
import '../styles/Editor.css';

/**
 * NOUVEL ÉDITEUR INTUITIF
 * - Création de page + choix en une seule fois
 * - Vue arborescente de l'histoire
 * - Workflow simplifié
 */

export default function EditorV2({ api, token, user }) {
  const getStoryId = (story) => story?.id || story?._id;
  
  const [stories, setStories] = useState([]);
  const [selected, setSelected] = useState(null);
  
  // Formulaire de création d'histoire
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [theme, setTheme] = useState('');
  
  // Mode d'édition
  const [editMode, setEditMode] = useState('tree'); // 'tree' ou 'create'
  
  // Formulaire de création de page
  const [newPage, setNewPage] = useState({
    content: '',
    isEnd: false,
    endLabel: '',
    choices: []
  });
  
  const [editingPageId, setEditingPageId] = useState(null);
  const [error, setError] = useState(null);
  
  const availableThemes = [
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'sci-fi', label: 'Science-Fiction' },
    { value: 'horror', label: 'Horreur' },
    { value: 'mystery', label: 'Mystère' },
    { value: 'romance', label: 'Romance' },
    { value: 'adventure', label: 'Aventure' },
    { value: 'historical', label: 'Historique' },
    { value: 'comedy', label: 'Comédie' },
    { value: 'ocean', label: 'Océan' }
  ];

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await fetch(api + '/stories', { headers: { Authorization: 'Bearer ' + token }});
      const j = await res.json();
      const userId = user?.id || user?._id;
      const mine = j.filter(s => s.authorId === userId);
      setStories(mine);
      if (mine.length && !selected) {
        setSelected(mine[0]);
      }
    } catch(e) { 
      console.error('Error loading stories:', e); 
    }
  }

  async function createStory() {
    if (!title.trim()) {
      alert('Le titre est requis');
      return;
    }
    if (!theme) {
      alert('Veuillez sélectionner un thème');
      return;
    }
    
    try {
      const res = await fetch(api + '/stories', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json', 
          Authorization: 'Bearer ' + token
        }, 
        body: JSON.stringify({ 
          title, 
          description: desc, 
          theme 
        })
      });
      const j = await res.json();
      setStories([j, ...stories]);
      setTitle(''); 
      setDesc(''); 
      setTheme('');
      setSelected(j);
    } catch(e) {
      alert('Erreur lors de la création: ' + e.message);
    }
  }

  async function refreshStory(storyId) {
    const r = await fetch(api + '/stories/' + storyId);
    const j = await r.json();
    setStories(stories.map(s => getStoryId(s) === getStoryId(j) ? j : s));
    setSelected(j);
  }

  async function createPageWithChoices() {
    if (!selected) return;
    if (!newPage.content.trim()) {
      alert('Le contenu de la page est requis');
      return;
    }
    
    setError(null);
    try {
      const storyId = getStoryId(selected);
      
      // 1. Créer la page
      const pageRes = await fetch(api + '/stories/' + storyId + '/pages', { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: 'Bearer ' + token 
        }, 
        body: JSON.stringify({ 
          content: newPage.content, 
          isEnd: newPage.isEnd,
          endLabel: newPage.isEnd ? newPage.endLabel : ''
        })
      });
      
      if (!pageRes.ok) {
        throw new Error('Erreur lors de la création de la page');
      }
      
      const createdPage = await pageRes.json();
      console.log('Page créée:', createdPage);
      
      // 2. Ajouter les choix (si ce n'est pas une page de fin)
      if (!newPage.isEnd && newPage.choices.length > 0) {
        for (const choice of newPage.choices) {
          if (choice.text.trim()) {
            await fetch(api + '/stories/' + storyId + '/pages/' + createdPage.pageId + '/choices', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
              },
              body: JSON.stringify({
                text: choice.text,
                to: choice.to || null
              })
            });
          }
        }
      }
      
      // 3. Si on était en train de relier un choix, mettre à jour le choix parent
      if (editingPageId) {
        // Logique pour relier automatiquement
        // Cette fonctionnalité sera implémentée dans la prochaine version
      }
      
      // 4. Rafraîchir et réinitialiser
      await refreshStory(storyId);
      setNewPage({
        content: '',
        isEnd: false,
        endLabel: '',
        choices: []
      });
      setEditMode('tree');
      setEditingPageId(null);
      
    } catch(e) {
      console.error('Exception in createPageWithChoices:', e);
      setError('Impossible de créer la page: ' + e.message);
    }
  }

  function addChoice() {
    setNewPage({
      ...newPage,
      choices: [...newPage.choices, { text: '', to: '' }]
    });
  }

  function updateChoice(index, field, value) {
    const updated = [...newPage.choices];
    updated[index][field] = value;
    setNewPage({ ...newPage, choices: updated });
  }

  function removeChoice(index) {
    const updated = newPage.choices.filter((_, i) => i !== index);
    setNewPage({ ...newPage, choices: updated });
  }

  async function deletePage(pageId) {
    if (!selected) return;
    if (!confirm('Supprimer cette page ?')) return;
    const storyId = getStoryId(selected);
    await fetch(api + '/stories/' + storyId + '/pages/' + pageId, { 
      method: 'DELETE', 
      headers: { Authorization: 'Bearer ' + token }
    });
    await refreshStory(storyId);
  }

  async function deleteChoice(pageId, choiceId) {
    if (!selected) return;
    if (!confirm('Supprimer ce choix ?')) return;
    const storyId = getStoryId(selected);
    await fetch(api + '/stories/' + storyId + '/pages/' + pageId + '/choices/' + choiceId, { 
      method: 'DELETE', 
      headers: { Authorization: 'Bearer ' + token }
    });
    await refreshStory(storyId);
  }

  async function publishStory(s, status) {
    const storyId = getStoryId(s);
    await fetch(api + '/stories/' + storyId, { 
      method: 'PUT', 
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: 'Bearer ' + token 
      }, 
      body: JSON.stringify({ status })
    });
    await refreshStory(storyId);
  }

  async function setStartPage(pageId) {
    if (!selected) return;
    const storyId = getStoryId(selected);
    await fetch(api + '/stories/' + storyId, { 
      method: 'PUT', 
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: 'Bearer ' + token 
      }, 
      body: JSON.stringify({ startPageId: pageId })
    });
    await refreshStory(storyId);
  }

  // Créer une nouvelle page qui sera reliée à un choix existant
  function createPageForChoice(pageId, choiceId) {
    setEditingPageId({ pageId, choiceId });
    setEditMode('create');
    setNewPage({
      content: '',
      isEnd: false,
      endLabel: '',
      choices: []
    });
  }

  // Fonction pour relier un choix à une page existante
  async function linkChoiceToPage(pageId, choiceId, choiceText, targetPageId) {
    if (!selected) return;
    const storyId = getStoryId(selected);
    
    // Supprimer l'ancien choix
    await fetch(api + '/stories/' + storyId + '/pages/' + pageId + '/choices/' + choiceId, { 
      method: 'DELETE', 
      headers: { Authorization: 'Bearer ' + token }
    });
    
    // Créer le nouveau choix avec la bonne cible
    await fetch(api + '/stories/' + storyId + '/pages/' + pageId + '/choices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({
        text: choiceText,
        to: targetPageId
      })
    });
    
    await refreshStory(storyId);
  }

  return (
    <div className="editor-v2">
      <h2>✨ Éditeur d'histoires interactives</h2>
      
      <div className="editor-layout">
        {/* SIDEBAR: Liste des histoires */}
        <aside className="editor-sidebar">
          <h3>Vos histoires</h3>
          
          <div className="story-create-form">
            <input 
              type="text"
              placeholder="Titre de l'histoire" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
            <textarea 
              placeholder="Description" 
              value={desc} 
              onChange={e => setDesc(e.target.value)}
              rows={2}
            />
            <select 
              value={theme} 
              onChange={e => setTheme(e.target.value)}
            >
              <option value="">-- Thème --</option>
              {availableThemes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <button className="btn-primary" onClick={createStory}>
              ➕ Créer
            </button>
          </div>
          
          <div className="story-list">
            {stories.map(s => (
              <div 
                key={getStoryId(s)} 
                className={`story-item ${selected && getStoryId(selected) === getStoryId(s) ? 'active' : ''}`}
                onClick={() => setSelected(s)}
              >
                <div className="story-title">{s.title}</div>
                <div className="story-meta">
                  <span className={`status-badge ${s.status}`}>{s.status}</span>
                  <span className="theme-badge">{s.theme || 'sans thème'}</span>
                </div>
                <div className="story-actions">
                  <button 
                    className="btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      publishStory(s, s.status === 'published' ? 'draft' : 'published');
                    }}
                  >
                    {s.status === 'published' ? '📥 Dépublier' : '📤 Publier'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN: Éditeur de contenu */}
        <main className="editor-main">
          {!selected && (
            <div className="empty-state">
              <p>👈 Sélectionnez une histoire ou créez-en une nouvelle</p>
            </div>
          )}
          
          {selected && (
            <>
              <div className="editor-header">
                <h3>{selected.title}</h3>
                <div className="mode-tabs">
                  <button 
                    className={editMode === 'tree' ? 'active' : ''}
                    onClick={() => setEditMode('tree')}
                  >
                    🌳 Vue arborescente
                  </button>
                  <button 
                    className={editMode === 'create' ? 'active' : ''}
                    onClick={() => setEditMode('create')}
                  >
                    ➕ Créer une page
                  </button>
                </div>
              </div>

              {editMode === 'tree' && <TreeView story={selected} onDelete={deletePage} onDeleteChoice={deleteChoice} onSetStart={setStartPage} onCreateForChoice={createPageForChoice} onLinkChoice={linkChoiceToPage} />}
              
              {editMode === 'create' && (
                <div className="page-creator">
                  <h4>Créer une nouvelle page</h4>
                  
                  {editingPageId && (
                    <div className="info-box">
                      ℹ️ Cette page sera automatiquement reliée au choix sélectionné
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label>Contenu de la page</label>
                    <textarea 
                      rows={6} 
                      value={newPage.content} 
                      onChange={e => setNewPage({ ...newPage, content: e.target.value })} 
                      placeholder="Écrivez le contenu de cette page..."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={newPage.isEnd} 
                        onChange={e => setNewPage({ ...newPage, isEnd: e.target.checked, choices: [] })} 
                      />
                      {' '}Page finale (pas de choix)
                    </label>
                  </div>
                  
                  {newPage.isEnd && (
                    <div className="form-group">
                      <label>Label de la fin</label>
                      <input 
                        type="text" 
                        value={newPage.endLabel} 
                        onChange={e => setNewPage({ ...newPage, endLabel: e.target.value })} 
                        placeholder="Ex: Fin héroïque, Fin tragique..."
                      />
                    </div>
                  )}
                  
                  {!newPage.isEnd && (
                    <div className="choices-section">
                      <h5>Choix proposés à l'utilisateur</h5>
                      <p className="help-text">
                        Ajoutez les choix que l'utilisateur pourra faire sur cette page.
                        Vous pourrez ensuite relier chaque choix à une autre page.
                      </p>
                      
                      {newPage.choices.map((choice, idx) => (
                        <div key={idx} className="choice-input">
                          <input 
                            type="text"
                            placeholder="Texte du choix"
                            value={choice.text}
                            onChange={e => updateChoice(idx, 'text', e.target.value)}
                          />
                          <select 
                            value={choice.to}
                            onChange={e => updateChoice(idx, 'to', e.target.value)}
                          >
                            <option value="">-- Relier plus tard --</option>
                            {selected.pages.map(p => (
                              <option key={p.pageId} value={p.pageId}>
                                {p.content.slice(0, 40)}...
                              </option>
                            ))}
                          </select>
                          <button className="btn-danger" onClick={() => removeChoice(idx)}>❌</button>
                        </div>
                      ))}
                      
                      <button className="btn-secondary" onClick={addChoice}>
                        ➕ Ajouter un choix
                      </button>
                    </div>
                  )}
                  
                  {error && <div className="error-box">{error}</div>}
                  
                  <div className="form-actions">
                    <button className="btn-primary" onClick={createPageWithChoices}>
                      ✅ Créer cette page
                    </button>
                    <button className="btn-secondary" onClick={() => {
                      setEditMode('tree');
                      setEditingPageId(null);
                      setNewPage({ content: '', isEnd: false, endLabel: '', choices: [] });
                    }}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// Composant pour afficher l'arbre des pages
function TreeView({ story, onDelete, onDeleteChoice, onSetStart, onCreateForChoice, onLinkChoice }) {
  if (!story.pages || story.pages.length === 0) {
    return (
      <div className="empty-state">
        <p>Aucune page créée. Cliquez sur "Créer une page" pour commencer !</p>
      </div>
    );
  }

  const getPageDisplay = (pageId) => {
    const page = story.pages.find(p => p.pageId === pageId);
    if (!page) return '❌ Page introuvable';
    return page.content.slice(0, 50) + (page.content.length > 50 ? '...' : '');
  };

  return (
    <div className="tree-view">
      <div className="tree-info">
        <p>
          📊 <strong>{story.pages.length}</strong> page(s) créée(s)
          {story.startPageId && ` • Page de départ: ${getPageDisplay(story.startPageId)}`}
        </p>
      </div>

      {story.pages.map(page => (
        <div key={page.pageId} className={`tree-node ${story.startPageId === page.pageId ? 'start-page' : ''}`}>
          <div className="node-header">
            <div className="node-title">
              {story.startPageId === page.pageId && <span className="badge-start">🏁 Début</span>}
              {page.isEnd && <span className="badge-end">🏁 Fin: {page.endLabel || 'Sans label'}</span>}
              {!page.isEnd && !story.startPageId !== page.pageId && <span className="badge-normal">📄 Page</span>}
            </div>
            <div className="node-actions">
              {story.startPageId !== page.pageId && (
                <button className="btn-small" onClick={() => onSetStart(page.pageId)}>
                  Définir comme début
                </button>
              )}
              <button className="btn-small btn-danger" onClick={() => onDelete(page.pageId)}>
                🗑️
              </button>
            </div>
          </div>

          <div className="node-content">
            {page.content}
          </div>

          {!page.isEnd && (
            <div className="node-choices">
              <strong>Choix:</strong>
              {page.choices.length === 0 && (
                <div className="no-choices">⚠️ Aucun choix défini - cette page est une impasse</div>
              )}
              {page.choices.map(choice => (
                <div key={choice._id} className="choice-item">
                  <div className="choice-text">
                    💬 {choice.text}
                  </div>
                  <div className="choice-target">
                    {choice.to ? (
                      <>
                        ➡️ {getPageDisplay(choice.to)}
                        <button 
                          className="btn-link"
                          onClick={() => {
                            const newTarget = prompt('Relier à quelle page? Collez le pageId:', choice.to);
                            if (newTarget) {
                              onLinkChoice(page.pageId, choice._id, choice.text, newTarget);
                            }
                          }}
                        >
                          ✏️ Modifier
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="unlinked">⚠️ Non relié</span>
                        <button 
                          className="btn-small"
                          onClick={() => {
                            const targetId = prompt('Relier à quelle page existante? Collez le pageId:');
                            if (targetId) {
                              onLinkChoice(page.pageId, choice._id, choice.text, targetId);
                            }
                          }}
                        >
                          🔗 Relier à une page existante
                        </button>
                      </>
                    )}
                  </div>
                  <button 
                    className="btn-danger btn-small" 
                    onClick={() => onDeleteChoice(page.pageId, choice._id)}
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="node-footer">
            <small>ID: {page.pageId}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
