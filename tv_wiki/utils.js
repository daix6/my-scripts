const { HTMLElement } = require('node-html-parser');

/**
 *
 * @param {HTMLElement} tableEl
 */
function parseTable(tableEl) {
  // 爬到的 wiki 没有 thead，只有 tbody，第一行是 header
  let [thead, ...rows] = tableEl.querySelectorAll('tr');

  const headers = thead.querySelectorAll('th').map(el => removeUnicode(el.rawText.trim()));
  rows = rows.filter(row => !row.querySelector('th'));

  const result = rows.map(row => Array(headers.length));
  rows.forEach((row, rowIndex) => {
    row.querySelectorAll('td').forEach((td, _colIndex) => {
      let colIndex = _colIndex;

      for (colIndex = _colIndex; colIndex < result[rowIndex].length; colIndex++) {
        if (typeof result[rowIndex][colIndex] === 'undefined') break;
      }

      const rowspan = td.attributes.rowspan ? +td.attributes.rowspan : 1;
      const colspan = td.attributes.colspan ? +td.attributes.colspan : 1;

      // 有些情况 wiki 的 table 的 rowspan 会写错。。
      for (let i = 0; i < rowspan && rowIndex + i < result.length; i++) {
        for (let j = 0; j < colspan && colIndex + j < headers.length; j++) {
          result[rowIndex + i][colIndex + j] = removeUnicode(td.rawText.trim());
        }
      }
    });
  });


  const ret = [];
  result.forEach(row => {
    const item = {}
    row.forEach((value, index) => {
      item[headers[index]] = value;
    });
    ret.push(item);
  });

  return ret;
}

function removeUnicode(str) {
  return str.replace(/(&#\d+?;\d+&#\d+?;)+$/, '');
}

module.exports = {
  parseTable,
}