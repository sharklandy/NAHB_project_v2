import React, { useState } from 'react';
import './ReportModal.css';

export default function ReportModal({ api, token, storyId, storyTitle, onClose }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const reasons = [
    { value: 'inappropriate', label: 'Contenu inapproprié' },
    { value: 'offensive', label: 'Contenu offensant' },
    { value: 'spam', label: 'Spam ou publicité' },
    { value: 'copyright', label: 'Violation de droits d\'auteur' },
    { value: 'other', label: 'Autre' }
  ];

  async function submitReport() {
    if (!reason) {
      alert('Veuillez sélectionner une raison');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${api}/reports/${storyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason, description })
      });

      if (res.ok) {
        alert('Votre signalement a été envoyé. Merci de nous aider à maintenir la qualité du contenu.');
        onClose();
      } else {
        const data = await res.json();
        if (data.error === 'already reported') {
          alert('Vous avez déjà signalé cette histoire.');
        } else {
          alert('Erreur lors de l\'envoi du signalement');
        }
      }
    } catch (e) {
      console.error('Error submitting report:', e);
      alert('Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🚨 Signaler une histoire</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="story-title-display">
            Histoire : <strong>{storyTitle}</strong>
          </p>
          
          <div className="form-group">
            <label>Raison du signalement *</label>
            <select 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="form-select"
            >
              <option value="">-- Sélectionner une raison --</option>
              {reasons.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Description (optionnel)</label>
            <textarea
              placeholder="Donnez plus de détails sur le problème..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="form-textarea"
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button onClick={submitReport} disabled={loading} className="btn-submit-report">
            {loading ? 'Envoi...' : 'Envoyer le signalement'}
          </button>
          <button onClick={onClose} className="btn-cancel-report">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
