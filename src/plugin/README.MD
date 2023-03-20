# Markdown IT Plugin

preferred usage way

configure your markdown-it parser instance to use **markdown renderer** instead of the **default(HTML)** one

```
import MarkdownIt from 'markdown-it';

import {MarkdownRendererEnv} from 'src/renderer';
import {mdRenderer} from 'src/plugin';

const md = new MarkdownIt('commonmark', {html: true});

md.use(mdRenderer);

const markdown = '# Title\nparagraph goes **here**\n- list item one\n- list item two\n';

const env: MarkdownRendererEnv = {source: markdown.split('\n')};

const rendered = md.render(markdown, env);
```
