import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

const rules = new Set(['em_open', 'em_close', 'strong_open', 'strong_close']);

function basic(tokens: Token[], i: number) {
    const {type, markup} = tokens[i];

    if (rules.has(type)) {
        return markup;
    }

    throw new Error('failed to render emphasis');
}

const emphasis: Renderer.RenderRuleRecord = {
    em_open: basic,
    em_close: basic,
    strong_open: basic,
    strong_close: basic,
};

export {emphasis};
export default {emphasis};
