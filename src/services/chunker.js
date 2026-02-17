const countTokens = require('../utils/tokenCounter');
const config = require('../utils/config');

function chunkText(text) {
  const words = text.split(/\s+/);
  const chunks = [];

  const chunkSize = config.rag.chunkSize;
  const overlap = config.rag.chunkOverlap;

  let start = 0;

  while (start < words.length) {
    const end = start + chunkSize;
    const chunk = words.slice(start, end).join(' ');

    chunks.push(chunk);

    start += chunkSize - overlap;
  }

  return chunks;
}

module.exports = {
  chunkText
};
    