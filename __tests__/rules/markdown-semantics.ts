import MarkdownIt from 'markdown-it';
import {MarkdownRenderer, MarkdownRendererEnv, MarkdownRendererMode} from 'src/renderer';
import {tests} from 'commonmark-spec';

import {semanticsTests} from './markdown-zero-diff';

import {CommonMarkSpecEntry} from './__fixtures__';

const renderer = new MarkdownRenderer({mode: MarkdownRendererMode.Production});

const md = new MarkdownIt('commonmark', {html: true});

// helpers
// always evaluate to provided value <v>
const always = (v: boolean) => () => v;
// always return input value <a> as a result
const id = (a: string) => a;

// modify markdown-it parser behaviour
// disable escape rule
md.inline.ruler.at('escape', always(false));
// disable entity rule
md.inline.ruler.at('entity', always(false));
// disable links normalization
md.normalizeLink = id;

// @ts-ignore
md.renderer = renderer;

const units = tests.filter(({number}) => semanticsTests.has(number));

const filterOutEmptyFstLst = (line, i, ls) => (i && i + 1 !== ls.length) || line.trim().length;
const normalizeMD = (str: string) => str.split('\n').filter(filterOutEmptyFstLst).join('\n');

console.log = (a) => a;
console.info = (a) => a;

describe('markdown semantics', () => {
    units.forEach((entry: CommonMarkSpecEntry) => {
        const {section, number, markdown} = entry;

        const name = `${section} ${number}`;

        test(name, () => {
            // passing array of original markdown string split by new lines
            const env: MarkdownRendererEnv = {source: markdown.split('\n')};
            const rendered = md.render(markdown, env);

            const actual = normalizeMD(rendered);

            expect(actual).toMatchSnapshot();
        });
    });
});
