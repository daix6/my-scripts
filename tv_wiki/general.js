const wiki = require('wikijs').default;
const { parse } = require('node-html-parser');
const parseTable = require('./utils').parseTable;

async function runStreamNetwork(name) {
  const result = await wiki().page(name);

  const root = parse(await result.html());

  const nodes = root.querySelectorAll('.mw-parser-output > *');

  const info = [];
  for (let i = 0, header = []; i < nodes.length; i++) {
    const el = nodes[i], tagName = el.tagName.toLowerCase();

    if (['h2', 'h3', 'h4'].includes(tagName)) {
      if (tagName === 'h2') header = [];
      else if (tagName === 'h3') header = header.slice(0, 1);
      else header = header.slice(0, 2);

      header.push(el.querySelector('.mw-headline').rawText);
      continue;
    }
    if (el.tagName.toLowerCase() != 'table') continue;

    const tableData = parseTable(el);
    info.push({
      category: header.slice(),
      data: tableData,
    });
  }

  return info;
}

module.exports = {
  runStreamNetwork
};
