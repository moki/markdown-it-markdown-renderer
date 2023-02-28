import type Renderer from 'markdown-it/lib/renderer';
import type Token from 'markdown-it/lib/token';

import {MarkdownRenderer} from 'src/renderer';

const html: Renderer.RenderRuleRecord = {
    html_block: function (this: MarkdownRenderer, tokens: Token[], i: number) {
        const {content} = tokens[i];

        let rendered = '';

        // vertical spacing
        if (i) {
            const previous = tokens[i - 1];
            if (
                previous?.type === 'fence' ||
                previous?.type === 'code_block' ||
                previous?.type === 'html_block' ||
                previous?.type === 'paragraph_close'
            ) {
                rendered += this.EOL.repeat(2);
            } else {
                rendered += this.EOL;
            }
        }

        if (content?.length) {
            rendered += content.trimEnd();
        }

        return rendered;
    },
};

export {html};
export default {html};
