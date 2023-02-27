import {Options} from 'markdown-it';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {MarkdownRenderer, MarkdownRendererEnv} from 'src/renderer';

const code: Renderer.RenderRuleRecord = {
    code_block: function (
        this: MarkdownRenderer,
        tokens: Token[],
        i: number,
        options: Options,
        env: MarkdownRendererEnv,
    ) {
        const token = tokens[i];

        let rendered = '';

        // vertical separation
        if (i) {
            rendered += this.EOL;
        }

        let indentation = 0;

        // determine indentation
        const [start, end] = token.map ?? [];
        const {source} = env;
        if (start && end && source) {
            const [first] = source.slice(start, end);

            const [spaces] = first.match(/(^\s+)/mu) ?? [''];

            indentation += spaces.length;
        } else {
            indentation += 4;
        }

        const contentLines = token.content.split('\n');

        let content = '';

        for (const line of contentLines) {
            if (line.length) {
                content += this.SPACE.repeat(indentation);
            }

            content += line;

            content += this.EOL;
        }

        content = content.replace(/(\s*$)/gu, '');

        rendered += content;

        return rendered;
    },
};

export {code};
export default {code};
