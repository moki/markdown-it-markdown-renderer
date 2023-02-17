import Renderer from 'markdown-it/lib/renderer';
import {MarkdownRenderer} from 'src/renderer';
import Token from 'markdown-it/lib/token';

const link: Renderer.RenderRuleRecord = {
    link_open: function (this: MarkdownRenderer, tokens: Token[], i: number) {
        this.pending.push(tokens[i]);

        return tokens[i].markup === 'autolink' ? '<' : '[';
    },
    link_close: function (this: MarkdownRenderer) {
        const token = this.pending.pop();
        if (token?.type !== 'link_open') {
            throw new Error('failed to render link token');
        }

        if (token.markup === 'autolink') {
            const href = token.attrGet('href');
            if (!href?.length) {
                throw new Error('failed to render autolink token');
            }

            return '>';
        }

        let rendered = '](';

        const href = token.attrGet('href');
        if (href?.length) {
            rendered += href;
        }

        const title = token.attrGet('title');
        if (title?.length) {
            if (href?.length) {
                rendered += ' ';
            }

            const markup = title.indexOf('"') === -1 ? '"' : "'";

            rendered += `${markup}${title}${markup}`;
        }

        rendered += ')';

        return rendered;
    },
};

export {link};
export default {link};
