import {Options} from 'markdown-it';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {MarkdownRenderer, MarkdownRendererEnv} from 'src/renderer';

const blockquote: Renderer.RenderRuleRecord = {
    blockquote_open: function (
        this: MarkdownRenderer,
        tokens: Token[],
        i: number,
        options: Options,
        env: MarkdownRendererEnv,
    ) {
        const {source} = env;
        const {map, markup} = tokens[i];
        if (!source?.length || !map || !markup) {
            throw new Error('failed to render ordered list');
        }

        const [start] = map;
        if (start === null) {
            throw new Error('failed to render ordered list');
        }

        const [line] = source.slice(start, start + 1);
        if (!line?.length) {
            throw new Error('failed to render ordered list');
        }

        // find column index of the blockquote markup open syntax
        //
        // we found this.blocksquotes.length blockquotes so far
        // scan line for the next markup open syntax for this token
        // push it on the blockquotes stack with the information about:
        // <row>    - line mapping into original markdown string
        // <col>    - char mapping into original markdown string
        // <spaces> - amount of indentation after open markup syntax

        const nesting = this.blockquotes.length;

        let found = 0;
        let j;

        // scan for the markup
        for (j = 0; j < line.length; j++) {
            found += line.charAt(j) === markup ? 1 : 0;

            if (found > nesting) {
                break;
            }
        }

        if (j === line.length) {
            throw new Error('failed render blockquote');
        }

        const col = j;

        // scan for the spaces
        for (j = j + 1; line.charAt(j) === ' ' && j < line.length; j++);

        const spaces = j - col - 1;

        this.blockquotes.push({row: start, col, spaces, markup});

        return '';
    },
    blockquote_close: function (this: MarkdownRenderer) {
        const row = Array.from(this.blockquotes.keys()).sort().pop();
        if (row === null || row === undefined) {
            throw new Error('failed render blockquotes row');
        }

        this.blockquotes.pop();

        return '';
    },
};

export {blockquote};
export default {blockquote};
