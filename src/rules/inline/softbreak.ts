import Renderer from 'markdown-it/lib/renderer';

const softbreak: Renderer.RenderRuleRecord = {
    softbreak: function () {
        return '\n';
    },
};

export {softbreak};
export default {softbreak};
