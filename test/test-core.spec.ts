import fs from 'fs';
import path from 'path';
import test from 'ava';
import render from '../src';
import {closingSingleTagEnum, quoteStyleEnum} from '../types/index.d';
import tree from './templates/parser';

const html = fs.readFileSync(path.resolve(__dirname, 'templates/render.html'), 'utf8');

test('{String}', t => {
  const html = render('Hello world!');
  const expected = 'Hello world!';
  t.is(html, expected);
});

test('{Number}', t => {
  const html = render(555);
  const expected = '555';
  t.is(html, expected);
});

test('{Array}', t => {
  const html = render(['Hello world!']);
  const expected = 'Hello world!';
  t.is(html, expected);
});

test('{Tags} {Empty}', t => {
  const html = render({content: ['Test']});
  const expected = '<div>Test</div>';
  t.is(html, expected);
});

test('{Tags} {Boolean} (false) -> {String}', t => {
  t.is(render({tag: false, content: 'Test'}), 'Test');
  t.is(render({tag: false, content: ['Test']}), 'Test');
});

test('{Tags} {Boolean} (false) -> {Number}', t => {
  t.is(render({tag: false, content: 555}), '555');
  t.is(render({tag: false, content: [555]}), '555');
});

test('{Attrs} {Empty}', t => {
  const fixture = {attrs: {alt: ''}};
  const expected = '<div alt=""></div>';

  t.is(render(fixture), expected);
});

test('{Attrs} {Single}', t => {
  const fixture = {
    attrs: {
      id: 'header'
    }
  };
  const expected = '<div id="header"></div>';

  t.is(render(fixture), expected);
});

test('{Attrs} {Multiple}', t => {
  const fixture = {
    attrs: {
      id: 'header',
      style: 'color:red',
      'data-id': 'header'
    }
  };
  const expected = '<div id="header" style="color:red" data-id="header"></div>';

  t.is(render(fixture), expected);
});

test('{Attrs} {Boolean} (true)', t => {
  const fixture = {
    attrs: {
      disabled: true
    }
  };
  const expected = '<div disabled></div>';

  t.is(render(fixture), expected);
});

test('{Attrs} {Boolean} (false)', t => {
  const fixture = {
    attrs: {
      disabled: false
    }
  };
  const expected = '<div></div>';

  t.is(render(fixture), expected);
});

test('{Attrs} {Number}', t => {
  const fixture = {
    attrs: {
      val: 5
    }
  };
  const expected = '<div val="5"></div>';

  t.is(render(fixture), expected);
});

test('{Attrs} {String} (double quotes)', t => {
  const fixture = {
    attrs: {
      onclick: 'alert("hello world")'
    }
  };
  const expected = '<div onclick="alert(&quot;hello world&quot;)"></div>';

  t.is(render(fixture), expected);
});

test('{Content} {String}', t => {
  const fixture = {content: 'Hello world!'};
  const expected = '<div>Hello world!</div>';

  t.is(render(fixture), expected);
});

test('{Content} {Array<String>}', t => {
  const fixture = {content: ['Hello world!']};
  const expected = '<div>Hello world!</div>';

  t.is(render(fixture), expected);
});

test('{Content} {Number}', t => {
  t.is(render({content: 555}), '<div>555</div>');
  t.is(render({content: [555]}), '<div>555</div>');
});

test('{Content} {Array<Number>}', t => {
  t.is(render({content: [555]}), '<div>555</div>');
});

test('{Content} {Array}', t => {
  const fixture = {
    content: [
      [
        555,
        {tag: 'div', content: 666},
        777
      ]
    ]
  };
  const expected = '<div>555<div>666</div>777</div>';

  t.is(render(fixture), expected);
});

test('{Content} {Nested}', t => {
  const fixture = {
    content: [
      {
        content: [
          {
            content: ['Test', {}]
          }
        ]
      }
    ]
  };
  const expected = '<div><div><div>Test<div></div></div></div></div>';

  t.is(render(fixture), expected);
});

test('{Tree} {Empty}', t => {
  t.is(render(), '');
});

test('{Tree} {HTML}', t => {
  t.is(html, render(tree));
});

test('{Tree} {Immutable}', t => {
  const tree = [{
    tag: 'div',
    content: [
      {
        tag: false,
        content: [
          {tag: 'div'},
          {tag: 'span', content: ['Text']}
        ]
      }
    ]
  }];

  const html1 = JSON.stringify(tree);

  render(html1);

  const html2 = JSON.stringify(tree);

  t.is(html1, html2);
});

test('{Options} {singleTag} Defaults', t => {
  const SINGLE_TAGS = [
    'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'
  ];

  t.is(
    render(SINGLE_TAGS.map(tag => ({tag}))),
    SINGLE_TAGS.map(tag => `<${tag}>`).join('')
  );
});

test('{Options} {singleTag} Custom {String}', t => {
  const options = {singleTags: ['rect']};

  const fixture = {tag: 'rect'};
  const expected = '<rect>';

  t.is(render(fixture, options), expected);
});

test('{Options} {singleTag} Custom {RegExp}', t => {
  const options = {singleTags: [/^%.*%$/]};

  const fixture = {tag: '%=title%'};
  const expected = '<%=title%>';

  t.is(render(fixture, options), expected);
});

