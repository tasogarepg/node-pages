var assert = require('assert');
var fs = require('fs');
var path = require('path');

var Pages = require('../lib/node-pages.js');

var templateFile = path.join(__dirname, 'template.npg');

var pages = null;

describe('node-pages', function() {
  after(function() {
    fs.unlinkSync(templateFile);
    fs.rmdirSync(Pages.DEFAULT_WORK_DIR);
  });

  afterEach(function() {
    if (pages) {
      pages.clear();
      fs.unlinkSync(pages.dstPath);
      pages = null;
    }
  });

  it('create new instance', function() {
    fs.writeFileSync(templateFile, 'abcd');
    pages = Pages.create({
      srcPath : templateFile
    });
    assert.equal(pages.render(), 'abcd');
  });

  it('output string', function() {
    fs.writeFileSync(templateFile, 'abcd');
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    assert.equal(pages.render(), 'abcd');
  });

  it('output back-slashes', function() {
    fs.writeFileSync(templateFile, '\\');
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    assert.equal(pages.render(), '\\');
  });

  it('output double-quotes', function() {
    fs.writeFileSync(templateFile, '"');
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    assert.equal(pages.render(), '"');
  });

  it('output single-quotes', function() {
    fs.writeFileSync(templateFile, "'");
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    assert.equal(pages.render(), "'");
  });

  it('output tab', function() {
    fs.writeFileSync(templateFile, '\t');
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    assert.equal(pages.render(), '\t');
  });

  it('output \\r', function() {
    fs.writeFileSync(templateFile, '\r');
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    assert.equal(pages.render(), '\r');
  });

  it('output \\n', function() {
    fs.writeFileSync(templateFile, '1\n2');
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    assert.equal(pages.render(), '1\n2');
  });

  it('output unescaped val', function() {
    fs.writeFileSync(templateFile, '<?- arg.str ?>');
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    var arg = {str : '&<>"'};
    assert.equal(pages.render(arg), '&<>"');
  });

  it('output html escaped val', function() {
    fs.writeFileSync(templateFile, '<?= arg.str ?>');
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    var arg = {str : '&<>"'};
    assert.equal(pages.render(arg), '&amp;&lt;&gt;&quot;');
  });

  it('output number', function() {
    fs.writeFileSync(templateFile, '<?= arg.num ?>');
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    var arg = {num : 10};
    assert.equal(pages.render(arg), '10');
  });

  it('output 0', function() {
    fs.writeFileSync(templateFile, '<?= arg.num ?>');
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    var arg = {num : 0};
    assert.equal(pages.render(arg), '0');
  });

  it('output \'\'', function() {
    fs.writeFileSync(templateFile, '<?= arg.val ?>');
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    var arg = {val : ''};
    assert.equal(pages.render(arg), '');
  });

  it('output undefined', function() {
    fs.writeFileSync(templateFile, '<?= arg.val ?>');
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    var arg = {val : undefined};
    assert.equal(pages.render(arg), '');
  });

  it('output null', function() {
    fs.writeFileSync(templateFile, '<?= arg.val ?>');
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    var arg = {val : null};
    assert.equal(pages.render(arg), '');
  });

  it('composite template', function() {
    fs.writeFileSync(templateFile,
      '<? if(arg.str1 == arg.str2){ ?><?= arg.str1 ?><? }else{ ?><?= arg.str2 ?><? } ?>');
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    var arg = {str1 : '1', str2 : '2'};
    assert.equal(pages.render(arg), '2');
  });

  it('nested', function() {
    var templateFile1 = path.join(__dirname, 'template1.npg');
    fs.writeFileSync(templateFile1,
      '<html><body><?- arg ?></body></html>');
    var pages1 = Pages.newInstance({
      srcPath : templateFile1
    });
    var templateFile2 = path.join(__dirname, 'template2.npg');
    fs.writeFileSync(templateFile2,
      '<p><?= arg.name ?></p>');
    var pages2 = Pages.newInstance({
      srcPath : templateFile2
    });
    var arg = {name : 'tasogare'};
    assert.equal(pages1.render(pages2.render(arg)),
      '<html><body><p>tasogare</p></body></html>');
    pages1.clear();
    pages2.clear();
    fs.unlinkSync(pages1.dstPath);
    fs.unlinkSync(pages2.dstPath);
    fs.unlinkSync(templateFile1);
    fs.unlinkSync(templateFile2);
  });

  it('cached', function() {
    fs.writeFileSync(templateFile, 'first');
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    assert.equal(pages.render(), 'first');
    fs.writeFileSync(templateFile, 'second');
    var pages2 = Pages.newInstance({
      srcPath : templateFile
    });
    assert.equal(pages2.render(), 'first');
  });

  it('custom tags', function() {
    fs.writeFileSync(templateFile,
      '<% if(arg.str1 == arg.str2){ %><%= arg.str1 %><% }else{ %><%= arg.str2 %><% } %>');
    pages = Pages.newInstance({
      openWord : '<%',
      closeWord : '%>',
      srcPath : templateFile
    });
    var arg = {str1 : '1', str2 : '2'};
    assert.equal(pages.render(arg), '2');
  });

  it('custom arg name', function() {
    fs.writeFileSync(templateFile,
      '<? if(it.str1 == it.str2){ ?><?= it.str1 ?><? }else{ ?><?= it.str2 ?><? } ?>');
    pages = Pages.newInstance({
      renderArgName : 'it',
      srcPath : templateFile
    });
    var arg = {str1 : '1', str2 : '2'};
    assert.equal(pages.render(arg), '2');
  });

  it('custom work dir', function() {
    var templateFile1 = path.join(__dirname, 'template1.npg');
    fs.writeFileSync(templateFile1, 'abcd');
    var pages1 = Pages.create({
      workDir : 'work1',
      srcPath : templateFile1
    });
    assert.equal(pages1.render(), 'abcd');
    pages1.clear();
    fs.unlinkSync(pages1.dstPath);
    fs.rmdirSync(pages1.workDir);
    fs.unlinkSync(templateFile1);
  });

  it('bench', function() {
    var templateFile1 = path.join(__dirname, 'template1.npg');
    fs.writeFileSync(templateFile1,
      '<? if(arg.val1 == arg.val2){ ?><?= arg.val1 ?><? }else{ ?><?= arg.val2 ?><? } ?>');
    var pages1 = null;
    var arg = {val1 : 'abcd', val2 : 'efgh'};
    for (var i=0; i<100000; i++) {
      pages1 = Pages.newInstance({
        srcPath : templateFile
      });
      pages1.render(arg);
    }
    pages1.clear();
    fs.unlinkSync(pages1.dstPath);
    fs.unlinkSync(templateFile1);
  });

});
