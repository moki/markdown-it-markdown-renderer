# markdown-it-markdown-renderer

This is custom [markdown-it](https://github.com/markdown-it/markdown-it) renderer that aims to provide zero diff with **original markdown** in **most cases** and **exact zero diff** in the case of the **html render**.

supporting syntax from the [commonmark specification](https://spec.commonmark.org/)

## Overview

- [rules](src/rules/README.MD)
- [renderer](src/renderer/README.MD)

## Usage

### Overwrite default renderer

`markdown-it` renderer can be overwriten with custom one like this:

```
import MarkdownIt from 'markdown-it';

import {MarkdownRenderer, MarkdownRendererMode} from './src/index';

// create markdown instance
const md = new MarkdownIt('commonmark');

// create instance of our custom renderer
const renderer = new MarkdownRenderer({mode: MarkdownRendererMode.Development});

// overwrite markdown-it default renderer with custom one
md.renderer = renderer;
```

now we can render markdown string back into markdown string with `markdown-it` instance

```
const markdown = '[markdown link](folder/file.md "title")';

md.render(markdown);
```

### Direct application on tokens

use custom `markdown-it` renderer `render` method to render markdown-it `tokens`

```
import MarkdownIt from 'markdown-it';
import {MarkdownRenderer, MarkdownRendererMode} from './src/index';

// create instance of out custom renderer
const renderer = new MarkdownRenderer({mode: MarkdownRendererMode.Development});

// tokens parsed by markdown-it
const tokens = [...];

// directly call render on parsed tokens
const rendered = renderer.render(tokens, {}, {});
```
