const fetch = require('node-fetch');
const fs = require('fs');

const API = 'http://localhost:4000/api';
const MIN_CONTENT_LENGTH = 60; // chars
const PATH_SAMPLES_PER_STORY = 5;
const MAX_PATH_DEPTH = 10;

const themeKeywords = {
  fantasy: ['dragon','quête','épée','royaume','magie','chevalier','sorcier'],
  ocean: ['vague','océan','rivage','bateau','corail','navire','abysse','pluie','mer'],
  'sci-fi': ['vaisseau','néon','IA','station','orbiteur','galactique','espace','artefact'],
  horror: ['obscur','chuchot','sang','frisson','maison','murmure','fantôme','porte'],
  mystery: ['indice','enquête','meurtre','alarme','valise','train','minuit','énigme'],
  romance: ['regard','cœur','parapluie','baiser','café','rencontre','pluie','attirance'],
  adventure: ['carte','vallée','chemin','monture','trésor','expédition','guide'],
  historical: ['ancien','reliques','marché','bibliothèque','temple','chronique','sermon'],
  comedy: ['poule','farce','rire','chapeau','gag','burlesque']
};

async function getPublishedStories() {
  const res = await fetch(`${API}/stories?published=1`);
  return await res.json();
}

async function getStory(id) {
  const res = await fetch(`${API}/stories/${id}`);
  return await res.json();
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function containsKeyword(theme, text) {
  if (!text) return false;
  const keys = themeKeywords[theme] || [];
  const lower = text.toLowerCase();
  return keys.some(k => lower.includes(k));
}

function analyzeStoryStructure(story) {
  const pages = story.pages || [];
  const pageById = Object.fromEntries(pages.map(p => [p.pageId, p]));
  const issues = [];

  // structural checks
  for (const p of pages) {
    // content length
    if (!p.content || p.content.trim().length < MIN_CONTENT_LENGTH) {
      issues.push({ type: 'short_content', pageId: p.pageId, len: (p.content||'').length });
    }
    // leftover generic marker
    if ((p.content || '').includes('(Auto)')) {
      issues.push({ type: 'auto_marker', pageId: p.pageId });
    }
    // choices valid
    for (const ch of (p.choices||[])) {
      if (!ch.to || !pageById[ch.to]) {
        issues.push({ type: 'broken_choice', pageId: p.pageId, choice: ch });
      }
    }
  }

  return { issues, pages, pageById };
}

function samplePaths(story, pageById) {
  const start = story.startPageId || (story.pages && story.pages[0] && story.pages[0].pageId);
  if (!start) return [];
  const samples = [];
  for (let s = 0; s < PATH_SAMPLES_PER_STORY; s++) {
    const path = [];
    let cur = start;
    for (let depth = 0; depth < MAX_PATH_DEPTH; depth++) {
      const page = pageById[cur];
      if (!page) break;
      path.push({ pageId: page.pageId, content: page.content || '', isEnd: !!page.isEnd, choices: (page.choices||[]) });
      if (page.isEnd) break;
      const choices = page.choices || [];
      if (choices.length === 0) break;
      // pick first, then random for variety
      const pick = depth === 0 ? choices[0] : pickRandom(choices);
      if (!pick.to) break;
      cur = pick.to;
    }
    samples.push(path);
  }
  return samples;
}

async function main() {
  console.log('Récupération des histoires publiées...');
  const list = await getPublishedStories();
  const report = [];

  for (const s of list) {
    const id = s.id || s._id || s;
    const full = await getStory(id);
    const theme = full.theme || s.theme || 'general';
    const analysis = analyzeStoryStructure(full);
    const paths = samplePaths(full, analysis.pageById);

    // path metrics
    const pathLengths = paths.map(p => p.length);
    const avgPathLen = pathLengths.length ? (pathLengths.reduce((a,b)=>a+b,0)/pathLengths.length) : 0;
    const endsEarlyCount = paths.filter(p => p.length <= 3 && p[p.length-1] && p[p.length-1].isEnd).length;

    // thematic keyword coverage: check if at least one page among sampled contains a keyword
    const thematicHits = paths.some(path => path.some(node => containsKeyword(theme, node.content)));

    // aggregate issues summary
    const issuesSummary = analysis.issues.reduce((acc, it) => {
      acc[it.type] = (acc[it.type]||0) + 1;
      return acc;
    }, {});

    report.push({
      title: full.title || s.title,
      id,
      theme,
      pages: full.pages ? full.pages.length : (s.pages||0),
      avgPathLen: Math.round(avgPathLen*100)/100,
      samplePaths: paths.map(p => ({ length: p.length, endIsEnd: p[p.length-1] ? !!p[p.length-1].isEnd : false })),
      endsTooEarly: endsEarlyCount,
      thematicCoverage: thematicHits,
      issues: analysis.issues,
      issuesSummary
    });
  }

  const outPath = 'scripts/coherence_report.json';
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log('Rapport écrit dans', outPath);
}

main().catch(err=>{ console.error(err); process.exit(1); });
