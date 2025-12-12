const axios = require("axios");

async function fetchXML(url) {
  const res = await axios.get(url);
  return res.data;
}

module.exports = fetchXML;
