// Generated by CoffeeScript 1.6.3
var data, obj, suff;

require("sugarjs");

require("/Users/spencer/mountain/dirty/dirty");

data = require("./data").data;

obj = {
  infinitive: [],
  present: [],
  gerund: [],
  past: [],
  past_participle: []
};

suff = {};

data.forEach(function(o) {
  return Object.keys(obj).each(function(k) {
    var suffix;
    suffix = o[k].substr(o[k].length - 3, o[k].length);
    if (!suff[suffix]) {
      suff[suffix] = [];
    }
    return suff[suffix].push(k);
  });
});

console.log(JSON.stringify(suff, null, 2));
