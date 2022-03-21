const { runStreamNetwork } = require('./general');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const _ = require('lodash');

const TYPICAL_HEADERS = {
  upcoming: ['upcoming original programming', 'upcoming original films'],
  unscripted: ['unscripted', 'pilots not picked up to series'],
  kids: ['kids &amp; family', 'kids and family', 'kids &amp; family (animation)'],
  docuseries: ['docuseries'],
  film: ['original films', 'co-distributed films', 'upcoming original films', 'upcoming co-distributed films'],
  exclusive: ['exclusive international television distribution', 'exclusive international distribution'],
  podcast: ['original podcasts'],
}

const STREAM_NETWORKS = [
  {
    name: 'netflix',
    wiki: ['List of Netflix original programming', 'List of ended Netflix original programming'],
    combineBy([current, ended]) {
      const currentByCategory = _.keyBy(current, table => table.category.join('~'));
      const endedByCategory = _.keyBy(ended, table => table.category.join('~'));

      const allKeys = _.uniq([..._.keys(currentByCategory), ..._.keys(endedByCategory)]);

      const ret = [];
      for (const key of allKeys) {
        ret.push({
          category: key.split('~'),
          data: _.orderBy([
            ...(currentByCategory[key]?.data ?? []),
            ...(endedByCategory[key]?.data ?? []),
          ], item => moment(item.Premiere || item["Release date"]).unix()),
        });
      }
      return ret;
    },
    filter(data) {
      return data.filter(table => {
        if (TYPICAL_HEADERS.upcoming.includes(table.category[0]?.toLowerCase())) return false;
        if (TYPICAL_HEADERS.kids.includes(table.category[1]?.toLowerCase())) return false;

        table.data = table.data.filter(item => {
          try {
            const time = item.Premiere || item["Release date"];

            return moment(time).isSameOrAfter('2021-01-01', 'd') && moment(time).isSameOrBefore('2025-12-31', 'd')
          } catch {}
          return true;
        });

        return !TYPICAL_HEADERS.unscripted.includes(table.category[0]?.toLowerCase());
      });
    },
  },
  {
    name: 'hulu',
    wiki: ['List of Hulu original programming'],
    filter(data) {
      return data.filter(table => {
        if ([...TYPICAL_HEADERS.upcoming, ...TYPICAL_HEADERS.film, ...TYPICAL_HEADERS.exclusive].includes(table.category[0]?.toLowerCase())) return false;
        if (TYPICAL_HEADERS.kids.includes(table.category[2]?.toLowerCase())) return false;

        return !TYPICAL_HEADERS.unscripted.includes(table.category[1]?.toLowerCase());
      });
    },
  },
  {
    name: 'amazon',
    wiki: ['List of Amazon Prime Video original programming'],
    filter(data) {
      return data.filter(table => {
        if ([...TYPICAL_HEADERS.upcoming, ...TYPICAL_HEADERS.film, ...TYPICAL_HEADERS.exclusive].includes(table.category[0]?.toLowerCase())) return false;
        if (TYPICAL_HEADERS.kids.includes(table.category[2]?.toLowerCase())) return false;

        return !TYPICAL_HEADERS.unscripted.includes(table.category[1]?.toLowerCase());
      });
    },
  },
  {
    name: 'hbo max',
    wiki: ['List of HBO Max original programming'],
    filter(data) {
      return data.filter(table => {
        if ([...TYPICAL_HEADERS.upcoming, ...TYPICAL_HEADERS.film, ...TYPICAL_HEADERS.podcast].includes(table.category[0]?.toLowerCase())) return false;
        if ([...TYPICAL_HEADERS.kids, ...TYPICAL_HEADERS.unscripted].includes(table.category[2]?.toLowerCase())) return false;

        return !TYPICAL_HEADERS.unscripted.includes(table.category[1]?.toLowerCase());
      });
    },
  },
  {
    name: 'apple tv+',
    wiki: ['List of Apple TV+ original programming'],
    filter(data) {
      return data.filter(table => {
        if ([...TYPICAL_HEADERS.upcoming, ...TYPICAL_HEADERS.film].includes(table.category[0]?.toLowerCase())) return false;
        if (TYPICAL_HEADERS.kids.includes(table.category[2]?.toLowerCase())) return false;

        return !TYPICAL_HEADERS.unscripted.includes(table.category[1]?.toLowerCase()) || TYPICAL_HEADERS.docuseries.includes(table.category[2]?.toLowerCase());
      });
    },
  },
  {
    name: 'disney+',
    wiki: ['List of Disney+ original programming'],
    filter(data) {
      return data.filter(table => {
        if ([...TYPICAL_HEADERS.upcoming, ...TYPICAL_HEADERS.film].includes(table.category[0]?.toLowerCase())) return false;
        if (TYPICAL_HEADERS.kids.includes(table.category[2]?.toLowerCase())) return false;

        return !TYPICAL_HEADERS.unscripted.includes(table.category[1]?.toLowerCase());
      });
    },
  },
  {
    name: 'peacock',
    wiki: ['List of Peacock original programming'],
    filter(data) {
      return data.filter(table => {
        if ([...TYPICAL_HEADERS.upcoming, ...TYPICAL_HEADERS.film, ...TYPICAL_HEADERS.exclusive].includes(table.category[0]?.toLowerCase())) return false;
        if (TYPICAL_HEADERS.kids.includes(table.category[2]?.toLowerCase())) return false;
        if (TYPICAL_HEADERS.exclusive.includes(table.category[1]?.toLowerCase())) return false;

        return !TYPICAL_HEADERS.unscripted.includes(table.category[1]?.toLowerCase());
      });
    },
  },
  {
    name: 'paramount+',
    wiki: ['List of Paramount+ original programming'],
    filter(data) {
      return data.filter(table => {
        if ([...TYPICAL_HEADERS.upcoming, ...TYPICAL_HEADERS.film].includes(table.category[0]?.toLowerCase())) return false;
        if (TYPICAL_HEADERS.kids.includes(table.category[2]?.toLowerCase())) return false;

        return !TYPICAL_HEADERS.unscripted.includes(table.category[1]?.toLowerCase());
      });
    },
  },
];

async function run(all) {
  for (const network of STREAM_NETWORKS) {
    const sources = await Promise.all(network.wiki.map(wiki => runStreamNetwork(wiki)));
    let result = sources[0];
    if (network.combineBy) {
      result = network.combineBy(sources);
    }

    const filteredResult = network.filter(result);

    if (all) await fs.promises.writeFile(path.join(__dirname, 'dist/', `${network.name} all.json`), JSON.stringify(result, undefined, 2), {encoding: 'utf-8'});
    await fs.promises.writeFile(path.join(__dirname, 'dist/', `${network.name} tv customized.json`), JSON.stringify(filteredResult, undefined, 2), {encoding: 'utf-8'});
  }
}

run(true);