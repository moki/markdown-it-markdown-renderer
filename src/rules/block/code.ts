import {Options} from 'markdown-it';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {MarkdownRenderer, MarkdownRendererEnv} from 'src/renderer';

const separate = new Set(['html_block', 'paragraph_close', 'bullet_list_close']);

const code: Renderer.RenderRuleRecord = {
    code_block: function (
        this: MarkdownRenderer,
        tokens: Token[],
        i: number,
        options: Options,
        env: MarkdownRendererEnv,
    ) {
        const {content, map} = tokens[i];
        if (!map) {
            throw new Error('failed render code block');
        }

        let rendered = '';

        // vertical separation
        if (i) {
            const previous = tokens[i - 1];
            const height = separate.has(previous?.type) ? 2 : 1;
            // previous?.type === 'html_block' ? 2 : 1;

            rendered += this.EOL.repeat(height);
        }

        // rendered += this.renderBlockquote(tokens[i]);

        let indentation = 0;

        // determine indentation
        const [start, end] = map;
        const {source} = env;
        if (start !== null && end !== null && source) {
            const [first] = source.slice(start, end);

            const spaces = first.length - first.trimStart().length;

            // console.info(spaces);

            indentation += spaces > 4 ? 4 : spaces;
            // indentation += spaces;
        } else {
            indentation += 4;
        }

        const contentLines = content.split('\n');

        for (const [j, line] of contentLines.entries()) {
            if (line.length) {
                if (this.blockquotes.length) {
                    // console.info('line:', line, 'len:', line.length, 'indentation:', indentation);
                    rendered += this.renderBlockquote(tokens[i]);
                }
                rendered += this.SPACE.repeat(indentation);
                /*
                if (!this.blockquotes.filter((block) => block.type === 'list').length) {
                }
                */
            }

            rendered += line + this.EOL;

            /*
            let indent = indentation;

            if ((contentLines.length > 2 && i === 0) || i === contentLines.length - 1) {
                const innerIndent = line.length - line.trimStart().length;
                indent = indentation - innerIndent;
            }

            rendered += this.SPACE.repeat(indent);

            if (line.length) {
                if (i && this.blockquotes.length) {
                    rendered += this.renderBlockquote(tokens[i]);
                }
            }

            rendered += line + this.EOL;
            */
        }

        rendered = rendered.trimEnd();

        return rendered;
    },
};

export {code};
export default {code};
