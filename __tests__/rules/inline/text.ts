import {MarkdownRenderer} from 'src/renderer';
import Token from 'markdown-it/lib/token';

import {text} from 'src/rules/inline/text';

describe('text', () => {
    it('is named text', () => {
        const handler = text.text;
        expect(handler).toBeTruthy();
    });

    it('returns given token content', () => {
        const renderer = new MarkdownRenderer();

        let handler = text.text;
        if (!handler) {
            return;
        }

        handler = handler.bind(renderer);

        const expected = 'some text';
        const actual = handler([{type: 'text', content: expected}] as Token[], 0, {}, {}, renderer);

        expect(actual).toBe(expected);
    });

    it('renders given token content', () => {
        const renderer = new MarkdownRenderer({customRules: {...text}});

        const expected = 'some text';
        const tokens = [{type: 'text', content: expected}] as Token[];
        const actual = renderer.render(tokens, {}, {});

        expect(actual).toEqual(expected);
    });
});
