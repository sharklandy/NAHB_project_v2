const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

async function createUser() {
  try {
    console.log('📝 Création d\'un nouvel utilisateur...');
    
    // Créer un utilisateur
    const registerRes = await fetch(API + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Pierre Auteur',
        email: 'pierre@nahb.local',
        password: 'pierre123'
      })
    });
    
    const userData = await registerRes.json();
    
    if (userData.error === 'email exists') {
      console.log('ℹ️  L\'utilisateur existe déjà');
      console.log('📧 Email: pierre@nahb.local');
      console.log('🔑 Mot de passe: pierre123');
    } else if (userData.token) {
      console.log('✅ Utilisateur créé avec succès !');
      console.log('📧 Email: pierre@nahb.local');
      console.log('🔑 Mot de passe: pierre123');
    } else {
      console.error('❌ Erreur lors de la création:', userData);
      return;
    }
    
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

createUser();
