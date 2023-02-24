import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {MarkdownRenderer} from 'src/renderer';

const paragraph: Renderer.RenderRuleRecord = {
    paragraph_open: function (this: MarkdownRenderer, tokens: Token[], i: number) {
        const current = tokens[i];
        if (!current) {
            throw new Error('failed to rendrer paragraph');
        }

        let rendered = '';

        if (!i) {
            return rendered;
        }

        const previous = tokens[i - 1];
        if (!previous) {
            throw new Error('failed to rendrer paragraph');
        }

        if (!previous.block) {
            return '';
        }

        // vertical blocks separation
        if (previous.type === 'hr') {
            // thematic breaks can interrupt paragraphs
            // therefore empty line between it and paragraphs isn't required
            rendered += this.EOL;
        } else {
            rendered += this.EOL.repeat(2);
        }

        return rendered;
    },
    paragraph_close: function () {
        return '';
    },
};

export {paragraph};
export default {paragraph};