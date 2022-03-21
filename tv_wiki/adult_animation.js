const { runStreamNetwork } = require('./general');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const _ = require('lodash');

const wiki = [
  'List of adult animated television series before 1990',
  'List of adult animated television series of the 1990s',
  'List of adult animated television series of the 2000s',
  'List of adult animated television series of the 2010s',
  'List of adult animated television series of the 2020s',
]

async function run() {
  let sources = await Promise.all(wiki.map(wiki => runStreamNetwork(wiki)));
  sources = sources.map(source => {
    return source.map(table => {
      table.data = _.uniqBy(table.data.filter(item => !item["Release date"] || item["Release date"] !== 'TBA'), item => ([item.Title, item["Original release"]].join('-')));
      return table;
    });
  });

  const keyBySources = sources.map(source => _.keyBy(source, table => table.category.join('~')));
  const allKeys = _.uniq(_.flattenDeep(keyBySources.map(item => _.keys(item))));

  const result = [];
  for (const key of allKeys) {
    result.push({
      category: key.split('~'),
      data: _.orderBy(
        _.flattenDeep(keyBySources.map(item => item[key]?.data ?? [])),
        item => {
          try {
            return moment(item["Original release"].split(' – ')).unix();
          } catch (error) {
            const releaseDate = item["Release date"];
            if (releaseDate === 'TBA') return moment().add(1, 'y').unix();
            return moment(releaseDate).unix();
          }
        }
      ),
    });
  }

  await fs.promises.writeFile(path.join(__dirname, 'dist/', 'adult animation.json'), JSON.stringify(result, undefined, 2), {
    encoding: 'utf-8'
  });
}

run(true);
