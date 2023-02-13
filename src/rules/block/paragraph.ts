import Renderer from 'markdown-it/lib/renderer';

const paragraph: Renderer.RenderRuleRecord = {
    paragraph_open: function () {
        return '';
    },
    paragraph_close: function () {
        return '\n\n';
    },
};

export {paragraph};
export default {paragraph};
