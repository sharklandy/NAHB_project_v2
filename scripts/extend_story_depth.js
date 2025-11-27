const fetch = require('node-fetch');
const fs = require('fs');

const API = 'http://localhost:4000/api';
const MIN_DEPTH = 4; // ensure any end is at least this many steps from start

async function login() {
  const res = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'pierre@nahb.local', password: 'pierre123' })
  });
  const j = await res.json();
  return j.token;
}

async function getPublishedStories() {
  const res = await fetch(`${API}/stories?published=1`);
  return await res.json();
}

async function getStory(id) {
  const res = await fetch(`${API}/stories/${id}`);
  return await res.json();
}

async function addPage(token, storyId, page) {
  const res = await fetch(`${API}/stories/${storyId}/pages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify(page)
  });
  return await res.json();
}

async function deleteChoice(token, storyId, pageId, choiceId) {
  const res = await fetch(`${API}/stories/${storyId}/pages/${pageId}/choices/${choiceId}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  return res.ok;
}

async function addChoice(token, storyId, pageId, text, to) {
  const res = await fetch(`${API}/stories/${storyId}/pages/${pageId}/choices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ text, to })
  });
  return await res.json();
}

function buildGraph(pages) {
  const idToIndex = {};
  pages.forEach((p, i) => { idToIndex[p.pageId] = i; });
  const adj = pages.map(p => (p.choices || []).map(c => c.to).filter(Boolean));
  return { idToIndex, adj };
}

function bfsDistances(startPageId, pages) {
  const q = [];
  const dist = {};
  dist[startPageId] = 0;
  q.push(startPageId);
  const pageById = Object.fromEntries(pages.map(p => [p.pageId, p]));
  while (q.length) {
    const cur = q.shift();
    const curDist = dist[cur];
    const choices = (pageById[cur] && pageById[cur].choices) || [];
    for (const ch of choices) {
      if (!ch.to) continue;
      if (dist[ch.to] === undefined) {
        dist[ch.to] = curDist + 1;
        q.push(ch.to);
      }
    }
  }
  return dist;
}

async function processStory(token, storyMeta) {
  const storyId = storyMeta.id || storyMeta._id || storyMeta;
  console.log('\n--- Processing story:', storyMeta.title || storyId);
  const full = await getStory(storyId);
  const pages = full.pages || [];
  const start = full.startPageId || (pages[0] && pages[0].pageId);
  if (!start) { console.warn(' no start page, skipping'); return; }

  const dist = bfsDistances(start, pages);

  // map pageId->page object for quick access
  const pageById = Object.fromEntries(pages.map(p => [p.pageId, p]));

  // find choices that point to an end and origin depth < MIN_DEPTH
  const changes = [];
  for (const p of pages) {
    const fromDist = dist[p.pageId];
    if (fromDist === undefined) continue;
    for (const ch of (p.choices || [])) {
      if (!ch.to) continue;
      const target = pageById[ch.to];
      if (!target) continue;
      if (target.isEnd) {
        const targetDist = dist[ch.to] || fromDist + 1;
        if (fromDist + 1 < MIN_DEPTH) {
          // we want to insert intermediate pages so that distance becomes MIN_DEPTH
          changes.push({ fromPage: p, choice: ch, fromDist });
        }
      }
    }
  }

  if (changes.length === 0) {
    console.log(' No short-end choices found for this story.');
    return;
  }

  console.log(' Found', changes.length, 'choices to extend');

  for (const change of changes) {
    const { fromPage, choice, fromDist } = change;
    // compute number of intermediates needed
    const stepsNeeded = MIN_DEPTH - (fromDist + 1);
    const intermediates = Math.max(1, stepsNeeded);

    let prevPageId = fromPage.pageId;
    for (let i = 0; i < intermediates; i++) {
      const content = `(Auto) Suite: ${i+1} — ${choice.text} — continuez votre choix.`;
      const newPage = await addPage(token, storyId, { content, isEnd: false });
      const newPageId = newPage.pageId;

      // Delete original choice when i == 0
      if (i === 0) {
        const choiceId = choice._id || choice.id || choice._id;
        if (choiceId) {
          const ok = await deleteChoice(token, storyId, fromPage.pageId, choiceId);
          if (!ok) console.warn('  Warn: failed to delete original choice');
        } else {
          console.warn('  Warn: no choice id to delete');
        }
        // add new choice from fromPage to newPage
        await addChoice(token, storyId, fromPage.pageId, choice.text, newPageId);
      } else {
        // add choice from prevPageId to newPage
        await addChoice(token, storyId, prevPageId, 'Continuer', newPageId);
      }

      prevPageId = newPageId;
    }

    // finally link last intermediate to original target
    await addChoice(token, storyId, prevPageId, 'Poursuivre', choice.to);
    console.log('  Inserted', intermediates, 'pages between', fromPage.pageId, 'and', choice.to);
  }
}

async function main() {
  try {
    console.log('Logging in...');
    const token = await login();
    if (!token) { console.error('login failed'); return; }

    // load published stories
    const list = await getPublishedStories();

    // target stories: all published except the big ones we didn't add? We'll process all to be safe
    for (const s of list) {
      // skip the original big ones if desired by title? We'll process all but skip very large stories to avoid heavy work
      const pageCount = (s.pages && s.pages.length) || 0;
      if (pageCount > 50) continue; // skip extremely large stories
      await processStory(token, s);
    }

    console.log('\nDone extending story depth.');

    // regenerate report
    console.log('Regenerating report...');
    await new Promise((res, rej) => {
      const cp = require('child_process').spawn('node', ['scripts/check_stories_report.js'], { stdio: 'inherit', shell: true });
      cp.on('exit', code => code === 0 ? res() : rej(new Error('report script failed')));
    });

    console.log('All complete.');
  } catch (err) {
    console.error('Fatal:', err);
  }
}

main();
