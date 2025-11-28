import React, { useState } from 'react';
import '../styles/Login.css';
export default function Login({ onLogin, api }){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  async function submit(e){
    e.preventDefault();
    setErr(null);
    try{
      const res = await fetch(api + '/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password })});
      const j = await res.json();
      if(!res.ok) throw j;
      onLogin(j.token, j.user);
    }catch(e){
      setErr(e.error || 'error');
    }
  }
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Connexion</h2>
          <p>Connectez-vous pour créer et lire des histoires</p>
        </div>
        <form onSubmit={submit} className="auth-form">
          <div className="form-field">
            <label>Email</label>
            <input 
              type="email"
              placeholder="votre@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
            />
          </div>
          <div className="form-field">
            <label>Mot de passe</label>
            <input 
              type="password"
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
          </div>
          {err && <div className="error-message">{err}</div>}
          <button type="submit" className="auth-button">Se connecter</button>
        </form>
      </div>
    </div>
  );
}
