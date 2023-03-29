import {MarkdownRenderer} from 'src/renderer';
import Token from 'markdown-it/lib/token';

import {hardbreak} from 'src/rules/inline/hardbreak';

describe('hardbreak', () => {
    it('is named hardbreak', () => {
        const handler = hardbreak.hardbreak;
        expect(handler).toBeTruthy();
    });

    it('returns backslash followed by new line', () => {
        const renderer = new MarkdownRenderer();

        let handler = hardbreak.hardbreak;
        if (!handler) {
            return;
        }

        handler = handler.bind(renderer);

        const expected = '\\\n';
        const actual = handler([{type: 'hardbreak'}] as Token[], 0, {}, {}, renderer);

        expect(actual).toBe(expected);
    });

    it('renders backslash followed by newline', () => {
        const renderer = new MarkdownRenderer({rules: {...hardbreak}});

        const tokens = [{type: 'hardbreak'}] as Token[];
        const actual = renderer.render(tokens, {}, {});
        const expected = '\\\n';

        expect(actual).toEqual(expected);
    });
});
