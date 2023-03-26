import {Options} from 'markdown-it';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {MarkdownRenderer, MarkdownRendererEnv, Container} from 'src/renderer';

import {consumeList} from './list';

export function consumeBlockquote(line: string, i: number, blockquote: Container) {
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

        // consume parsed containers constructs from this line
        // const nesting = this.containers.length;

        let j = 0;

        for (const quote of this.containers) {
            if (quote.type === 'list' && quote.row === start) {
                j = consumeList(line, j, quote);

                continue;
            }

            if (quote.type === 'blockquote' && quote.row === start) {
                j = consumeBlockquote(line, j, quote);
            }
        }

        if (this.containers.length === 1) {
            j = 0;
        }

        const col = line.indexOf(markup, j);
        if (col === -1) {
            throw new Error('failed to render blockquote');
        }

        // scan for the tsapces
        for (j = col + 1; line.charAt(j) === ' ' && j < line.length; j++);

        this.containers.push({
            type: 'blockquote',
            lspaces: 0,
            tspaces: j - col - 1,
            row: start,
            col,
            markup,
            rendered: false,
        });

        // prevent containers from sticking to each other
        return i && tokens[i - 1].type === 'blockquote_close' ? this.EOL : '';
    },
    blockquote_close: function (this: MarkdownRenderer, tokens: Token[], i: number) {
        let rendered = '';

        const containersLen = this.containers.length;

        if (containersLen && !this.containers[containersLen - 1].rendered) {
            rendered += this.renderContainer(tokens[i]);
        }

        this.containers.pop();

        return rendered;
    },
};

export {blockquote};
export default {blockquote};
