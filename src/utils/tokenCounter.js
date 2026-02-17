const { encode } = require("gpt-tokenizer");

const countTokens = (text) => {
  if (!text) return 0;
  return encode(text).length;
};

module.exports = countTokens;
