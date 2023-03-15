import MarkdownIt from 'markdown-it';
import {MarkdownRenderer, MarkdownRendererEnv, MarkdownRendererMode} from 'src/renderer';
import {tests} from 'commonmark-spec';

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

const semanticsTests = new Set([
    253, 254, 255, 256, 258, 259, 260, 262, 263, 272, 275, 276, 277, 279, 280, 306, 307, 308, 309,
    312, 314, 315, 316, 317, 319, 325, 326,
]);

const units = tests.filter(({number}) => semanticsTests.has(number));

// omit first and last empty lines
const filterOutEmptyFstLst = (line, i, ls) => (i && i + 1 !== ls.length) || line.trim().length;
const normalizeMD = (str: string) => str.split('\n').filter(filterOutEmptyFstLst).join('\n');

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
