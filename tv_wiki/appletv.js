const { runStreamNetwork } = require('./general');
const fs = require('fs');
const moment = require('moment');

const WIKI_NAME = 'List of Apple TV+ original programming';

async function runAll() {
  const result = await runStreamNetwork(WIKI_NAME);

  await fs.promises.writeFile(require('path').join(__dirname, `dist/appletv+_all_${Date.now()}.json`), JSON.stringify(result, undefined, 2), { encoding: 'utf-8' });
}

async function runAiredTV() {
  const result = filterUpcoming(filterUnscriptedAndFilm(await runStreamNetwork(WIKI_NAME)));

  await fs.promises.writeFile(require('path').join(__dirname, `dist/appletv+_tv_aired_${Date.now()}.json`), JSON.stringify(result, undefined, 2), { encoding: 'utf-8' });
}

function filterUnscriptedAndFilm(category) {
  return category.filter(row => !['unscripted', 'original films'].includes(row.category[0].toLowerCase()));
}

function filterUpcoming(category) {
  return category.filter(row => !['upcoming original programming', 'upcoming original films'].includes(row.category[0].toLowerCase()));
}

if (!module.parent) {
  runAiredTV();
}