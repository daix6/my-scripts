const wiki = require('../wiki/src/wiki').default
const { parse } = require('node-html-parser');
const parseTable = require('./utils').parseTable;
const HttpsProxyAgent = require('https-proxy-agent');

// const agent =  new HttpsProxyAgent.HttpsProxyAgent('http://127.0.0.1:7890')

async function runStreamNetwork(name) {
  // const wiki = (await import('../wiki/src/wiki.js')).default;
  const result = await wiki().page(name);

  const root = parse(await result.html());
  const nodes = root.querySelectorAll('.mw-parser-output > *');

  const info = [];
  for (let i = 0, header = []; i < nodes.length; i++) {
    const el = nodes[i], tagName = el.tagName.toLowerCase();

    if (el.classList.contains('mw-heading')) {
      if (el.classList.contains('mw-heading2')) header = [];
      else if (el.classList.contains('mw-heading3')) header = header.slice(0, 1);
      else header = header.slice(0, 2);

      header.push(el.firstChild.rawText);
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
