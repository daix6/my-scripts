const { HTMLElement } = require('node-html-parser');
const tabletojson = require('tabletojson').Tabletojson;
const { each } = require('lodash');

/**
 *
 * @param {HTMLElement} tableEl
 */
function parseTable(tableEl) {
  // 爬到的 wiki 没有 thead，只有 tbody，第一行是 header
  let [thead, ...rows] = tableEl.querySelectorAll('tbody > tr');

  rows = rows.filter(row => !row.querySelector('th'));
  const tableHtml = ['<table><tbody>', thead, ...rows, '</tbody></table>'].map(i => i.toString()).join('');

  const result = tabletojson.convert(tableHtml)[0];

  result.forEach(row => {
    each(row, (value, key) => {
      row[key.toLowerCase()] = value.replace(/(\[\d+\])+$/, '');
      delete row[key];
    });
  });

  return result;
}

module.exports = {
  parseTable,
}