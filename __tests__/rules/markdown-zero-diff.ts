import MarkdownIt from 'markdown-it';
import {MarkdownRenderer} from 'src/renderer';
import {tests} from 'commonmark-spec';

import {CommonMarkSpecEntry} from './__fixtures__';

// paragraph mock
// test cases are inline, we are not concerned with block content here
const paragraph = {
    paragraph_open: () => '',
    paragraph_close: () => '',
};

const renderer = new MarkdownRenderer({customRules: {...paragraph}});

const md = new MarkdownIt('commonmark');

// @ts-ignore
md.renderer = renderer;

describe('markdown zero diff', () => {
    tests.forEach((entry: CommonMarkSpecEntry) => {
        const {section, number, markdown} = entry;

        const name = `${section} ${number}`;

        test(name, () => {
            const rendered = md.render(markdown);

            expect(rendered).toStrictEqual(markdown);
        });
    });
});
