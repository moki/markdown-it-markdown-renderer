import MarkdownIt from 'markdown-it';
import {MarkdownRenderer} from 'src/renderer';

import {fixtures} from './__fixtures__';

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
    fixtures.forEach((entry: SpecEntry) => {
        const {section, example, markdown} = entry;

        const name = `${section} ${example}`;

        test(name, () => {
            const rendered = md.render(markdown);

            // expecting to render "back" into original markdown string
            expect(rendered).toStrictEqual(markdown);

            expect(rendered).toMatchSnapshot();
        });
    });
});
