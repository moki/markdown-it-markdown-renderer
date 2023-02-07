import Renderer from 'markdown-it/lib/renderer';

export type MarkdownRendererParams = {
    customRules?: Renderer.RenderRuleRecord;
};

class MarkdownRenderer extends Renderer {
    static defaultRules: Renderer.RenderRuleRecord = {};

    constructor(params: MarkdownRendererParams = {}) {
        super();

        const {customRules = {}} = params;

        const rules = Object.assign({}, MarkdownRenderer.defaultRules, customRules);

        for (const [name, handler] of Object.entries(rules)) {
            if (!handler) {
                continue;
            }

            this.rules[name] = handler.bind(this);
        }
    }
}

export {MarkdownRenderer};
export default {MarkdownRenderer};
