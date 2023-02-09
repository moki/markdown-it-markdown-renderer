import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

const typeToSyntax = new Map([
    ['em_open', '*'],
    ['em_close', '*'],
    ['strong_open', '**'],
    ['strong_close', '**'],
]);

function basic(tokens: Token[], i: number) {
    return typeToSyntax.get(tokens[i].type) ?? '';
}

const emphasis: Renderer.RenderRuleRecord = {
    em_open: basic,
    em_close: basic,
    strong_open: basic,
    strong_close: basic,
};

export {emphasis};
export default {emphasis};
