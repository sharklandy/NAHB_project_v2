const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

async function createAdmin() {
  try {
    const res = await fetch(API + '/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        email: 'admin@nahb.local',
        password: 'admin123'
      })
    });
    
    const data = await res.json();
    
    if (data.error === 'email exists') {
      console.log('✅ Le compte admin existe déjà');
      console.log('📧 Email: admin@nahb.local');
      console.log('🔑 Mot de passe: admin123');
      return;
    }
    
    if (data.token) {
      console.log('✅ Compte admin créé avec succès !');
      console.log('📧 Email: admin@nahb.local');
      console.log('🔑 Mot de passe: admin123');
    } else {
      console.log('❌ Erreur:', data);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createAdmin();
