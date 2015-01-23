

// if we're server-side, grab files, otherwise assume they're prepended already
if (typeof module !== "undefined" && module.exports) {

  var parents = require("./src/parents/parents")

  var sentence_parser = require('./src/methods/tokenization/sentence').sentences;
  var tokenize = require('./src/methods/tokenization/tokenize').tokenize;
  var ngram = require('./src/methods/tokenization/ngram').ngram;
  //tokenize
  var normalize = require('./src/methods/transliteration/unicode_normalisation')
  var syllables = require('./src/methods/syllables/syllable');
  //localization
  var l = require('./src/methods/localization/britishize')
  var americanize = l.americanize;
  var britishize = l.britishize;
  //part of speech tagging
  var pos = require('./src/pos');
  //named_entity_recognition
  var spot = require('./src/spot');
}

///
//footer
//
var nlp = {

  noun: parents.noun,
  adjective: parents.adjective,
  verb: parents.verb,
  adverb: parents.adverb,
  value: parents.value,

  sentences: sentence_parser,
  ngram: ngram,
  tokenize: tokenize,
  americanize: americanize,
  britishize: britishize,
  syllables: syllables,
  normalize: normalize.normalize,
  denormalize: normalize.denormalize,
  pos: pos,
  spot: spot,
  // tests: tests,
}


//export it for server-side
if (typeof module !== "undefined" && module.exports) {
  module.exports = nlp
}
