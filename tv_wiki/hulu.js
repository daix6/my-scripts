const { runStreamNetwork } = require('./general');
const fs = require('fs');

const WIKI_NAME = 'List of Hulu original programming';

async function runAll() {
  const result = filterExclusive(await runStreamNetwork(WIKI_NAME));

  await fs.promises.writeFile(require('path').join(__dirname, `dist/hulu_all.json`), JSON.stringify(result, undefined, 2), { encoding: 'utf-8' });
}


async function runAiredTV() {
  const result = filterUpcoming(filterUnscripted(filterFilm(filterExclusive(await runStreamNetwork(WIKI_NAME)))));

  await fs.promises.writeFile(require('path').join(__dirname, `dist/hulu_tv_aired.json`), JSON.stringify(result, undefined, 2), { encoding: 'utf-8' });
}

function filterExclusive(category) {
  return category.filter(row => !['exclusive international television distribution'].includes(row.category[0].toLowerCase()));
}

function filterUnscripted(category) {
  return category.filter(row => {
    const cate = row.category[1].toLowerCase();
    const subCate = row.category[2]?.toLowerCase();
    return  !['unscripted'].includes(cate) || ['docuseries'].includes(subCate);
  });
}


function filterFilm(category) {
  return category.filter(row => !['original films', 'co-distributed films'].includes(row.category[0].toLowerCase()));
}

function filterUpcoming(category) {
  return category.filter(row => !['upcoming original programming', 'upcoming original films'].includes(row.category[0].toLowerCase()));
}

if (!module.parent) {
  runAiredTV();
}