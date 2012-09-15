'use strict';
var fs = require('fs');
var path = require('path');

module.exports = Pages;

function Pages(conf) {
  conf = conf || {};

  this.openWord = conf.openWord || Pages.DEFAULT_OPEN_WORD;
  this.closeWord = conf.closeWord || Pages.DEFAULT_CLOSE_WORD;
  this.renderArgName = conf.renderArgName || Pages.DEFAULT_RENDER_ARG_NAME;
  this.workDir = conf.workDir && resolvePath(conf.workDir) || Pages.DEFAULT_WORK_DIR;
  this.srcPath = null;
  this.dstPath = null;
  this.name = null;

  if (conf.srcPath) {
    this.loadFileSync(conf.srcPath);
  }
}

Pages.create = 
Pages.newInstance = function(conf) {
  return new Pages(conf);
};

Pages.DEFAULT_OPEN_WORD  = '<?';
Pages.DEFAULT_CLOSE_WORD = '?>';
Pages.DEFAULT_RENDER_ARG_NAME = 'arg';
Pages.DEFAULT_WORK_DIR = joinPath(__dirname, 'work');
Pages.cache = [];

Pages.prototype.reloadFileSync = function() {
  if (!this.srcPath) return;
  this.clear();
  this.loadFileSync(this.srcPath);
};

Pages.prototype.clear = function() {
  this.deleteCache();
  this.deleteModule();
};

Pages.prototype.loadFileSync = function(srcPath) {
  if (!srcPath) return;
  this.srcPath = resolvePath(srcPath);
  this.name = this.makeName(this.srcPath);
  this.dstPath = this.makeDstPath(this.workDir, this.name);
  if (this.isCached()) return;
  this.setCache(
    this.setModuleSync(
      this.createJsFileSync( 
        this.parse(
          stripBOM(fs.readFileSync(this.srcPath, 'utf8'))))));
};

Pages.prototype.makeName = function(filePath) {
  return filePath && filePath.replace(/[\/\\:]/g, '__');
};

Pages.prototype.makeDstPath = function(workDir, name) {
  return joinPath(workDir, name) + '.js';
};

Pages.prototype.setCache = function(mdl, name) {
  name = name || this.name;
  if (name && mdl && mdl.render) {
    Pages.cache[name] = mdl.render;
  }
};

Pages.prototype.deleteCache = function(name) {
  name = name || this.name;
  if (name && Pages.cache[name]) {
    delete Pages.cache[name];
  }
};

Pages.prototype.isCached = function(name) {
  name = name || this.name;
  return !!Pages.cache[name];
};

Pages.prototype.setModuleSync = function(filePath) {
  filePath = filePath || this.dstPath;
  return require(filePath);
};

Pages.prototype.deleteModule = function(filePath) {
  filePath = filePath || this.dstPath;
  if (filePath && require.cache[filePath]) {
    delete require.cache[filePath];
  }
};

Pages.prototype.createJsFileSync = function(buf, name, workDir) {
  name = name || this.name;
  workDir = workDir || this.workDir;
  if (!fs.existsSync(workDir)) {
    fs.mkdirSync(workDir, parseInt('755', 8));
  }
  var filePath = this.makeDstPath(workDir, name);
  fs.writeFileSync(filePath, buf);
  return filePath;
};

Pages.prototype.parse = function(src) {
  src = this.closeWord + src + this.openWord;

  var buf = "exports.render = function(" + this.renderArgName + "){\n  var __rs = '';\n";
  for (var i=0, len=src.length; i<len;) {
    var start, end, str;
    start = src.indexOf(this.closeWord, i) + this.closeWord.length;
    end = src.indexOf(this.openWord, start);
    if (end == -1) break;
    str = src.substring(start, end);
    if (str != '') {
      str = str.replace(/[\\'\t\r\n]/g, function(c) {
        switch (c) {
          case "\\":  return "\\\\";
          case "'":   return "\\'";
          case "\t":  return "\\t";
          case "\r":  return "\\r";
          case "\n":  return "\\n";
        }
      });
      buf += "  __rs += '" + str + "';\n";
    }
    start = end + this.openWord.length;
    end = src.indexOf(this.closeWord, start);
    if (end == -1) break;
    str = src.substring(start, end);
    switch (str.substring(0, 1)) {
      case '-':
        buf += "  __rs += " + str.substring(1) + ";\n";
        break;
      case '=':
        buf += "  __rs += escape(" + str.substring(1) + ");\n";
        break;
      default:
        buf += str + "\n";
    }
    i = end;
  }
  buf += "  return __rs;\n};\n";
  buf += 
    "function escape(val){\n" +
    "  if (val == null) {\n" +
    "    return '';\n" +
    "  } else if (typeof val == 'string') {\n" +
    "    return (!/[&\"<>]/.test(val)) ? val :\n" +
    "      val.replace(/[&\"<>]/g, function(c) {\n" +
    "        switch (c) {\n" +
    "          case '&':  return '&amp;';\n" +
    "          case '\"': return '&quot;';\n" +
    "          case '<':  return '&lt;';\n" +
    "          case '>':  return '&gt;';\n" +
    "        }\n" +
    "      });\n" +
    "  } else {\n" +
    "    return escape(val.toString());\n" +
    "  }\n" +
    "}\n";
  return buf;
};

Pages.prototype.render = function(arg) {
  var func = Pages.cache[this.name];
  return func ? func(arg) : '';
};

function stripBOM(dat) {
  return (dat.charCodeAt(0) === 0xFEFF) ? dat.slice(1) : dat;
}

function resolvePath(str) {
  return (str[0] == path.sep) ? str : path.resolve(str);
}

function joinPath(str1, str2) {
  return str1 + path.sep + str2;
}
