import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel({ api, token }) {
  const [stats, setStats] = useState(null);
  const [stories, setStories] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [view, setView] = useState('dashboard'); // dashboard, stories, users, userDetail
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
    loadAllStories();
    loadUsers();
  }, []);

  async function loadStats() {
    try {
      const res = await fetch(api + '/admin/stats', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error === 'admin only' ? 'Accès réservé aux administrateurs' : data.error);
      } else {
        setStats(data);
      }
    } catch (err) {
      setError('Erreur de chargement des statistiques');
    }
  }

  async function loadAllStories() {
    try {
      const res = await fetch(api + '/stories', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      setStories(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadUsers() {
    try {
      console.log('Loading users from:', api + '/admin/users');
      const res = await fetch(api + '/admin/users', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      console.log('Users response status:', res.status);
      const data = await res.json();
      console.log('Users data:', data);
      if (!data.error) {
        setUsers(data);
      } else {
        console.error('Error loading users:', data.error);
      }
    } catch (err) {
      console.error('Exception loading users:', err);
    }
  }

  async function loadUserDetails(userId) {
    try {
      const res = await fetch(api + '/admin/users/' + userId, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (!data.error) {
        setUserDetails(data);
        setSelectedUser(userId);
        setView('userDetail');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function suspendStory(storyId) {
    if (!window.confirm('Voulez-vous vraiment suspendre cette histoire ?')) return;
    
    try {
      const res = await fetch(api + '/admin/suspend-story/' + storyId, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      
      if (data.error) {
        alert('Erreur: ' + data.error);
      } else {
        alert('Histoire suspendue avec succès');
        loadAllStories();
        loadStats();
      }
    } catch (err) {
      alert('Erreur lors de la suspension');
    }
  }

  async function unsuspendStory(storyId) {
    if (!window.confirm('Voulez-vous remettre cette histoire en ligne (statut: published) ?')) return;
    
    try {
      const res = await fetch(api + '/admin/unsuspend-story/' + storyId, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      
      if (data.error) {
        alert('Erreur: ' + data.error);
      } else {
        alert('Histoire remise en ligne avec succès');
        loadAllStories();
        loadStats();
      }
    } catch (err) {
      alert('Erreur lors de la réactivation');
    }
  }

  async function deleteStory(storyId) {
    if (!window.confirm('Voulez-vous vraiment SUPPRIMER cette histoire ? Cette action est IRRÉVERSIBLE !')) return;
    
    try {
      const url = api + '/admin/delete-story/' + storyId;
      console.log('Deleting story - URL:', url);
      console.log('Deleting story - Story ID:', storyId);
      console.log('Deleting story - Token:', token ? 'Present' : 'Missing');
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      
      if (data.error) {
        alert('Erreur: ' + data.error);
      } else {
        alert('Histoire supprimée avec succès');
        loadAllStories();
        loadStats();
      }
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  }

  async function toggleBanUser(userId, currentBanned) {
    const action = currentBanned ? 'débannir' : 'bannir';
    if (!window.confirm(`Voulez-vous vraiment ${action} cet utilisateur ?`)) return;
    
    try {
      const res = await fetch(api + '/admin/ban-user/' + userId, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      
      if (data.error) {
        alert('Erreur: ' + data.error);
      } else {
        alert(`Utilisateur ${data.banned ? 'banni' : 'débanni'} avec succès`);
        loadUsers();
        loadStats();
        if (selectedUser === userId) {
          loadUserDetails(userId);
        }
      }
    } catch (err) {
      alert('Erreur lors du bannissement');
    }
  }

  async function deleteUser(userId) {
    if (!window.confirm('Voulez-vous vraiment SUPPRIMER cet utilisateur ? Toutes ses histoires seront également supprimées. Cette action est IRRÉVERSIBLE !')) return;
    if (!window.confirm('Êtes-vous VRAIMENT sûr ? Cette action ne peut pas être annulée !')) return;
    
    try {
      const res = await fetch(api + '/admin/users/' + userId, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      
      if (data.error) {
        alert('Erreur: ' + data.error);
      } else {
        alert('Utilisateur supprimé avec succès');
        loadUsers();
        loadStats();
        setView('users');
      }
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR') + ' à ' + date.toLocaleTimeString('fr-FR');
  }

  function getTimeSince(dateString) {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return formatDate(dateString);
  }

  if (error) {
    return (
      <div>
        <h2>Panneau Administrateur</h2>
        <p style={{color: 'red'}}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Panneau Administrateur</h2>
      
      <nav style={{marginBottom: '20px'}}>
        <button onClick={() => setView('dashboard')} style={{marginRight: '10px', fontWeight: view === 'dashboard' ? 'bold' : 'normal'}}>
          📊 Dashboard
        </button>
        <button onClick={() => setView('users')} style={{marginRight: '10px', fontWeight: view === 'users' ? 'bold' : 'normal'}}>
          👥 Utilisateurs ({users.length})
        </button>
        <button onClick={() => setView('stories')} style={{fontWeight: view === 'stories' ? 'bold' : 'normal'}}>
          📚 Histoires ({stories.length})
        </button>
      </nav>

      {view === 'dashboard' && stats && (
        <div>
          <h3>📊 Statistiques Globales</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px'}}>
            <div style={{border: '1px solid #ccc', padding: '15px', borderRadius: '5px'}}>
              <h4>👥 Utilisateurs</h4>
              <p style={{fontSize: '24px', margin: '10px 0'}}>{stats.usersCount}</p>
              <p>✅ Actifs: {stats.activeUsers}</p>
              <p>🚫 Bannis: {stats.bannedUsers}</p>
            </div>
            <div style={{border: '1px solid #ccc', padding: '15px', borderRadius: '5px'}}>
              <h4>📚 Histoires</h4>
              <p style={{fontSize: '24px', margin: '10px 0'}}>{stats.storiesCount}</p>
              <p>📖 Publiées: {stats.publishedStories}</p>
              <p>✏️ Brouillons: {stats.draftStories}</p>
              <p>⛔ Suspendues: {stats.suspendedStories}</p>
            </div>
            <div style={{border: '1px solid #ccc', padding: '15px', borderRadius: '5px'}}>
              <h4>🎮 Parties</h4>
              <p style={{fontSize: '24px', margin: '10px 0'}}>{stats.playsCount}</p>
              <p>Total de parties jouées</p>
            </div>
          </div>

          <h3>🏆 Histoires les plus jouées</h3>
          <table border="1" cellPadding="10" style={{width: '100%', marginTop: '10px'}}>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Statut</th>
                <th>Parties</th>
              </tr>
            </thead>
            <tbody>
              {stats.storyStats
                .sort((a, b) => b.playsCount - a.playsCount)
                .slice(0, 10)
                .map(story => (
                  <tr key={story.id}>
                    <td>{story.title}</td>
                    <td>{story.status}</td>
                    <td>{story.playsCount}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'users' && (
        <div>
          <h3>👥 Gestion des Utilisateurs</h3>
          <table border="1" cellPadding="10" style={{width: '100%'}}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Inscrit le</th>
                <th>Dernière connexion</th>
                <th>Connexions</th>
                <th>Histoires</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} style={{backgroundColor: user.banned ? '#ffe6e6' : 'white'}}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>{getTimeSince(user.lastLogin)}</td>
                  <td>{user.loginCount}</td>
                  <td>{user.publishedStories}/{user.storiesCreated}</td>
                  <td>{user.banned ? '🚫 Banni' : '✅ Actif'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-small"
                        onClick={() => loadUserDetails(user._id)}
                      >
                        👁️ Détails
                      </button>
                      <button 
                        className="btn-small"
                        onClick={() => toggleBanUser(user._id, user.banned)} 
                        style={{ backgroundColor: user.banned ? '#90EE90' : '#FFB6C1' }}
                      >
                        {user.banned ? '✅ Débannir' : '🚫 Bannir'}
                      </button>
                      <button 
                        className="btn-small"
                        onClick={() => deleteUser(user._id)}
                        style={{ backgroundColor: '#ff4444', color: 'white' }}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'userDetail' && userDetails && (
        <div>
          <button onClick={() => setView('users')} style={{marginBottom: '20px'}}>← Retour à la liste</button>
          
          <h3>👤 Détails de l'utilisateur</h3>
          <div style={{border: '1px solid #ccc', padding: '20px', marginBottom: '20px'}}>
            <p><strong>Username:</strong> {userDetails.user.username}</p>
            <p><strong>Email:</strong> {userDetails.user.email}</p>
            <p><strong>Statut:</strong> {userDetails.user.banned ? '🚫 Banni' : '✅ Actif'}</p>
            <p><strong>Inscrit le:</strong> {formatDate(userDetails.user.createdAt)}</p>
            <p><strong>Dernière connexion:</strong> {formatDate(userDetails.user.lastLogin)}</p>
            <p><strong>Nombre de connexions:</strong> {userDetails.user.loginCount}</p>
            <p><strong>Parties jouées:</strong> {userDetails.playsCount}</p>
          </div>

          <h4>📚 Histoires créées ({userDetails.stories.length})</h4>
          <table border="1" cellPadding="10" style={{width: '100%', marginBottom: '20px'}}>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Statut</th>
                <th>Pages</th>
                <th>Créée le</th>
              </tr>
            </thead>
            <tbody>
              {userDetails.stories.map(story => (
                <tr key={story._id}>
                  <td>{story.title}</td>
                  <td>{story.status}</td>
                  <td>{story.pagesCount}</td>
                  <td>{formatDate(story.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{marginTop: '20px'}}>
            <button 
              onClick={() => toggleBanUser(userDetails.user._id, userDetails.user.banned)}
              style={{marginRight: '10px', padding: '10px 20px', backgroundColor: userDetails.user.banned ? '#90EE90' : '#FFB6C1'}}
            >
              {userDetails.user.banned ? '✅ Débannir cet utilisateur' : '🚫 Bannir cet utilisateur'}
            </button>
            <button 
              onClick={() => deleteUser(userDetails.user._id)}
              style={{padding: '10px 20px', backgroundColor: '#ff4444', color: 'white'}}
            >
              🗑️ Supprimer cet utilisateur
            </button>
          </div>
        </div>
      )}

      {view === 'stories' && (
        <div>
          <h3>📚 Gestion des Histoires</h3>
          <table border="1" cellPadding="10" style={{width: '100%'}}>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Auteur ID</th>
                <th>Statut</th>
                <th>Pages</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stories.map(story => (
                <tr key={story._id} style={{backgroundColor: story.status === 'suspended' ? '#ffe6e6' : 'white'}}>
                  <td>{story.title}</td>
                  <td>{story.authorId}</td>
                  <td>{story.status}</td>
                  <td>{story.pages ? story.pages.length : 0}</td>
                  <td>
                    <div className="action-buttons">
                      {story.status !== 'suspended' && (
                        <button 
                          className="btn-small"
                          onClick={() => suspendStory(story.id || story._id)}
                        >
                          ⛔ Suspendre
                        </button>
                      )}
                      {story.status === 'suspended' && (
                        <button 
                          className="btn-small"
                          onClick={() => unsuspendStory(story.id || story._id)}
                          style={{backgroundColor: '#28a745', color: 'white'}}
                        >
                          ✅ Remettre en ligne
                        </button>
                      )}
                      <button 
                        className="btn-small"
                        onClick={() => deleteStory(story.id || story._id)}
                        style={{ backgroundColor: '#ff4444', color: 'white', marginLeft: '5px' }}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
