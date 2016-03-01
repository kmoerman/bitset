
var Bitset = require('../bitset.js');

var Benchmark = require('benchmark');
var sprintf   = require('sprintf-js').sprintf;


// PERFORMANCE TEST, COMPARING BITSETS WITH
// STANDARD JS HASH OBJECTS
// expecting order-of-magnitude speedups

// Fisher-Yates shuffle
// https://bost.ocks.org/mike/shuffle/compare.html
function shuffle (array) {
  var m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
}



// INSERT
function insertH (arr, i, n) {
  var h = {};
  for (; i < n; ++i)
    h[arr[i]] = true;
  return h;
}

function insertB (arr, i, n) {
  var t = Bitset.empty();
  for(;i < n; ++i)
    t.put(arr[i]);
  return t;
}


// LOOKUP
function lookupH (arr, i, n, h) {
  var k = 0;
  for (; i < n; ++i)
    if (arr[i] in h) ++k;
  return k;
}

function lookupB (arr, i, n, b) {
  var k = 0;
  for (; i < n; ++i)
    if (b.has(arr[i])) ++k;
  return k;
}


// KEYGEN
function keygenH (h) {
  return Object.keys(h);
}

function keygenB (b) {
  return b.toArray();
}



// UNION
function unionH (h1, h2) {
  return Object.assign({}, h1, h2);
}


// INTERSECT
function interH (h1, h2) {
  var h = {};
  for (k in h1) if (k in h2) h[k] = true;
  return h;
}


// DIFFERENCE
function differH (h1, h2) {
  var h = {};
  for (k in h1) if (! (k in h2)) h[k] = true;
  return h;
}

// test input
var n = 20000; // number   of candidates
var p = 0.8;  // presence of candidates
var A = new Array (n);
var B = new Array (n);
var m = Math.floor(n * p);

for (var i = 0; i < n; ++i) A[i] = B[i] = i;
shuffle(A);
shuffle(B);

// two hashes, constructed every time
var h1 = insertH(A, 0, m);
var h2 = insertH(B, 0, m);

// two bitsets, constructed every time
var b1 = insertB(A, 0, m);
var b2 = insertB(B, 0, m);

// union - intersection sizes
console.log('N ', b1.count());
console.log('Nu', 'expect ±' + Math.round((1 - Math.pow((1 - p), 2)) * n)
                , '; actually ',  Bitset.union(b1, b2).count());
console.log('Ni',  'expect ±' +  Math.round((Math.pow(p, 2) * n))
                ,  '; actually ', Bitset.intersection(b1, b2).count());

// setup the tests
var insert = new Benchmark.Suite ('INSERT (' + m + ')');
var lookup = new Benchmark.Suite ('LOOKUP (' + n + ')');
var genkey = new Benchmark.Suite ('GENKEY (' + m + ')');
var unions = new Benchmark.Suite ('UNIONS (' + m + ')');
var inters = new Benchmark.Suite ('INTERS (' + m + ')');
var differ = new Benchmark.Suite ('DIFFER (' + m + ')');

var tests = [insert, lookup, genkey, unions, inters, differ];

insert
  .add('hash', function () { h1 = insertH(A, 0, m); })
  .add('bits', function () { b1 = insertB(A, 0, m); });

lookup
  .add('hash', function () { lookupH(A, 0, n, h1); })
  .add('bits', function () { lookupB(A, 0, n, b1); });

genkey
  .add('hash', function () { var k = keygenH(h1); })
  .add('bits', function () { var k = keygenB(b1); });

unions
  .add('hash', function () { var h3 = unionH(h1, h2); })
  .add('bits', function () { var b3 = Bitset.union(b1, b2); });

inters
  .add('hash', function () { var h3 = interH(h1, h2); })
  .add('bits', function () { var b3 = Bitset.intersection(b1, b2); });

differ
  .add('hash', function () { var h3 = differH(h1, h2); })
  .add('bits', function () { var b3 = Bitset.difference(b1, b2); });




function complete () {
  console.log(this.name);
  this.each(function (b) { 
    var s = b.stats;
    console.log(sprintf(' %s : mean %0.10f , rme %0.2f%%',
                        b.name, s.mean, s.rme));
  });
}


tests.forEach(function (s) { s.on('complete', complete)
                              .run(); });

