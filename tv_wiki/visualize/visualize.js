const pug = require('pug');
const fs = require('fs');
const path = require('path')
const _ = require('lodash');

const disney = require('../dist/disney+_tv_aired.json');

function processData(source) {
  return source.map(category => {

    const headers = [];
    for (const item of category.data) {
      headers.push(...Object.keys(item));
    }

    return {
      headers: _.uniq(headers),
      ...category,
    }
  });
}


function generateHtml() {
  const content = pug.renderFile(path.join(__dirname, './template.pug'), {
    networks: [{
      name: 'disney',
      data: processData(disney)
    }]
  });

  fs.writeFileSync(path.join(__dirname, '../dist/index.html'), content, { encoding: 'utf-8' });
}

generateHtml();