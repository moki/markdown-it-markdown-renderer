import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {MarkdownRenderer} from 'src/renderer';

const hr: Renderer.RenderRuleRecord = {
    hr: function (this: MarkdownRenderer, tokens: Token[], i: number) {
        let rendered = '';

        if (i) {
            rendered += this.EOL;
        }

        rendered += tokens[i].markup;

        return rendered;
    },
};

export {hr};
export default {hr};
