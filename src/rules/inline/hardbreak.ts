import Renderer from 'markdown-it/lib/renderer';

const hardbreak: Renderer.RenderRuleRecord = {
    hardbreak: function () {
        return '\\\n';
    },
};

export {hardbreak};
export default {hardbreak};
