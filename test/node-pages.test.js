var assert = require('assert');
var fs = require('fs');

var Pages = require('../lib/node-pages.js');

var templateFile = __dirname + '/template.npg';

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
    assert.equal(pages.render(), '  ');
  });

  it('output \\r', function() {
    fs.writeFileSync(templateFile, '\r');
    pages = Pages.newInstance({
      srcPath : templateFile
    });
    assert.equal(pages.render(), '');
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
    var templateFile1 = __dirname + '/template1.npg';
    fs.writeFileSync(templateFile1,
      '<html><body><?- arg ?></body></html>');
    var pages1 = Pages.newInstance({
      srcPath : templateFile1
    });
    var templateFile2 = __dirname + '/template2.npg';
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

});
