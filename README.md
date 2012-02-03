# node-pages

A simple template engine for Node.js.  
Cacheable and Trackable.  
You can make breakpoints on the debugger.

## Installation

    $ npm install node-pages

## Example
template1.npg

    <? if (arg) { ?>
      <p><?= arg.name ?></p>
    <? } ?>

example.js

    var pages = require('node-pages').newInstance({
      srcPath : '/path/to/template1.npg'
    });

    var arg = {name : 'tasogare'};
    var str = pages.render(arg);

## Custom tags

Custom tags (e.g. &lt;% %&gt; )  

    var pages = require('node-pages').newInstance({
      openWord : '<%',
      closeWord : '%>',
      srcPath : '/path/to/template2.npg'
    });

template2.npg

    <% if (arg) { %>
      <p><%= arg.name %></p>
    <% } %>

## Custom render arg name

Custom render arg name (e.g. it )  

    var pages = require('node-pages').newInstance({
      renderArgName : 'it',
      srcPath : '/path/to/template3.npg'
    });

    var arg = {name : 'tasogare'};
    var str = pages.render(arg);

template3.npg

    <? if (it) { ?>
      <p><?= it.name ?></p>
    <? } ?>


## Html escaped and unescaped

  * Escaped with `<?= val ?>`
  * Unescaped with `<?- val ?>`

## Options

  - `srcPath`         Template file path (absolute path)
  - `openWord`        Open tag. ("<?" is default.)
  - `closeWord`       Close tag. ("?>" is default.)
  - `renderArgName`   Render arg name. ("arg" is default.)
  - `workDir`         Directory of compiled js file. ("node-pages/lib/work" is default.)

## License

The MIT License
