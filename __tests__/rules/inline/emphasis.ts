import {MarkdownRenderer} from 'src/renderer';
import Token from 'markdown-it/lib/token';

import {emphasis} from 'src/rules/inline/emphasis';

describe('em_open', () => {
    it('is named em_open', () => {
        const handler = emphasis.em_open;

        expect(handler).toBeTruthy();
    });

    it('return * for em_open token', () => {
        const renderer = new MarkdownRenderer();

        let handler = emphasis.em_open;
        if (!handler) {
            return;
        }

        handler = handler.bind(renderer);

        const expected = '*';
        const tokens = [{type: 'em_open'}];
        const actual = handler(tokens as Token[], 0, {}, {}, renderer);

        expect(actual).toBe(expected);
    });

    it('render em_open token as *', () => {
        const renderer = new MarkdownRenderer({customRules: {...emphasis}});

        const expected = '*';
        const tokens = [{type: 'em_open'}] as Token[];
        const actual = renderer.render(tokens, {}, {});

        expect(actual).toEqual(expected);
    });
});

describe('em_close', () => {
    it('is named em_close', () => {
        const handler = emphasis.em_close;

        expect(handler).toBeTruthy();
    });

    it('return * for em_close token', () => {
        const renderer = new MarkdownRenderer();

        let handler = emphasis.em_close;
        if (!handler) {
            return;
        }

        handler = handler.bind(renderer);

        const expected = '*';
        const tokens = [{type: 'em_close'}];
        const actual = handler(tokens as Token[], 0, {}, {}, renderer);

        expect(actual).toBe(expected);
    });

    it('render em_close token as *', () => {
        const renderer = new MarkdownRenderer({customRules: {...emphasis}});

        const expected = '*';
        const tokens = [{type: 'em_close'}] as Token[];
        const actual = renderer.render(tokens, {}, {});

        expect(actual).toEqual(expected);
    });
});

describe('strong_open', () => {
    it('is named strong_open', () => {
        const handler = emphasis.strong_open;

        expect(handler).toBeTruthy();
    });

    it('return ** for strong_open token', () => {
        const renderer = new MarkdownRenderer();

        let handler = emphasis.strong_open;
        if (!handler) {
            return;
        }

        handler = handler.bind(renderer);

        const expected = '**';
        const tokens = [{type: 'strong_open'}];
        const actual = handler(tokens as Token[], 0, {}, {}, renderer);

        expect(actual).toBe(expected);
    });

    it('render strong_open token as **', () => {
        const renderer = new MarkdownRenderer({customRules: {...emphasis}});

        const expected = '**';
        const tokens = [{type: 'strong_open'}] as Token[];
        const actual = renderer.render(tokens, {}, {});

        expect(actual).toEqual(expected);
    });
});

describe('strong_close', () => {
    it('is named strong_close', () => {
        const handler = emphasis.strong_close;

        expect(handler).toBeTruthy();
    });

    it('return ** for strong_close token', () => {
        const renderer = new MarkdownRenderer();

        let handler = emphasis.strong_close;
        if (!handler) {
            return;
        }

        handler = handler.bind(renderer);

        const expected = '**';
        const tokens = [{type: 'strong_close'}];
        const actual = handler(tokens as Token[], 0, {}, {}, renderer);

        expect(actual).toBe(expected);
    });

    it('render strong_close token as **', () => {
        const renderer = new MarkdownRenderer({customRules: {...emphasis}});

        const expected = '**';
        const tokens = [{type: 'strong_close'}] as Token[];
        const actual = renderer.render(tokens, {}, {});

        expect(actual).toEqual(expected);
    });
});
