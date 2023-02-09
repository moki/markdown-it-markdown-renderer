import {MarkdownRenderer} from 'src/renderer';
import Token from 'markdown-it/lib/token';

import {softbreak} from 'src/rules/inline/softbreak';

describe('softbreak', () => {
    it('is named softbreak', () => {
        const handler = softbreak.softbreak;
        expect(handler).toBeTruthy();
    });

    it('renders newline', () => {
        const renderer = new MarkdownRenderer();

        let handler = softbreak.softbreak;
        if (!handler) {
            return;
        }

        handler = handler.bind(renderer);

        const expected = '\n';

        const actual = handler([{type: 'softbreak'}] as Token[], 0, {}, {}, renderer);

        expect(actual).toBe(expected);
    });
});
