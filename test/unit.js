'use strict';

// This is the main test suite
var xpath = require('xpath');
var Dom = require('xmldom').DOMParser;

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

// Testing goji.js
lab.suite('goji', function() {
  var output = require('./goji.js');
  var doc = new Dom().parseFromString(output);

  lab.test('should be `value of foo.bar`', function (done) {
    Code.expect(xpath.select('//div[1]/text()', doc).toString())
      .to.equal('value of foo.bar');

    done();
  });

  lab.test('should be `result of foobar()`', function(done) {
    Code.expect(xpath.select('//div[2]/text()', doc).toString())
      .to.equal('result of foobar()');

    done();
  });

  lab.test('should be `nope`', function(done) {
    Code.expect(xpath.select('//div[3]/text()', doc).toString())
      .to.equal('nope');

    done();
  });

  lab.test('should be `value of foo.bar`', function(done) {
    Code.expect(xpath.select('//div[4]/text()', doc).toString())
      .to.equal('value of foo.bar');

    done();
  });
});

// Testing class.js
lab.suite('class', function() {
  var output = require('./class.js');
  var doc = new Dom().parseFromString(output);

  var peles = xpath.select('//p[@class]', doc);
  lab.test('should have 4 p elements', function(done) {
    Code.expect(peles.length).to.equal(4);
    done();
  });

  lab.test('first p should have classes `foo afterFoo`', function(done) {
    Code.expect(peles[0].getAttribute('class')).to.equal('foo afterFoo');
    done();
  });

  lab.test('second p should have classes `bar foo`', function(done) {
    Code.expect(peles[1].getAttribute('class')).to.equal('bar foo');
    done();
  });

  lab.test('third p should have classes `beforeFoo is foo`', function(done) {
    Code.expect(peles[2].getAttribute('class')).to.equal('beforeFoo is foo');
    done();
  });

  lab.test('fourth p should have classes `one two bar`', function(done) {
    Code.expect(peles[3].getAttribute('class')).to.equal('one two bar');
    done();
  });

  var lieles = xpath.select('//li[@class]', doc);
  lab.test('should have 3 li elements', function(done) {
    Code.expect(lieles.length).to.equal(3);
    done();
  });

  lab.test('first li should have class `even`', function(done) {
    Code.expect(lieles[0].getAttribute('class')).to.equal('even');
    done();
  });

  lab.test('second li should ahve class `odd`', function(done) {
    Code.expect(lieles[1].getAttribute('class')).to.equal('odd');
    done();
  });

  lab.test('third li should have class `even`', function(done) {
    Code.expect(lieles[2].getAttribute('class')).to.equal('even');
    done();
  });

  var treles = xpath.select('//tr[@class]', doc);
  lab.test('should have 2 tr elements', function(done) {
    Code.expect(treles.length).to.equal(2);
    done();
  });

  lab.test('first tr should have class even', function(done) {
    Code.expect(treles[0].getAttribute('class')).to.equal('even');
    done();
  });

  lab.test('second tr should have class odd', function(done) {
    Code.expect(treles[1].getAttribute('class')).to.equal('odd');
    done();
  });
});

// Testing each.js
lab.suite('each', function() {
  var output = require('./each.js');
  var doc = new Dom().parseFromString(output);

  var lieles = xpath.select('//li', doc);
  lab.test('should have 3 li elements', function(done) {
    Code.expect(lieles.length).to.equal(3);
    done();
  });

  lab.test('first li should read `list item 1`', function(done) {
    Code.expect(lieles[0].firstChild.data).to.equal('list item 1');
    done();
  });

  lab.test('second li should read `list item 2`', function(done) {
    Code.expect(lieles[1].firstChild.data).to.equal('list item 2');
    done();
  });

  lab.test('third li should read `list item 3`', function(done) {
    Code.expect(lieles[2].firstChild.data).to.equal('list item 3');
    done();
  });

  var tdeles = xpath.select('//td', doc);
  lab.test('should have 4 td elements', function(done) {
    Code.expect(tdeles.length).to.equal(4);
    done();
  });

  lab.test('first td should read `r1c1`', function(done) {
    Code.expect(tdeles[0].firstChild.data).to.equal('r1c1');
    done();
  });

  lab.test('second td should read `r1c2`', function(done) {
    Code.expect(tdeles[1].firstChild.data).to.equal('r1c2');
    done();
  });

  lab.test('third td should read `r2c1`', function(done) {
    Code.expect(tdeles[2].firstChild.data).to.equal('r2c1');
    done();
  });

  lab.test('fourth td should read `r2c2`', function(done) {
    Code.expect(tdeles[3].firstChild.data).to.equal('r2c2');
    done();
  });
});

// Testing if.js
lab.suite('if', function() {
  var output = require('./if.js');
  var doc = new Dom().parseFromString(output);

  var peles = xpath.select('//p', doc);
  lab.test('should have 3 p elements', function(done) {
    Code.expect(peles.length).to.equal(3);
    done();
  });

  lab.test('first p should read `This will be rendered`', function(done) {
    Code.expect(peles[0].firstChild.data).to.equal('This will be rendered');
    done();
  });

  lab.test('second p should read `bar`', function(done) {
    Code.expect(peles[1].firstChild.data).to.equal('bar');
    done();
  });

  lab.test('third p should read `This will also be rendered`', function(done) {
    Code.expect(peles[2].firstChild.data).to.equal('This will also be rendered');
    done();
  });
});

