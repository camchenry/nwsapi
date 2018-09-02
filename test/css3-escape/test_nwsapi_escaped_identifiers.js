"use strict";

// preparation for jsdom on nodejs (not entered on browsers)
if (typeof document === "undefined") {
  var jsdom = require("jsdom");
  var document = jsdom.jsdom();
}

function testMatched(id, selector) {
  var elems = document.createElement("div");
  var a = document.createElement("span");
  a.id = id;
  a.className = id;
  elems.appendChild(a);
  console.assert(
    NW.Dom.first(selector, elems) === a,
    `${JSON.stringify(id)} should match with ${JSON.stringify(selector)}`);
  console.assert(
    NW.Dom.first('.' + selector.slice(1), elems) === a,
    `${JSON.stringify(id)} should match with ${JSON.stringify('.' + selector.slice(1))}`);
}
function testNeverMatched(id, selector) {
  var elems = document.createElement("div");
  var a = document.createElement("span");
  a.id = id;
  a.className = id;
  elems.appendChild(a);
  console.assert(
    NW.Dom.first(selector, elems) === null,
    `${JSON.stringify(id)} should never match with ${
        JSON.stringify(selector)}`);
  console.assert(
    NW.Dom.first('.' + selector.slice(1), elems) === null,
    `${JSON.stringify(id)} should never match with ${
        JSON.stringify('.' + selector.slice(1))}`);
}

// 4.3.7 from https://www.w3.org/TR/css-syntax-3/#consume-an-escaped-code-point
testMatched("nonescaped", "#nonescaped");

// - escape hex digit
testMatched("0nextIsWhiteSpace", "#\\30 nextIsWhiteSpace");
testMatched("0nextIsNotHexLetters", "#\\30nextIsNotHexLetters");
testMatched("0connectHexMoreThan6Hex", "#\\000030connectHexMoreThan6Hex");
testMatched("0spaceMoreThan6Hex", "#\\000030 spaceMoreThan6Hex");

// - hex digit special replacement

// 1. zero points
testMatched("zero\u{fffd}", "#zero\\0");
testNeverMatched("zero\u{0}", "#zero\\0");
testMatched("zero\u{fffd}", "#zero\\000000");
testNeverMatched("zero\u{0}", "#zero\\000000");

// 2. surrogate points
testMatched("\u{fffd}surrogateFirst", "#\\d83d surrogateFirst");
testNeverMatched("\ud83dsurrogateFirst", "#\\d83d surrogateFirst");
testMatched("surrogateSecond\u{fffd}", "#surrogateSecond\\dd11");
testNeverMatched("surrogateSecond\udd11", "#surrogateSecond\\dd11");
testMatched("surrogatePair\u{fffd}\u{fffd}", "#surrogatePair\\d83d\\dd11");
testNeverMatched("surrogatePair\u{1f511}", "#surrogatePair\\d83d\\dd11");

// 3. out of range points
testMatched("outOfRange\u{fffd}", "#outOfRange\\110000");
testMatched("outOfRange\u{fffd}", "#outOfRange\\110030");
testNeverMatched("outOfRange\u{30}", "#outOfRange\\110030");
testMatched("outOfRange\u{fffd}", "#outOfRange\\555555");
testMatched("outOfRange\u{fffd}", "#outOfRange\\ffffff");

// - escape EOF
testMatched("eof\u{fffd}", "#eof\\");
testNeverMatched("eof\\", "#eof\\");

// - escape anythong else
testMatched(".comma", "#\\.comma");
testMatched("-minus", "#\\-minus");
testMatched("g", "#\\g");

// non edge cases
testMatched("aBMPRegular", "#\\61 BMPRegular");
testMatched("\u{1f511}nonBMP", "#\\1f511 nonBMP");
testMatched("00continueEscapes", "#\\30\\30 continueEscapes");
testMatched("00continueEscapes", "#\\30 \\30 continueEscapes");
testMatched("continueEscapes00", "#continueEscapes\\30 \\30 ");
testMatched("continueEscapes00", "#continueEscapes\\30 \\30");
testMatched("continueEscapes00", "#continueEscapes\\30\\30 ");
testMatched("continueEscapes00", "#continueEscapes\\30\\30");

// ident tests case from CSS tests of chromium source: https://goo.gl/3Cxdov
testMatched("hello", "#hel\\6Co");
testMatched("&B", "#\\26 B");
testMatched("hello", "#hel\\6C o");
testMatched("spaces", "#spac\\65\r\ns");
testMatched("spaces", "#sp\\61\tc\\65\fs");
testMatched("test\u{D799}", "#test\\D799");
testMatched("\u{E000}", "#\\E000");
testMatched("test", "#te\\s\\t");
testMatched("spaces in\tident", "#spaces\\ in\\\tident");
testMatched(".,:!", "#\\.\\,\\:\\!");
testMatched("null\u{fffd}", "#null\\0");
testMatched("null\u{fffd}", "#null\\0000");
testMatched("large\u{fffd}", "#large\\110000");
testMatched("large\u{fffd}", "#large\\23456a");
testMatched("surrogate\u{fffd}", "#surrogate\\D800");
testMatched("surrogate\u{fffd}", "#surrogate\\0DBAC");
testMatched("\u{fffd}surrogate", "#\\00DFFFsurrogate");
testMatched("\u{10ffff}", "#\\10fFfF");
testMatched("\u{10ffff}0", "#\\10fFfF0");
testMatched("\u{100000}00", "#\\10000000");

testMatched("simple-ident", "#simple-ident");
testMatched("testing123", "#testing123");
testMatched("_underscore", "#_underscore");
testMatched("-text", "#-text");
testMatched("-m", "#-\\6d");
testMatched("--abc", "#--abc");
testMatched("--", "#--");
testMatched("--11", "#--11");
testMatched("---", "#---");
testMatched("\u{2003}", "#\u{2003}");
testMatched("\u{A0}", "#\u{A0}");
testMatched("\u{1234}", "#\u{1234}");
testMatched("\u{12345}", "#\u{12345}");
testMatched("\u{fffd}", "#\u{0}");
testMatched("ab\u{fffd}c", "#ab\u{0}c");
