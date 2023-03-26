import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {MarkdownRenderer, MarkdownRendererEnv} from 'src/renderer';

const heading: Renderer.RenderRuleRecord = {
    heading_open: function (this: MarkdownRenderer, tokens: Token[], i: number) {
        const {markup} = tokens[i];

        let rendered = '';

        if (i) {
            rendered += this.EOL;
        }

        rendered += this.renderContainer(tokens[i]);

        // handle atx headings
        if (!isSetexHeading(tokens[i])) {
            rendered += markup + this.SPACE;

            return rendered;
        }

        this.pending.push(tokens[i]);

        const previous = tokens[i - 1];
        if (previous?.type === 'paragraph_close') {
            rendered += this.EOL;
        }

        return rendered;
    },
    heading_close: function (this: MarkdownRenderer, ...args) {
        const {
            3: {source},
        }: {3: MarkdownRendererEnv} = args;

        // no mappings avaialbe for the heading_open
        // or markdown source wasn't provided via environment
        const open = this.pending.pop();
        if (!open?.map || !source?.length) {
            return '';
        }

        const [_, end] = open.map;

        const markup = source.slice(end - 1, end);

        return this.EOL + markup.pop();
    },
};

function isSetexHeading(token: Token) {
    const {markup} = token;

    return markup.indexOf('=') !== -1 || markup.indexOf('-') !== -1;
}

export {heading};
export default {heading};
