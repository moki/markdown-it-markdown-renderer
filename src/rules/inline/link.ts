import Renderer from 'markdown-it/lib/renderer';
import {MarkdownRenderer} from 'src/renderer';
import Token from 'markdown-it/lib/token';

const link: Renderer.RenderRuleRecord = {
    link_open: function (this: MarkdownRenderer, tokens: Token[], i: number) {
        this.context.push(tokens[i]);

        return '[';
    },
    link_close: function (this: MarkdownRenderer) {
        const openToken = this.context.pop();
        if (openToken?.type !== 'link_open') {
            throw new Error('failed to render link token');
        }

        let rendered = '](';

        const href = openToken.attrGet('href');
        if (href?.length) {
            rendered += href;
        }

        let title = openToken.attrGet('title');
        if (title?.length) {
            if (href?.length) {
                rendered += ' ';
            }

            title = title.replace(/"/gmu, "'");

            rendered += `"${title}"`;
        }

        rendered += ')';

        return rendered;
    },
};

export {link};
export default {link};
