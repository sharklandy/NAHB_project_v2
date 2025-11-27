const fetch = require('node-fetch');

const API = 'http://localhost:4000/api';

const TO_DELETE = [
  '6928d0b6e589508616c98cc3', // comedy
  '6928d0b6e589508616c98c80', // historical
  '6928d0b5e589508616c98c16', // adventure
  '6928d0b4e589508616c98bd3', // romance
  '6928d0b4e589508616c98b71', // mystery
  '6928d0b3e589508616c98af0', // horror
  '6928d0b2e589508616c98a38'  // sci-fi
];

async function main() {
  try {
    console.log('🔐 Connexion...');
    const loginRes = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'pierre@nahb.local', password: 'pierre123' })
    });
    const userData = await loginRes.json();
    if (!userData.token) {
      console.error('Erreur de connexion');
      return;
    }
    const token = userData.token;
    console.log('✅ Connecté');

    for (const id of TO_DELETE) {
      try {
        console.log('\n→ Suppression story id:', id);
        const res = await fetch(API + '/stories/' + id, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const j = await res.json().catch(() => ({}));
        if (res.ok) {
          console.log('  Supprimé:', id);
        } else {
          console.warn('  Erreur suppression:', j.error || res.status);
        }
      } catch (err) {
        console.error('  Erreur pendant suppression:', err.message);
      }
    }

    console.log('\n✅ Suppressions terminées');
  } catch (err) {
    console.error('Erreur fatale:', err.message);
  }
}

main();
