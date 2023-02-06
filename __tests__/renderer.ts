import Renderer from 'markdown-it/lib/renderer';
import {MarkdownRenderer} from 'src/renderer';

describe('MarkdownRenderer', () => {
    it('is instance of the MarkdownIt Renderer', () => {
        const renderer = new MarkdownRenderer();

        expect(renderer instanceof Renderer).toBe(true);
    });

    it('is instance of the Markdown Renderer', () => {
        const renderer = new MarkdownRenderer();

        expect(renderer instanceof MarkdownRenderer).toBe(true);
    });

    it('has base properties of the MarkdownIt Renderer', () => {
        const baseRenderer = new Renderer();
        const renderer = new MarkdownRenderer();

        const baseProps = getAllPropertyNames(baseRenderer);

        const rendererProps = getAllPropertyNames(renderer);

        const result = baseProps
            .map((member: string) => rendererProps.includes(member))
            .reduce((a: boolean, v: boolean) => a && v, true);

        expect(result).toBe(true);
    });

    it('overwrites base rules', () => {
        const customRules = {
            heading_open: function () {
                return '';
            },
        };

        const renderer = new MarkdownRenderer({customRules});

        expect(renderer.rules.heading_open).toEqual(customRules.heading_open);
    });

    it('preserves default rules if not overwritten', () => {
        const defaultRules = {
            heading_close: function () {
                return '';
            },
        };

        MarkdownRenderer.defaultRules = defaultRules;

        const customRules = {
            heading_open: function () {
                return '';
            },
        };

        const renderer = new MarkdownRenderer({customRules});

        expect(renderer.rules.heading_open).toEqual(customRules.heading_open);
        expect(renderer.rules.heading_close).toEqual(defaultRules.heading_close);
    });
});

function getAllPropertyNames(obj: {}) {
    const proto = Object.getPrototypeOf(obj);
    const inherited = proto ? getAllPropertyNames(proto) : [];
    return [...new Set(Object.getOwnPropertyNames(obj).concat(inherited))];
}
