import {Options} from 'markdown-it';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {MarkdownRenderer, MarkdownRendererEnv, Blockquote} from 'src/renderer';

export function consumeBlockquote(line: string, i: number, blockquote: Blockquote) {
    let cursor = i ?? 0;

    const index = line.indexOf(blockquote.markup, cursor);
    if (index === -1) {
        throw new Error('failed to spin');
    }

    cursor = index + 1;

    return cursor;
}

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
            throw new Error('failed to render blockquote');
        }

        const [start] = map;
        if (start === null) {
            throw new Error('failed to render blockquote');
        }

        const [line] = source.slice(start, start + 1);
        if (!line?.length) {
            throw new Error('failed to render blockquote');
        }

        // consume parsed blockquotes constructs from this line
        // const nesting = this.blockquotes.length;

        let j = 0;

        for (const quote of this.blockquotes) {
            if (quote.type === 'list') {
                throw new Error('unimplemented');
            }

            j = consumeBlockquote(line, j, quote);
        }

        const col = line.indexOf(markup, j);
        if (col === -1) {
            throw new Error('failed to render blockquote');
        }

        // scan for the tsapces
        for (j = col + 1; line.charAt(j) === ' ' && j < line.length; j++);

        this.blockquotes.push({
            type: 'blockquote',
            lspaces: 0,
            tspaces: j - col - 1,
            row: start,
            col,
            markup,
            rendered: false,
        });

        this.renderedBlockquote = false;

        // console.info(this.blockquotes);

        // prevent blockquotes from sticking to each other
        return i && tokens[i - 1].type === 'blockquote_close' ? this.EOL : '';
        // return '';

        // find column index of the blockquote markup open syntax
        //
        // we found this.blocksquotes.length blockquotes so far
        // scan line for the next markup open syntax for this token
        // push it on the blockquotes stack with the information about:
        // <row>    - line mapping into original markdown string
        // <col>    - char mapping into original markdown string
        // <tsapces> - amount of indentation after open markup syntax

        /*
        const nesting = this.blockquotes.length;
        const markups = this.blockquotes.map((bq) => bq.markup);
        if (!markups.includes(markup)) {
            markups.push(markup);
        }

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

        // scan for the tsapces
        for (j = j + 1; line.charAt(j) === ' ' && j < line.length; j++);

        const tsapces = j - col - 1;

        this.blockquotes.push({row: start, col, tsapces, markup, rendered: false});

        // remember token that blockquote follows
        // to make decisions about vertical gap rendering later
        if (i) {
            this.pending.push(tokens[i - 1]);
        }

        this.renderedBlockquote = false;

        return '';
        */
    },
    blockquote_close: function (this: MarkdownRenderer, tokens: Token[], i: number) {
        let rendered = '';

        const blockquotesLen = this.blockquotes.length;

        if (blockquotesLen && !this.blockquotes[blockquotesLen - 1].rendered) {
            rendered += this.renderBlockquote(tokens[i]);
        }

        this.blockquotes.pop();

        return rendered;
    },
};

export {blockquote};
export default {blockquote};
