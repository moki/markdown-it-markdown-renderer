import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {MarkdownRenderer} from 'src/renderer';

const interrupters = new Set(['hr', 'heading_close', 'code_block', 'fence']);

const separate = new Set([
    'paragraph_close',
    'bullet_list_close',
    'ordered_list_close',
    'html_block',
]);

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

        // receive previous token
        // in case of being inside blockquote we want to examine
        // token that comes right before blockquote_open token
        let previous = tokens[i - 1];
        if (this.blockquotes.length && this.pending.length) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            previous = this.pending.pop()!;
        }
        if (!previous) {
            throw new Error('failed to rendrer paragraphi');
        }
        if (!previous.block) {
            return '';
        }

        // vertical gap rendering
        if (interrupters.has(previous.type)) {
            rendered += this.EOL;
        } else {
            if (previous.type === 'blockquote_close') {
                rendered += this.EOL;
            }

            let prevDepth = previous.attrGet('blockquotesDepth');
            if (!prevDepth) {
                prevDepth = String('0');
            }

            const parsedPrevDepth = parseInt(prevDepth, 10);
            const currentDepth = this.blockquotes.length;

            if (parsedPrevDepth === currentDepth || separate.has(previous.type)) {
                rendered += this.EOL;
                rendered += this.renderBlockquote(current);
            }
            rendered += this.EOL;
        }

        rendered += this.renderBlockquote(current);

        return rendered;
    },
    paragraph_close: function (this: MarkdownRenderer, tokens: Token[], i: number) {
        // mark paragraph with its blockquotes depth
        if (this.blockquotes.length) {
            tokens[i].attrSet('blockquotesDepth', String(this.blockquotes.length));
        }

        return '';
    },
};

export {paragraph};
export default {paragraph};
