import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {MarkdownRenderer} from 'src/renderer';

const heading: Renderer.RenderRuleRecord = {
    heading_open: function (this: MarkdownRenderer, tokens: Token[], i: number) {
        const {markup} = tokens[i];

        let rendered = '';

        if (i) {
            rendered += this.EOL;
        }

        rendered += markup + this.SPACE;

        return rendered;
    },
    heading_close: function () {
        return '';
    },
};

export {heading};
export default {heading};
