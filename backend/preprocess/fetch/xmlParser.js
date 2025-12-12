const xml2js = require("xml2js");

const parser = new xml2js.Parser({
  explicitArray: false,
  trim: true
});

function parseXML(xml) {
  return parser.parseStringPromise(xml);
}

module.exports = parseXML;
