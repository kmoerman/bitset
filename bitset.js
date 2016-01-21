
'use strict';

module.exports = Bitset;

function Bitset () {
  this.intArray = [0,0];
}

Bitset.prototype.put = function (i) {
  this.intArray[i >>> 5] |= 1 << (31 & i);
  return this;
}

Bitset.prototype.flip = function (i) {
  this.intArray[i >>> 5] ^= 1 << (31 & i);
  return this;
}

Bitset.prototype.remove = function (i) {
  var idx = i >>> 5;
  if (idx < this.intArray.length)
    this.intArray[idx] &= ~(1 << (31 & i));
  return this;
}

Bitset.prototype.has = function (i) {
  var idx = i >>> 5;
  if (idx >= this.intArray.length) return false;
  return this.intArray[idx] & (1 << (31 & i));
}

Bitset.prototype.reset = function () {
  Bitset.call(this);
  return this;
}

Bitset.prototype.union = function (that) {
  var m = this.intArray.length;
  var n = that.intArray.length;
  var i;
  if (m < n) {
    this.intArray.length = n;
    for (i = m; i < n; ++i)
      this.intArray[i] = that.intArray[i];
  }
  for (i = 0; i < m; ++i)
    this.intArray[i] |= that.intArray[i];
  
  return this;
}

Bitset.prototype.intersect = function (that) {
  var m = this.intArray.length;
  var n = that.intArray.length;
  if (m > n) this.intArray.length = n;
  for (var i = 0; i < Math.min(m, n); ++i)
    this.intArray[i] &= that.intArray[i];
    
  return this;
}

Bitset.prototype.difference = function (that) {
  var m = this.intArray.length;
  var n = that.intArray.length;
  for (var i = 0; i < Math.min(m,n); ++i)
    this.intArray[i] &= ~that.intArray[i];
  
  return this;
}

Bitset.prototype.hasSubset = function (that) {
  var m = this.intArray.length;
  var n = that.intArray.length;
  var l = Math.min(m,n);
  var i = 0;
  var s = true;
  while (i < l && s) {
    s = ((that.intArray[i] & this.intArray[i]) == that.intArray[i]);
    ++i;
  }
  if (i < l) return false;
  if (i < m) return true;
  while (i < n && s) {
    s = !that.intArray[i];
    ++i;
  }
  return s;
}

Bitset.prototype.isSubsetOf = function (that) {
  return that.hasSubset(this);
}

Bitset.prototype.isEmpty = function () {
  var n = this.intArray.length;
  for (var i = 0; i < n; ++i)
    if (this.intArray[i])
      return false;
  return true;
}

Bitset.prototype.max = function () {
  for (var i = this.intArray.length - 1; i >= 0; --i) {
    var b = this.intArray[i];
    if (b !== 0 && b !== undefined)
      return (i << 5) | Bitset.msb(b);
  }
  
  return undefined;
}

Bitset.prototype.min = function () {
  for (var i = 0; i < this.intArray.length; ++i) {
    var b = this.intArray[i];
    if (b != 0)
      return (i << 5) + Bitset.lsb(b);
  }
  
  return undefined;
}

Bitset.prototype.count = function () {
  for (var c = 0, i = 0; i < this.intArray.length; ++i)
    c += Bitset.count(this.intArray[i]);
  return c;
}

Bitset.prototype.isSingleton = function () {
  var c = 0;
  var i = 0;
  var n = this.intArray.length;
  while (i < n && c < 2) {
    c += Bitset.count(this.intArray[i]);
    ++i;
  }
  return c === 1;
}

Bitset.prototype.each = function (f) {
  var b = 0;
  for (var i in this.intArray) {
    b = this.intArray[i]
    for (var j = 0, k = 1; j < 32; ++j, k <<= 1)
      if (b & k) f(i << 5 | j);
  }
}

Bitset.prototype.map = function (f) {
  var result = new Array(this.count());
  var i = 0;
  this.each(function (x) { result[i] = f(x, i); ++i; });
  return result;
}

