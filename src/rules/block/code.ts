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

        let indentation = 0;

        // determine indentation
        const [start, end] = map;
        const {source} = env;
        if (start !== null && end !== null && source) {
            const [first] = source.slice(start, end);

            const spaces = first.length - first.trimStart().length;

            indentation += spaces > 4 ? 4 : spaces;
        } else {
            indentation += 4;
        }

        const contentLines = content.split('\n');

        if (this.containers.length) {
            for (const line of contentLines) {
                if (line.length) {
                    rendered += this.renderContainer(tokens[i]);
                }

                rendered += line;
                rendered += this.EOL;
            }
        } else {
            for (const line of contentLines) {
                if (line.length) {
                    rendered += this.SPACE.repeat(indentation);
                }

                rendered += line;
                rendered += this.EOL;
            }
        }

        rendered = rendered.trimEnd();

        return rendered;
    },
};

export {code};
export default {code};
