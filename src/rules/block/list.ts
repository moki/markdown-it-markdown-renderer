import {Options} from 'markdown-it';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {consumeBlockquote} from './blockquote';

import {MarkdownRenderer, MarkdownRendererEnv, Blockquote} from 'src/renderer';

export function consumeList(line: string, i: number, blockquote: Blockquote, row: number) {
    let cursor = i;
    // const markup =
    //    row === blockquote.row ? blockquote.markup : ' '.repeat(blockquote.markup.length);

    // console.info('markup is:', markup, 'len:', markup.length);

    // if (row === blockquote.row) {
    //    for (; line.charAt(cursor) === ' ' && cursor < line.length; cursor++);
    // }

    if (row === blockquote.row) {
        cursor = blockquote.col + 1;
        // console.info('last:', blockquote.col);
    }

    // console.info(row, blockquote.row);

    const col = line.indexOf(blockquote.markup, cursor);
    if (col === -1) {
        throw new Error('failed to render list');
    }

    // console.info('current:', col);

    return col;

    /*
    // if (row !== blockquote.row) {
    // if (row === blockquote.row) {
    console.info('found:', col);

    // }

    // scan for the tsapces
    for (cursor = col + 1; line.charAt(cursor) === ' ' && cursor < line.length; cursor++);

    return Math.max(cursor, line.length - 1);
    */
}

const list: Renderer.RenderRuleRecord = {
    // bullet_list_open: bulletListOpenHandler,
    bullet_list_open: listItemOpen,
    // bullet_list_close: bulletListCloseHandler,
    bullet_list_close: listItemClose,
    ordered_list_open: orderedListOpenHandler,
    ordered_list_close: orderedListCloseHandler,
    // list_item_open: listItemOpen,
    list_item_open: bulletListOpenHandler,
    // list_item_close: listItemClose,
    list_item_close: bulletListCloseHandler,
};

// eslint-disable-next-line complexity
function bulletListOpenHandler(
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

    let j = 0;

    for (const quote of this.blockquotes) {
        if (quote.type === 'blockquote') {
            j = consumeBlockquote(line, j, quote);
        } else if (quote.type === 'list') {
            j = consumeList(line, j, quote, start);
            // console.info('spinned up to j:', j);
            // console.info('string:', line, line.length);
        }

        // console.info('blockquote', quote);
    }

    let lspaces = j;

    for (; line.charAt(j) === ' ' && j < line.length; j++);

    //lspaces = lspaces === j ? 0 : j - lspaces;
    lspaces = lspaces === j ? 0 : j - lspaces;

    const col = line.indexOf(markup, j);
    if (col === -1) {
        throw new Error('failed to render list');
    }

    // scan for the tsapces
    for (j = col + 1; line.charAt(j) === ' ' && j < line.length; j++);

    let tspaces = j - col - 1;
    /*
    if (tspaces > 4) {
        tspaces = 4;
    }
    */

    const empty = line.slice(col).trimEnd().endsWith(markup);

    if (empty) {
        let [next] = source.slice(start + 1, start + 2);
        if (!next?.length) {
            next = '';
            // throw new Error('failed to render unordered list');
        }

        for (j = 0; next.charAt(j) === ' ' && j < next.length; j++);

        tspaces = j;

        // console.info('updated spaces:', tspaces);
        // console.info('in line:', next, next.length);
    }

    this.blockquotes.push({
        rendered: false,
        type: 'list',
        row: start,
        col,
        lspaces,
        tspaces,
        markup,
        empty,
    });

    // console.info(this.blockquotes);

    return '';

    /*
    let containsLineBreak = false;

    if (line.trim() === markup) {
        console.log('empty list open line');
        console.log(line);
        const next = source.slice(start + 1, start + 2);
        if (!next?.length) {
            throw new Error('failed to render ordered list');
        }

        line = line.trimEnd() + next;
        containsLineBreak = true;
        console.log('now line is:', line, line.length);
    }

    console.log('parsing list from:', line);

    const blocksBefore = this.blockquotes.filter((bq) => bq.row < start);
    blocksBefore.sort((a, b) => a.row - b.row);
    const last = blocksBefore[blocksBefore.length - 1];
    const indentBefore = last ? last.leadingSpaces + last.markup.length + last.spaces : 0;

    console.log('indentation before:', indentBefore);

    const nesting = this.blockquotes.filter((bq) => bq.row === start);
    // this.blockquotes.length;
    const markups = this.blockquotes.filter((bq) => bq.row === start).map((bq) => bq.markup);
    if (!markups.includes(markup)) {
        markups.push(markup);
    }

    let found = 0;
    let j;

    // console.log(markups);

    for (j = 0; line.charAt(j) === ' ' && j < line.length; j++);

    const leadingSpaces = j;

    for (; j < line.length; j++) {
        if (markups.includes(line.charAt(j))) {
            found++;
        }

        if (found > nesting) {
            break;
        }
    }

    if (j === line.length) {
        throw new Error('failed render list');
    }

    const col = j;

    // scan for spaces
    for (j = j + 1; line.charAt(j) === ' ' && j < line.length; j++);

    let spaces = j - col - 1;
    if (spaces > 4) {
        spaces = 4;
    }

    this.blockquotes.push({
        type: 'list',
        row: start,
        col,
        spaces,
        markup,
        leadingSpaces,
        containsLineBreak,
        rendered: false,
    });

    console.log('after parsin:', this.blockquotes);

    this.renderedBlockquote = false;

    // console.log(current);

    // console.log('line:', line);
    // console.log('markup index:', col);

    return '';
    */
}

function bulletListCloseHandler(
    this: MarkdownRenderer,
    tokens: Token[],
    i: number,
    // options: Options,
    // env: MarkdownRendererEnv,
) {
    let rendered = '';

    const blockquotesLen = this.blockquotes.length;

    if (blockquotesLen && !this.blockquotes[blockquotesLen - 1].rendered) {
        rendered += this.renderBlockquote(tokens[i]);
    }

    this.blockquotes.pop();

    return rendered;
}

function orderedListOpenHandler(
    this: MarkdownRenderer,
    // tokens: Token[],
    // i: number,
    // options: Options,
    // env: MarkdownRendererEnv,
) {
    return '';
}

function orderedListCloseHandler(
    this: MarkdownRenderer,
    // tokens: Token[],
    // i: number,
    // options: Options,
    // env: MarkdownRendererEnv,
) {
    return '';
}

function listItemOpen(
    this: MarkdownRenderer,
    // tokens: Token[],
    // i: number,
    // options: Options,
    // env: MarkdownRendererEnv,
) {
    return '';
}

function listItemClose(
    this: MarkdownRenderer,
    // tokens: Token[],
    // i: number,
    // options: Options,
    // env: MarkdownRendererEnv,
) {
    return '';
}

export {list};
export default {list};