Bitset.prototype.toArray = function () {
  return this.map(function (x) { return x; });
}

Bitset.prototype.toString = function () {
  return this.toArray().toString();
}


// Alternative Bitset constructors
Bitset.empty = function () {
  return new Bitset();
}

Bitset.singleton = function (i) {
  return Bitset.empty().put(i);
}

Bitset.with = function (x) {
  var a = (x instanceof Array)
        ? x
        : arguments;
  var b = new Bitset();
  for (var i = 0; i < a.length; ++i)
    b.put(a[i])
  return b;
}

Bitset.from = function (i) {
  var b = new Bitset();
  b.intArray = [i,0];
  return b;
}



// Collection of 32bit operations, freely adapted from
// https://graphics.stanford.edu/~seander/bithacks.html
// maintained in the public domain by Sean Eron Anderson.

// Most significant bit set in integer,
// without 0 check, returns 0 when input 0.
Bitset.msb = function (b) {
  var r = 0;
  var s = 0;
  
  r = ((b >>> 16) !== 0) << 4; b >>>= r;
  s = ((b >>>  8) !== 0) << 3; b >>>= s; r |= s;
  s = ((b >>>  4) !== 0) << 2; b >>>= s; r |= s;
  s = ((b >>>  2) !== 0) << 1; b >>>= s; r |= s;
                                         r |= (b >>> 1);
  return r;
}

// Least significant bit set in integer,
// without 0 check, returns 0 when input 0.
Bitset.lsb = function (b) {
  return Bitset.msbP2((b & (b-1)) ^ b);
}

// Most significant bit in a power of 2.
Bitset.msbP2 = function (b) {
  var r = 0;
  r  =  (b & 0xAAAAAAAA) != 0;
  r |= ((b & 0xFFFF0000) != 0) << 4;
  r |= ((b & 0xFF00FF00) != 0) << 3;
  r |= ((b & 0xF0F0F0F0) != 0) << 2;
  r |= ((b & 0xCCCCCCCC) != 0) << 1;
  return r;
}

// Reverse the bits in an integer.
Bitset.reverse = function (b) {
  b =   b               << 16  |   b               >>> 16;
  b =  (b & 0x00FF00FF) <<  8  |  (b & 0xFF00FF00) >>>  8;
  b =  (b & 0x0F0F0F0F) <<  4  |  (b & 0xF0F0F0F0) >>>  4;
  b =  (b & 0x33333333) <<  2  |  (b & 0xCCCCCCCC) >>>  2;
  b =  (b & 0x55555555) <<  1  |  (b & 0xAAAAAAAA) >>>  1;
  return b; 
}

// Interleave lower significance 16 bits.
Bitset.interleave = function (x, y) {
  var z = 0;
  
  x = (x | x << 8) & 0x00FF00FF;
  x = (x | x << 4) & 0x0F0F0F0F;
  x = (x | x << 2) & 0x33333333;
  x = (x | x << 1) & 0x55555555;
  
  y = (y | y << 8) & 0x00FF00FF;
  y = (y | y << 4) & 0x0F0F0F0F;
  y = (y | y << 2) & 0x33333333;
  y = (y | y << 1) & 0x55555555;
  
  z = x | y << 1;
  return z;
}

// count bits in integer
Bitset.count = function (b) {
  for (var c = 0; b; ++c) b &= b - 1;
  return c;
}

// determine if integer is power of 2
Bitset.isPowerOf2 = function (b) {
  return b && !(b & (b - 1));
}

// display as binary string `0b00101 ...`
// Optional second parameter indicates a desired
// minimum of bits displayed (maximum 32)
Bitset.toBinary = function (n, d) {
  d = d || 0;
  var b = '0b';
  var i = 31;
  while (i > 0 && i >= d && !(n & (1 << i))) --i;
  while (i >= 0) b += (n & (1 << i--) ? '1' : '0');
  
  return b;
}
