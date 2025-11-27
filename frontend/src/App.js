import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import StoryList from './components/StoryList';
import PlayView from './components/PlayView';
import Editor from './components/Editor';
import AdminPanel from './components/AdminPanel';
import MyReviews from './components/MyReviews';
import ThemeToggle from './components/ThemeToggle';

const API = process.env.REACT_APP_API || 'http://localhost:4000/api';

// Wrapper pour PlayView avec useParams
function PlayViewWrapper({ api, token }) {
  const { storyId } = useParams();
  const navigate = useNavigate();
  return <PlayView api={api} token={token} storyId={storyId} onBackToList={() => navigate('/')} />;
}

// Wrapper pour StoryList avec navigation
function StoryListWrapper({ api, token }) {
  const navigate = useNavigate();
  return <StoryList api={api} token={token} onSelectStory={(id) => navigate(`/play/${id}`)} />;
}

function App(){
  const [token, setToken] = useState(localStorage.getItem('nahb_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('nahb_user')||'null'));
  
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
    <Router>
      <div>
        <header>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <h1>NAHB</h1>
            <ThemeToggle />
          </div>
          <nav>
            {token && (
              <>
                <Link to="/">
                  <button>Histoires</button>
                </Link>
                <Link to="/editor">
                  <button>Editeur</button>
                </Link>
                <Link to="/my-reviews">
                  <button>Mes Avis</button>
                </Link>
                <Link to="/play">
                  <button>Lecture</button>
                </Link>
                {user && user.email === 'admin@nahb.local' && (
                  <Link to="/admin">
                    <button>Admin</button>
                  </Link>
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
            <Routes>
              <Route path="/register" element={
                <div className="auth-wrapper">
                  <Register onRegister={(t,u)=>{setToken(t); setUser(u);}} api={API}/>
                  <p className="auth-toggle">
                    Vous avez déjà un compte ?{' '}
                    <Link to="/login" className="link-button">
                      Se connecter
                    </Link>
                  </p>
                </div>
              } />
              <Route path="*" element={
                <div className="auth-wrapper">
                  <Login onLogin={(t,u)=>{setToken(t); setUser(u);}} api={API}/>
                  <p className="auth-toggle">
                    Vous n'avez pas de compte ?{' '}
                    <Link to="/register" className="link-button">
                      Créer un compte
                    </Link>
                  </p>
                </div>
              } />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<StoryListWrapper api={API} token={token} />} />
              <Route path="/editor" element={<Editor api={API} token={token} user={user} />} />
              <Route path="/my-reviews" element={<MyReviews />} />
              <Route path="/play/:storyId" element={<PlayViewWrapper api={API} token={token} />} />
              <Route path="/play" element={<Navigate to="/" replace />} />
              {user && user.email === 'admin@nahb.local' && (
                <Route path="/admin" element={<AdminPanel api={API} token={token} />} />
              )}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
