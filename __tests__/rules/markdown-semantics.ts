import MarkdownIt from 'markdown-it';
import {MarkdownRenderer, MarkdownRendererEnv, MarkdownRendererMode} from 'src/renderer';
import {tests} from 'commonmark-spec';

import {semantics, CommonMarkSpecEntry} from './__fixtures__';
import {normalizeMD} from '__tests__/__helpers__';

const renderer = new MarkdownRenderer({mode: MarkdownRendererMode.Production});

const md = new MarkdownIt('commonmark', {html: true});

// todo: refactor into new interface
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

const units = tests.filter(({number}) => semantics.has(number));

// todo: remove unnecessary logging
// for now suppress it
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
