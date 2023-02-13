import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

const code: Renderer.RenderRuleRecord = {
    code_inline: function (tokens: Token[], i: number) {
        const {markup, content} = tokens[i];

        return markup + content + markup;
    },
};

export {code};
export default {code};
