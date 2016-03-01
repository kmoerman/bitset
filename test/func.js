
var Random = require('random-js');
var should = require('should');

var Bitset = require('../bitset');



function pi  (s) { return parseInt(s); }
function mns (a,b) { return a - b;     }

// object to sorted array of integer keys
function o2a (o) { return Object.keys(o).map(pi).sort(mns); }


// SETUP
var max = 10000;
var n   = 1000;

var rn = new Random(Random.engines.mt19937().autoSeed());

// JS based sets
var hA = {};
var hB = {};
var hI = {};
var hU = {};
var hD = {};
var hS = {};

// base A B
for (var i = 0; i < n; ++i)
  hA[rn.integer(0,max)] = hB[rn.integer(0,max)] = true;

var A = o2a(hA);
var B = o2a(hB);

// intersect A B
for (k in hA) if (k in hB) hI[k] = true;

// union A B
hU = Object.assign({}, hA, hB);

// diff A B
for (k in hA) if (!(k in hB)) hD[k] = true;


// OWN BITSETS
bA = Bitset.with(A);
bB = Bitset.with(B);
bU = Bitset.union(bA, bB);
bI = Bitset.intersection(bA, bB);
bD = Bitset.difference(bA, bB);
bE = Bitset.empty();


bA.count().should.above(0);
bB.count().should.above(0);
bA.isEmpty().should.be.false();
bB.isEmpty().should.be.false();

// main test
function same (bs, hs) {
  ar = o2a(hs);

  bs.count().should.equal(ar.length);

  // every ar in hs
  ar.every(function (n) { return bs.has(n); }).should.be.true();

  // every bs in ar
  var t = true;
  bs.each(function (a) { t = t && (ar.indexOf(a) >= 0); });
  t.should.be.true();
}

// LARGE-SCALE OPS
same(bA, hA);
same(bB, hB);
same(bU, hU);
same(bI, hI);
same(bD, hD);


// build subset of A (±80%)
var bS = Bitset.empty();
var k = 0;
bA.each(function (n) {
  if (rn.bool(0.8)) { ++k; bS.put(n); }
});

bS.count().should.equal(k);

bA.hasSubset(bS).should.be.true();
bS.isSubsetOf(bA).should.be.true();

bE.isEmpty().should.be.true();
bE.count().should.equal(0);
bA.hasSubset(bE).should.be.true();
bE.hasSubset(bA).should.be.false();


// SMALL-SCALE OPS
var bC = Bitset.empty();
A.forEach(function (a) { bC.put(a); });
same(bC, hA);

B.forEach(function (b) { bC.put(b); });
same(bC, hU);

B.forEach(function (b) { bC.remove(b); });
same(bC, hD);

A.forEach(function (a) { bC.flip(a); });
same(bC, hI);


bE.put(5000);
bE.count().should.equal(1);
bE.isSingleton().should.be.true();
bE.flip(5000).count().should.equal(0);



// EXTREMES
bA.min().should.equal(A[0]);
bA.max().should.equal(A[A.length-1]);


