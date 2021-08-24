const { runStreamNetwork } = require('./general');
const fs = require('fs');
const moment = require('moment');

const WIKI_NAME = 'List of Netflix original programming';

async function runAll() {
  const result = await runStreamNetwork(WIKI_NAME);

  await fs.promises.writeFile(require('path').join(__dirname, `dist/netflix_all.json`), JSON.stringify(result, undefined, 2), { encoding: 'utf-8' });
}

async function runAiredTV() {
  const result = filterUpcoming(filterUnscripted(await runStreamNetwork(WIKI_NAME)));

  await fs.promises.writeFile(require('path').join(__dirname, `dist/netflix_tv_aired.json`), JSON.stringify(result, undefined, 2), { encoding: 'utf-8' });
}


async function run() {
  const result = filterAirIn(filterUnscripted(await runStreamNetwork(WIKI_NAME)), '2021-01-01', '2025-12-31');

  await fs.promises.writeFile(require('path').join(__dirname, `dist/netflix_2021_2025.json`), JSON.stringify(result, undefined, 2), { encoding: 'utf-8' });
}

function filterUnscripted(category) {
  return category.filter(row => {
    return row.category[0].toLowerCase() !== 'unscripted'
  });
}

function filterUpcoming(category) {
  return category.filter(row => row.category[0].toLowerCase() !== 'upcoming original programming');
}

function filterAirIn(category, startTime, endTime) {
  return category.filter(row => {
    if (row.category[0].toLowerCase() === 'upcoming original programming') return false;

    row.data = row.data.filter(item => {
      try {
        const m = moment(item.premiere);
      } catch (error) {
        console.log(error);
        console.log(item.premiere);
      }

      return moment(item.premiere).isSameOrAfter(startTime, 'd') && moment(item.premiere).isSameOrBefore(endTime, 'd')
    })

    return true;
  });
}

if (!module.parent) {
  run();
}