import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import StoryList from './components/StoryList';
import PlayView from './components/PlayView';
import Editor from './components/Editor';
import AdminPanel from './components/AdminPanel';

const API = process.env.REACT_APP_API || 'http://localhost:4000/api';

function App(){
  const [token, setToken] = useState(localStorage.getItem('nahb_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('nahb_user')||'null'));
  const [view, setView] = useState('list');
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' ou 'register'
  useEffect(()=> {
    if(token){
      localStorage.setItem('nahb_token', token);
      localStorage.setItem('nahb_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nahb_token');
      localStorage.removeItem('nahb_user');
    }
  }, [token, user]);

  return (
    <div>
      <header>
        <h1>NAHB</h1>
        <nav>
          {token && (
            <>
              <button onClick={()=>setView('list')}>
                Histoires
              </button>
              <button onClick={()=>setView('editor')}>
                Editeur
              </button>
              <button onClick={()=>setView('play')}>
                Lecture
              </button>
              {user && user.email === 'admin@nahb.local' && (
                <button onClick={()=>setView('admin')}>
                  Admin
                </button>
              )}
              <button onClick={()=>{setToken(null); setUser(null);}}>
                Deconnexion
              </button>
            </>
          )}
        </nav>
      </header>

      <main>
        {!token ? (
          <div className="auth-wrapper">
            {authMode === 'login' ? (
              <>
                <Login onLogin={(t,u)=>{setToken(t); setUser(u);}} api={API}/>
                <p className="auth-toggle">
                  Vous n'avez pas de compte ?{' '}
                  <button className="link-button" onClick={() => setAuthMode('register')}>
                    Créer un compte
                  </button>
                </p>
              </>
            ) : (
              <>
                <Register onRegister={(t,u)=>{setToken(t); setUser(u);}} api={API}/>
                <p className="auth-toggle">
                  Vous avez déjà un compte ?{' '}
                  <button className="link-button" onClick={() => setAuthMode('login')}>
                    Se connecter
                  </button>
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {view === 'list' && <StoryList api={API} token={token} onSelectStory={(id)=>{console.log('Story selected, id:', id); setSelectedStoryId(id); setView('play');}} />}
            {view === 'editor' && <Editor api={API} token={token} user={user} />}
            {view === 'play' && <PlayView api={API} token={token} storyId={selectedStoryId} onBackToList={() => setView('list')} />}
            {view === 'admin' && <AdminPanel api={API} token={token} />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