test('{Options} {singleTag} Attrs', t => {
  const options = {singleTags: ['rect']};

  const fixture = {tag: 'rect', attrs: {id: 'id'}};
  const expected = '<rect id="id">';

  t.is(render(fixture, options), expected);
});

test('{Options} {closingSingleTag} Tag', t => {
  const options = {closingSingleTag: closingSingleTagEnum.Tag};

  const fixture = {tag: 'br'};
  const expected = '<br></br>';

  t.is(render(fixture, options), expected);
});

test('{Options} {closingSingleTag} Slash', t => {
  const options = {closingSingleTag: closingSingleTagEnum.Slash};

  const fixture = {tag: 'br'};
  const expected = '<br />';

  t.is(render(fixture, options), expected);
});

test('{Options} {closingSingleTag} Slash with content', t => {
  const options = {closingSingleTag: closingSingleTagEnum.Slash};

  const fixture = {tag: 'br', content: ['test']};
  const expected = '<br />test';

  t.is(render(fixture, options), expected);
});

test('{Options} {closingSingleTag} Default', t => {
  const fixture = {tag: 'br'};
  const expected = '<br>';

  t.is(render(fixture), expected);
});

test('{Options} {quoteAllAttributes} True', t => {
  const options = {quoteAllAttributes: true};

  const fixture = {tag: 'a', attrs: {href: '/about/me/'}};
  const expected = '<a href="/about/me/"></a>';

  t.is(render(fixture, options), expected);
});

test('{Options} {quoteAllAttributes} False', t => {
  const options = {quoteAllAttributes: false};

  const fixture = {tag: 'a', attrs: {href: '/about/me/'}};
  const expected = '<a href=/about/me/></a>';

  t.is(render(fixture, options), expected);
});

test('{Options} {quoteAllAttributes} Required Space', t => {
  const options = {quoteAllAttributes: false};

  const fixture = {tag: 'p', attrs: {id: 'asd adsasd'}};
  const expected = '<p id="asd adsasd"></p>';

  t.is(render(fixture, options), expected);
});

test('{Options} {quoteAllAttributes} Required Tab', t => {
  const options = {quoteAllAttributes: false};

  const fixture = {tag: 'a', attrs: {href: '/about-\t-characters'}};
  const expected = '<a href="/about-\t-characters"></a>';

  t.is(render(fixture, options), expected);
});

test('{Options} {quoteAllAttributes} Required Empty', t => {
  const options = {quoteAllAttributes: false};

  const fixture = {tag: 'script', attrs: {async: ''}};
  const expected = '<script async></script>';

  t.is(render(fixture, options), expected);
});

test('{Options} {quoteAllAttributes} Closing slash', t => {
  const options = {
    closingSingleTag: closingSingleTagEnum.Slash,
    quoteAllAttributes: false
  };

  // Note that <area href=foobar/> is incorrect as that is parsed as
  // <area href="foobar/">.

  const fixture = {tag: 'area', attrs: {href: 'foobar'}};
  const expected = '<area href=foobar />';

  t.is(render(fixture, options), expected);
});

test('{Options} {replaceQuote} replace quote', t => {
  const options = {replaceQuote: false};

  const fixture = {tag: 'img', attrs: {src: '<?php echo $foo["bar"] ?>'}};
  const expected = '<img src="<?php echo $foo["bar"] ?>">';
  fs.writeFileSync('test.html', render(fixture, options));
  t.is(render(fixture, options), expected);
});

test('{Options} {replaceQuote} replace quote ternary operator', t => {
  const options = {replaceQuote: false};

  const fixture = {tag: 'img', attrs: {src: '<?php echo isset($foo["bar"]) ? $foo["bar"] : ""; ?>'}};
  const expected = '<img src="<?php echo isset($foo["bar"]) ? $foo["bar"] : ""; ?>">';
  fs.writeFileSync('test.html', render(fixture, options));
  t.is(render(fixture, options), expected);
});

test('{Options} {quoteStyle} 1 - single quote', t => {
  const options = {replaceQuote: false, quoteStyle: quoteStyleEnum.Single};

  const fixture = {tag: 'img', attrs: {src: 'https://example.com/example.png', onload: 'testFunc("test")'}};
  const expected = '<img src=\'https://example.com/example.png\' onload=\'testFunc("test")\'>';

  fs.writeFileSync('test.html', render(fixture, options));
  t.is(render(fixture, options), expected);
});

test('{Options} {quoteStyle} 2 - double quote', t => {
  const options = {replaceQuote: false, quoteStyle: quoteStyleEnum.Double};

  const fixture = {tag: 'img', attrs: {src: 'https://example.com/example.png', onload: 'testFunc("test")'}};
  const expected = '<img src="https://example.com/example.png" onload="testFunc("test")">';

  fs.writeFileSync('test.html', render(fixture, options));
  t.is(render(fixture, options), expected);
});

test('{Options} {quoteStyle} 0 - smart quote', t => {
  const options = {replaceQuote: false, quoteStyle: quoteStyleEnum.Smart};

  const fixture = {tag: 'img', attrs: {src: 'https://example.com/example.png', onload: 'testFunc("test")'}};
  const expected = '<img src="https://example.com/example.png" onload=\'testFunc("test")\'>';

  fs.writeFileSync('test.html', render(fixture, options));
  t.is(render(fixture, options), expected);
});
