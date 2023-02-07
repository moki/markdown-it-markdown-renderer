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

        const leftCustom = JSON.stringify(renderer.rules.heading_open);
        const rightCustom = JSON.stringify(customRules.heading_open.bind(renderer));

        expect(leftCustom).toEqual(rightCustom);
    });

    it('preserves default rules if not overwritten', () => {
        const customRules = {
            heading_open: function () {
                return '';
            },
        };

        const defaultRules = {
            heading_close: function () {
                return '';
            },
        };

        MarkdownRenderer.defaultRules = defaultRules;

        const renderer = new MarkdownRenderer({customRules});

        const leftCustom = JSON.stringify(renderer.rules.heading_open);
        const rightCustom = JSON.stringify(customRules.heading_open.bind(renderer));
        expect(leftCustom).toEqual(rightCustom);

        const leftOriginal = JSON.stringify(renderer.rules.heading_close);
        const rightOriginal = JSON.stringify(defaultRules.heading_close.bind(renderer));
        expect(leftOriginal).toEqual(rightOriginal);
    });
});

function getAllPropertyNames(obj: {}) {
    const proto = Object.getPrototypeOf(obj);
    const inherited = proto ? getAllPropertyNames(proto) : [];
    return [...new Set(Object.getOwnPropertyNames(obj).concat(inherited))];
}
