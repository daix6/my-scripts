const { runStreamNetwork } = require('./general');
const fs = require('fs');

const WIKI_NAME = 'List of HBO Max original programming';

async function runAll() {
  const result = await runStreamNetwork(WIKI_NAME);

  await fs.promises.writeFile(require('path').join(__dirname, `dist/hbo_max_all_${Date.now()}.json`), JSON.stringify(result, undefined, 2), { encoding: 'utf-8' });
}

async function runAiredTV() {
  const result = filterUpcoming(filterUnscripted(filterFilm(await runStreamNetwork(WIKI_NAME))));

  await fs.promises.writeFile(require('path').join(__dirname, `dist/hbo_max_tv_aired_${Date.now()}.json`), JSON.stringify(result, undefined, 2), { encoding: 'utf-8' });
}

function filterUnscripted(category) {
  return category.filter(row => {
    const cate = row.category[1].toLowerCase();
    const subCate = row.category[2]?.toLowerCase();
    return  !['unscripted'].includes(cate) || ['docuseries'].includes(subCate);
  });
}


function filterFilm(category) {
  return category.filter(row => !['original films'].includes(row.category[0].toLowerCase()));
}

function filterUpcoming(category) {
  return category.filter(row => !['upcoming original programming', 'upcoming original films'].includes(row.category[0].toLowerCase()));
}

if (!module.parent) {
  runAiredTV();
}