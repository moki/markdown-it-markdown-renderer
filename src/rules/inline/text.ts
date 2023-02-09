import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

const text: Renderer.RenderRuleRecord = {
    text: function (tokens: Token[], i: number) {
        return tokens[i].content;
    },
};

export {text};
export default {text};
