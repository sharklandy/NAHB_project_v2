import React, { useState, useEffect } from 'react';
import './Editor.css';

/*
 Enhanced Editor:
 - Lists user's stories
 - Select a story to view/create pages
 - Create / edit / delete pages
 - Create / delete choices and set targets
 Notes: still a prototype; for heavy editing use Postman or extend further.
*/

export default function Editor({ api, token, user }){
  // Helper to get story ID (handles both id and _id)
  const getStoryId = (story) => story?.id || story?._id;
  
  const [stories, setStories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [theme, setTheme] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [isEnd, setIsEnd] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [error, setError] = useState(null);
  
  // Liste des thèmes disponibles
  const availableThemes = [
    'Fantasy',
    'Science-Fiction',
    'Horreur',
    'Mystère',
    'Romance',
    'Aventure',
    'Historique',
    'Contemporain',
    'Post-apocalyptique',
    'Cyberpunk',
    'Steampunk',
    'Thriller',
    'Comédie',
    'Drame'
  ];

  useEffect(()=> { load(); }, []);

  async function load(){
    try{
      const res = await fetch(api + '/stories', { headers: { Authorization: 'Bearer ' + token }});
      const j = await res.json();
      console.log('Loaded stories:', j);
      console.log('First story:', j[0]);
      console.log('First story authorId:', j[0]?.authorId);
      console.log('User:', user);
      console.log('User id:', user?.id, 'user._id:', user?._id);
      const userId = user?.id || user?._id;
      console.log('Comparing userId:', userId, 'with authorIds:', j.map(s => s.authorId));
      const mine = j.filter(s => s.authorId === userId);
      console.log('My stories:', mine.length);
      setStories(mine);
      if(mine.length && !selected) {
        setSelected(mine[0]);
      }
    }catch(e){ console.error('Error loading stories:', e); }
  }

  async function createStory(){
    const res = await fetch(api + '/stories', { method:'POST', headers: {'Content-Type':'application/json', Authorization: 'Bearer '+token}, body: JSON.stringify({ title, description: desc, theme })});
    const j = await res.json();
    setStories([j, ...stories]);
    setTitle(''); setDesc(''); setTheme('');
    setSelected(j);
  }

  async function refreshStory(storyId){
    const r = await fetch(api + '/stories/' + storyId);
    const j = await r.json();
    setStories(stories.map(s => getStoryId(s) === getStoryId(j) ? j : s));
    setSelected(j);
  }

  async function createPage(){
    if(!selected) return;
    setError(null);
    console.log('===== CREATE PAGE DEBUG =====');
    console.log('selected object:', selected);
    console.log('selected.id:', selected.id);
    console.log('selected._id:', selected._id);
    console.log('Object.keys(selected):', Object.keys(selected));
    try{
      const storyId = getStoryId(selected);
      console.log('Using storyId:', storyId);
      const res = await fetch(api + '/stories/' + storyId + '/pages', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization: 'Bearer '+token }, body: JSON.stringify({ content: pageContent, isEnd })});
      console.log('Response status:', res.status);
      if(!res.ok) {
        const errText = await res.text();
        console.error('Error response:', errText);
        setError('Erreur: ' + errText);
        return;
      }
      const j = await res.json();
      console.log('Page created:', j);
      await refreshStory(storyId);
      setPageContent(''); setIsEnd(false);
    }catch(e){
      console.error('Exception in createPage:', e);
      setError('Impossible de créer la page: ' + e.message);
    }
  }

  async function deletePage(pageId){
    if(!selected) return;
    if(!confirm('Supprimer cette page ?')) return;
    const storyId = getStoryId(selected);
    await fetch(api + '/stories/' + storyId + '/pages/' + pageId, { method:'DELETE', headers:{ Authorization: 'Bearer '+token }});
    await refreshStory(storyId);
  }

  async function createChoice(pageId, text, to){
    if(!selected) return;
    const storyId = getStoryId(selected);
    await fetch(api + '/stories/' + storyId + '/pages/' + pageId + '/choices', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization: 'Bearer '+token }, body: JSON.stringify({ text, to })});
    await refreshStory(storyId);
  }

  async function deleteChoice(pageId, choiceId){
    if(!selected) return;
    const storyId = getStoryId(selected);
    await fetch(api + '/stories/' + storyId + '/pages/' + pageId + '/choices/' + choiceId, { method:'DELETE', headers:{ Authorization: 'Bearer '+token }});
    await refreshStory(storyId);
  }

  async function publishStory(s, status){
    const storyId = getStoryId(s);
    await fetch(api + '/stories/' + storyId, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization: 'Bearer '+token }, body: JSON.stringify({ status })});
    await refreshStory(storyId);
  }

  return (
    <div>
      <h2>Éditeur avancé</h2>
      <section style={{display:'flex', gap:20}}>
        <div style={{flex:1}}>
          <h3>Vos histoires</h3>
          <div className="story-form">
            <div className="form-group">
              <label>Titre</label>
              <input 
                type="text"
                placeholder="Titre de l'histoire" 
                value={title} 
                onChange={e=>setTitle(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                placeholder="Description de l'histoire" 
                value={desc} 
                onChange={e=>setDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Thème</label>
              <select 
                value={theme} 
                onChange={e=>setTheme(e.target.value)}
                className="theme-select"
              >
                <option value="">-- Sélectionner un thème --</option>
                {availableThemes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={createStory}>Créer l'histoire</button>
            </div>
          </div>
          <ul>
            {stories.map(s=>(
              <li key={getStoryId(s)} style={{marginTop:10}}>
                <strong>{s.title}</strong> — <em>{s.status}</em><br/>
                <button onClick={()=>setSelected(s)}>Éditer</button>
                <button onClick={()=>publishStory(s, s.status === 'published' ? 'draft' : 'published')}>{s.status === 'published' ? 'Dépublier' : 'Publier'}</button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{flex:2}}>
          <h3>Édition</h3>
          {!selected && <div>Sélectionner une histoire à gauche.</div>}
          {selected && (
            <>
              <h4>{selected.title} — {selected.status}</h4>
              <div>
                <h5>Créer une page</h5>
                <textarea rows={4} value={pageContent} onChange={e=>setPageContent(e.target.value)} placeholder="Contenu de la page" style={{width:'100%'}}/>
                <label><input type="checkbox" checked={isEnd} onChange={e=>setIsEnd(e.target.checked)} /> Page finale</label><br/>
                <button onClick={createPage}>Ajouter la page</button>
                {error && <div style={{color:'red'}}>{error}</div>}
              </div>

              <div style={{marginTop:10}}>
                <h5>Pages ({selected.pages.length})</h5>
                {selected.pages.length === 0 && <div>Aucune page pour le moment.</div>}
                {selected.pages.map(p=>(
                  <div key={p.pageId} style={{border:'1px solid #ddd', padding:8, marginTop:6}}>
                    <div><strong>{p.isEnd ? 'FIN' : 'PAGE'}</strong></div>
                    <div style={{whiteSpace:'pre-wrap'}}>{p.content}</div>
                    <div style={{marginTop:6}}>
                      <button onClick={()=>{ const t=prompt('Nouveau texte pour la page', p.content); if(t!==null) { const sid = getStoryId(selected); fetch(api + '/stories/' + sid + '/pages/' + p.pageId, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization: 'Bearer '+token }, body: JSON.stringify({ content: t })}).then(()=>refreshStory(sid)); } }}>Éditer contenu</button>
                      <button onClick={()=>deletePage(p.pageId)}>Supprimer</button>
                    </div>

                    <div style={{marginTop:8}}>
                      <strong>Choix</strong>
                      <ul>
                        {p.choices.map(c=>(
                          <li key={c._id}>
                            {c.text} → {selected.pages.find(pp=>pp.pageId===c.to)?.content?.slice(0,30) || '— non relié —'}
                            <button onClick={()=>deleteChoice(p.pageId, c._id)} style={{marginLeft:8}}>Suppr</button>
                          </li>
                        ))}
                      </ul>
                      <div>
                        <ChoiceForm pages={selected.pages} onCreate={(text,to)=>createChoice(p.pageId, text, to)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{marginTop:12}}>
                <h5>Paramètres</h5>
                <div>Page de départ:
                  <select value={selected.startPageId||''} onChange={async e=>{ const sid = getStoryId(selected); await fetch(api + '/stories/' + sid, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization: 'Bearer '+token }, body: JSON.stringify({ startPageId: e.target.value })}); await refreshStory(sid); }}>
                    <option value=''>-- non défini --</option>
                    {selected.pages.map(pp=> <option key={pp.pageId} value={pp.pageId}>{pp.content?.slice(0,40) || pp.pageId}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function ChoiceForm({ pages, onCreate }){
  const [text, setText] = React.useState('');
  const [to, setTo] = React.useState('');
  return (
    <div>
      <input placeholder="Texte du choix" value={text} onChange={e=>setText(e.target.value)} />
      <select value={to} onChange={e=>setTo(e.target.value)}>
        <option value=''>-- choisir la page cible (optional) --</option>
        {pages.map(p=> <option key={p.pageId} value={p.pageId}>{p.content?.slice(0,40) || p.pageId}</option>)}
      </select>
      <button onClick={()=>{ if(!text) return alert('texte requis'); onCreate(text,to); setText(''); setTo(''); }}>Ajouter choix</button>
    </div>
  );
}