// Testing text.js
lab.suite('text', function() {
  var output = require('./text.js');
  var doc = new Dom().parseFromString(output);

  var divs = xpath.select('//div', doc);
  lab.test('should have 4 div elements', function(done) {
    Code.expect(divs.length).to.equal(4);
    done();
  });

  lab.test('first div should read `value of foo.bar`', function(done) {
    Code.expect(divs[0].firstChild.data).to.equal('value of foo.bar');
    done();
  });

  lab.test('second div should read `result of foobar()`', function(done) {
    Code.expect(divs[1].firstChild.data).to.equal('result of foobar()');
    done();
  });

  lab.test('third div should read `nope`', function(done) {
    Code.expect(divs[2].firstChild.data).to.equal('nope');
    done();
  });

  lab.test('fourth div should read `value of foo.bar`', function(done) {
    Code.expect(divs[3].firstChild.data).to.equal('value of foo.bar');
    done();
  });
});

// Testing html.js
lab.suite('html', function() {
  var output = require('./html.js');
  var doc = new Dom().parseFromString(output);

  var divs = xpath.select('//div', doc);
  lab.test('should have 1 div elements', function(done) {
    Code.expect(divs.length).to.equal(1);
    done();
  });

  lab.test('div should have 3 children', function(done) {
    Code.expect(divs[0].childNodes.length).to.equals(3);
    done();
  });

  lab.test('second child should be em tag', function(done) {
    Code.expect(divs[0].childNodes['1'].tagName).to.equal('em');
    done();
  });
});

// Testing include.js
lab.suite('include', function() {
  var output = require('./include.js');
  var doc = new Dom().parseFromString(output);

  var divs = xpath.select('//div', doc);
  lab.test('should have 2 div elements', function(done) {
    Code.expect(divs.length).to.equal(2);
    done();
  });

  var barText = 'This is the content of #bar from foo.html.';
  lab.test('first div should read: ' + barText, function(done) {
    Code.expect(divs[0].firstChild.data.trim()).to.equal(barText);
    done();
  });

  var bazText = 'This is the content of #baz from foo.html.';
  lab.test('second div should read: ' + bazText, function(done) {
    Code.expect(divs[1].firstChild.data.trim()).to.equal(bazText);
    done();
  });
});

// Testing replace.js
lab.suite('replace', function() {
  var output = require('./replace.js');
  var doc = new Dom().parseFromString(output);

  var divs = xpath.select('//div[@id]', doc);
  lab.test('should have 2 div elements with id attributes', function(done) {
    Code.expect(divs.length).to.equal(2);
    done();
  });

  lab.test('first div id should be `bar`', function(done) {
    Code.expect(divs[0].getAttribute('id')).to.equal('bar');
    done();
  });

  lab.test('second div id should be `baz`', function(done) {
    Code.expect(divs[1].getAttribute('id')).to.equal('baz');
    done();
  });
});

// Testing attr.js
lab.suite('attr', function() {
  var output = require('./attr.js');
  var doc = new Dom().parseFromString(output);

  var peles = xpath.select('//p', doc);
  lab.test('should have 3 p elements', function(done) {
    Code.expect(peles.length).to.equal(3);
    done();
  });

  lab.test('first p should have an id attribute with value `foo`', function(done) {
    Code.expect(peles[0].getAttribute('id')).to.equal('foo');
    done();
  });

  lab.test('second p should have an id attribute with value `bar`', function(done) {
    Code.expect(peles[1].getAttribute('id')).to.equal('bar');
    done();
  });

  lab.test('third p should have an id attribute with value `baz`', function(done) {
    Code.expect(peles[2].getAttribute('id')).to.equal('baz');
    done();
  });

  lab.test('third p should have a data-foo attribute with value `bazfoo`', function(done) {
    Code.expect(peles[2].getAttribute('data-foo')).to.equal('bazfoo');
    done();
  });

  lab.test('third p should have a class attribute with the value `classy`', function(done) {
    Code.expect(peles[2].getAttribute('class')).to.equal('classy');
    done();
  });
});

// Testing partial.js
lab.suite('partial', function() {
  var output = require('./partial.js');
  var doc = new Dom().parseFromString(output);

  var divs = xpath.select('//div[@id]', doc);
  lab.test('should have 2 div elements with id attributes', function(done) {
    Code.expect(divs.length).to.equal(2);
    done();
  });

  lab.test('div 1 should have id equal to `bar`', function(done) {
    Code.expect(divs[0].getAttribute('id')).to.equal('bar');
    done();
  });

  lab.test('div 2 should have id equal to `baz`', function(done) {
    Code.expect(divs[1].getAttribute('id')).to.equal('baz');
    done();
  });
});