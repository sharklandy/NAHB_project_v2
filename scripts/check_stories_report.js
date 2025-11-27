const fetch = require('node-fetch');
const fs = require('fs');

const API = 'http://localhost:4000/api';

async function getPublishedStories() {
  const res = await fetch(`${API}/stories?published=1`);
  return await res.json();
}

async function getStory(storyId) {
  const res = await fetch(`${API}/stories/${storyId}`);
  return await res.json();
}

async function main() {
  try {
    console.log('🔎 Récupération des histoires publiées...');
    const list = await getPublishedStories();
    if (!Array.isArray(list) || list.length === 0) {
      console.log('Aucune histoire publiée trouvée.');
      return;
    }

    const report = [];
    for (const s of list) {
      const storyId = s.id || s._id;
      const full = await getStory(storyId);
      const pages = Array.isArray(full.pages) ? full.pages : [];
      const endings = pages.filter(p => p.isEnd).length;
      const choices = pages.reduce((acc, p) => acc + ((p.choices && p.choices.length) || 0), 0);

      report.push({
        title: full.title || s.title || '',
        id: storyId,
        theme: (full.theme || s.theme || '').toString(),
        pages: pages.length,
        endings,
        totalChoices: choices
      });
    }

    console.log('\n📋 Rapport résumé :');
    console.table(report);

    const outPath = 'scripts/stories_report.json';
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\n✅ Rapport écrit dans ${outPath}`);
  } catch (err) {
    console.error('Erreur lors de la génération du rapport :', err);
  }
}

main();
