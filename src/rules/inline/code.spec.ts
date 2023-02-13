import {equals} from '../../../__tests__/utils';

import {MarkdownRenderer} from 'src/renderer';
import Token from 'markdown-it/lib/token';

import {code} from 'src/rules/inline/code';

describe('code_inline', () => {
    equals('inline code', '```console.log("text");```');

    it('is named code_inline', () => {
        const handler = code.code_inline;

        expect(handler).toBeTruthy();
    });

    it('return content wrapped in "`" markup for code_inline token', () => {
        const renderer = new MarkdownRenderer();

        let handler = code.code_inline;
        if (!handler) {
            return;
        }

        handler = handler.bind(renderer);

        const markup = '```';
        const content = 'console.log("text");';
        const expected = markup + content + markup;
        const tokens = [{type: 'code_inline', markup, content}];
        const actual = handler(tokens as Token[], 0, {}, {}, renderer);

        expect(actual).toBe(expected);
    });

    it('render content wrapped in "`" markup for code_inline token', () => {
        const renderer = new MarkdownRenderer({customRules: {...code}});

        const markup = '```';
        const content = 'console.log("text");';
        const expected = markup + content + markup;
        const tokens = [{type: 'code_inline', markup, content}];
        const actual = renderer.render(tokens as Token[], {}, {});

        expect(actual).toEqual(expected);
    });
});
