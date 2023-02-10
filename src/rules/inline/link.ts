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

        const title = openToken.attrGet('title');
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
