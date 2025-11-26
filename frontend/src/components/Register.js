import React, { useState } from 'react';
import './Login.css';
export default function Register({ onRegister, api }){
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  async function submit(e){
    e.preventDefault();
    setErr(null);
    try{
      const res = await fetch(api + '/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password, username })});
      const j = await res.json();
      if(!res.ok) throw j;
      onRegister(j.token, j.user);
    }catch(e){
      setErr(e.error || 'error');
    }
  }
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>✨ Inscription</h2>
          <p>Créez votre compte pour rejoindre l'aventure</p>
        </div>
        <form onSubmit={submit} className="auth-form">
          <div className="form-field">
            <label>Nom d'utilisateur</label>
            <input 
              type="text"
              placeholder="Votre pseudo" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
          </div>
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
          {err && <div className="error-message">❌ {err}</div>}
          <button type="submit" className="auth-button">S'inscrire</button>
        </form>
      </div>
    </div>
  );
}
