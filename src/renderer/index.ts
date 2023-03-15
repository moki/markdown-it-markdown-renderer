import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';
import {Options} from 'markdown-it';

import {NEW_LINE, ONE_SPACE} from './constants';

import {inline} from 'src/rules/inline';
import {block} from 'src/rules/block';

export type MarkdownRendererParams = {
    customRules?: Renderer.RenderRuleRecord;
    mode?: MarkdownRendererMode;
    constants?: {
        EOL?: string;
        SPACE?: string;
    };
};

export enum MarkdownRendererMode {
    Production,
    Development,
}

// Renderer Environment
// passed to every rule handling tokens render
export type MarkdownRendererEnv = {
    // array of original markdown string split by new lines
    // some rules are using it to achive more accurate rendering
    source?: string[];
};

export type ListType = 'ordered_list_open' | 'bullet_list_open';

export const isListType = (tokenType: any): tokenType is ListType =>
    tokenType === 'ordered_list_open' || tokenType === 'bullet_list_open';

export type Blockquote = {
    listType?: ListType;
    order?: number;
    lspaces: number;
    tspaces: number;
    empty?: boolean;
    rendered: boolean;
    type?: 'list' | 'blockquote';
    row: number;
    col: number;
    markup: string;
};

class MarkdownRenderer extends Renderer {
    static defaultRules: Renderer.RenderRuleRecord = {...inline, ...block};

    static ruleWithDebug(name: string, handler: Renderer.RenderRule) {
        const modeMsg = (argsStr: string) =>
            `${this.constructor.name}: rule <${name}> called with args <${argsStr}>`;

        return function (
            this: MarkdownRenderer,
            ...args: [Token[], number, Options, unknown, Renderer]
        ) {
            if (this.mode === MarkdownRendererMode.Development) {
                console.debug(modeMsg(JSON.stringify(args)));
            }

            return handler.apply(this, args);
        };
    }

    // render pending tokens stack
    protected pending: Token[];

    // constants
    // end of line used by renderer
    protected EOL: string;
    // space used by renderer
    protected SPACE: string;
    // blockquotes
    protected blockquotes: Array<Blockquote>;
    protected lists: Array<Token>;
    // flag to detect if we rendered blockquote markup
    // before finding blockquote_close
    protected renderedBlockquote: boolean;

    // renderer mode
    private mode: MarkdownRendererMode;

    constructor(params: MarkdownRendererParams = {}) {
        super();

        const {
            customRules = {},
            mode = MarkdownRendererMode.Production,
            constants: {EOL = NEW_LINE, SPACE = ONE_SPACE} = {},
        } = params;

        this.mode = mode;
        if (this.mode === MarkdownRendererMode.Development) {
            console.debug(`${this.constructor.name}: instantiated in the debug mode`);
        }

        this.pending = [];

        this.EOL = EOL;
        this.SPACE = SPACE;

        // blockquotes state
        this.blockquotes = new Array<Blockquote>();
        this.renderedBlockquote = false;
        this.lists = new Array<Token>();

        this.setRules({...MarkdownRenderer.defaultRules, ...customRules});
    }

    // blockquotes methods
    // eslint-disable-next-line complexity
    renderBlockquote(caller: Token): string {
        let rendered = '';

        if (!caller) {
            throw new Error('provide caller token');
        }

        const [callerStart] = caller.map ?? [null, null];

        console.info('blockquotes:', this.blockquotes, 'caller:', caller);

        if (!this.blockquotes.length) {
            return rendered;
        }

        let lastListIdx = -1;
        let lastList;

        // find last list
        // ; i ; -> i>=0
        // for (let i = this.blockquotes.length - 1; i >= 0; i--) {
        for (let i = this.blockquotes.length - 1; i >= 0; i--) {
            if (this.blockquotes[i].type === 'list') {
                lastListIdx = i;
                lastList = this.blockquotes[i];

                break;
            }
        }

        // count lists nesting
        const listsCount = this.blockquotes.filter(
            (blockquote) => blockquote.type === 'list',
        ).length;

        // console.info(
        //    'last list:',
        //    lastList,
        //    'last list index:',
        //    lastListIdx,
        //    'lists count:',
        //    listsCount,
        // );

        function isBlockquote(blockquote: Blockquote) {
            return blockquote.type === 'blockquote';
        }

        function isOrderedList(blockquote: Blockquote) {
            return isList(blockquote) && blockquote.listType === 'ordered_list_open';
        }

        function isUnorderedList(blockquote: Blockquote) {
            return isList(blockquote) && blockquote.listType === 'bullet_list_open';
        }

        function isList(blockquote: Blockquote) {
            return blockquote.type === 'list';
        }

        function isTail(blockquote: Blockquote, ctx: Token) {
            const [start] = caller?.map ?? [null];
            // eslint-disable-next-line eqeqeq, no-eq-null
            if (start == null) {
                const blockquoteStr = JSON.stringify(blockquote);
                const ctxStr = JSON.stringify(ctx);
                throw new Error(
                    `failed to render blockquote: ${blockquoteStr} caller: ${ctxStr} doesn't have map`,
                );
            }

            // >= instead of > because we can open markup on the same line as list
            // as an example with ``` and then span inside the list with fences content
            return start >= blockquote.row && blockquote.rendered;
        }

        function isFst(blockquote: Blockquote, ctx: Token) {
            const [start] = caller?.map ?? [null];
            // eslint-disable-next-line eqeqeq, no-eq-null
            if (start == null) {
                const blockquoteStr = JSON.stringify(blockquote);
                const ctxStr = JSON.stringify(ctx);
                throw new Error(
                    `failed to render blockquote: ${blockquoteStr} caller: ${ctxStr} doesn't have map`,
                );
            }
            return blockquote.row === start && !blockquote.rendered;
        }

        function isListItemClose(token: Token) {
            return token.type === 'list_item_close';
        }
        function isBlockquoteClose(token: Token) {
            return token.type === 'blockquote_close';
        }

        function isEmpty(blockquote: Blockquote) {
            return blockquote.empty;
        }

        function isCode(token: Token) {
            return token.type === 'code_block';
        }

        function sameRow(left: Blockquote, right: Blockquote) {
            return left.row === right.row;
        }

        function aligned(left: Blockquote, right: Blockquote) {
            return left.col + left.tspaces + left.markup.length === right.col - right.lspaces;
        }

        // function

        for (let i = 0; i < this.blockquotes.length; i++) {
            const blockquote = this.blockquotes[i];
            const previous = this.blockquotes[i - 1];
            const {markup, tspaces, order} = blockquote;

            if (i && sameRow(previous, blockquote) && aligned(previous, blockquote)) {
                const lspaces = Math.max(blockquote.lspaces - previous.tspaces, 0);

                this.blockquotes[i].lspaces = lspaces;

                // const _lspaces = (this.blockquotes[i].lspaces -= previous.tspaces);
                console.info(lspaces);
            }

            const lspaces = this.blockquotes[i].lspaces;

            rendered += this.SPACE.repeat(lspaces);

            // empty blockquote
            if (isBlockquoteClose(caller) && !blockquote.rendered) {
                rendered += this.EOL;
                rendered += markup;
            }
            // empty list item
            else if (isListItemClose(caller) && !blockquote.rendered) {
                if (isOrderedList(blockquote)) {
                    rendered += this.EOL;
                    rendered += order;
                    rendered += markup;
                } else if (isUnorderedList(blockquote)) {
                    rendered += this.EOL;
                    rendered += markup;
                } else {
                    throw new Error('empty list not ordered and not unordered');
                }
            } else if (isOrderedList(blockquote)) {
                if (isFst(blockquote, caller) && !isEmpty(blockquote)) {
                    console.info('ordered fst');

                    let codeIndent = 0;
                    if (isCode(caller) && !isEmpty(blockquote)) {
                        const codeFstLine = caller.content.split('\n')[0] ?? '';

                        codeIndent = codeFstLine.length - codeFstLine.trim().length;
                    }

                    rendered += order;
                    rendered += markup;
                    rendered += this.SPACE.repeat(tspaces - codeIndent);

                    if (isCode(caller) && !isEmpty(blockquote)) {
                        console.info('ordered fst code_block not empty');

                        this.blockquotes[i].tspaces = this.blockquotes[i].tspaces - 4 - codeIndent;
                    }
                } else if (isTail(blockquote, caller)) {
                    console.info('ordered tail');
                    let indentation = 0;

                    const orderLen = `${order}`.length;

                    // indent with spaces of length of the markup and order string
                    // but only in the case of the content going on the new line
                    // after list open
                    if (!isEmpty(blockquote)) {
                        indentation += orderLen;
                        indentation += markup.length;
                    }

                    indentation += tspaces;

                    if (isCode(caller)) {
                        indentation += 4;
                    }

                    rendered += this.SPACE.repeat(indentation);
                    // first line was empty
                    // render empty open markup new line and indentation
                } else if (isEmpty(blockquote) && !blockquote.rendered) {
                    console.info('ordered empty fst');
                    rendered += order;
                    rendered += markup;
                    rendered += this.EOL;

                    let indentation = 0;

                    indentation += tspaces;

                    rendered += this.SPACE.repeat(indentation);
                } else {
                    throw new Error('ordered list not fst not tail - undefined behaviour');
                }
            } else if (isUnorderedList(blockquote)) {
                if (isFst(blockquote, caller) && !isEmpty(blockquote)) {
                    console.info('unordered fst not empty');
                    rendered += markup;
                    rendered += this.SPACE.repeat(tspaces);
                } else if (isTail(blockquote, caller)) {
                    console.info('unordered tail');
                    let indentation = 0;

                    // indent with spaces of length of the markup
                    // but only in the case of the content going on the new line
                    // after list open
                    if (!isEmpty(blockquote)) {
                        indentation += markup.length;
                    }

                    if (isCode(caller)) {
                        indentation += 4;
                    }

                    indentation += tspaces;

                    rendered += this.SPACE.repeat(indentation);

                    // first line was empty
                    // render empty open markup new line and indentation
                } else if (isEmpty(blockquote) && !blockquote.rendered) {
                    console.info('empty fst');
                    rendered += markup;
                    rendered += this.EOL;

                    let indentation = 0;

                    indentation += tspaces;

                    rendered += this.SPACE.repeat(indentation);
                } else {
                    throw new Error('unordered list not fst not tail - undefined behaviour');
                }
            } else if (isBlockquote(blockquote)) {
                if (isFst(blockquote, caller)) {
                    console.info('blockquote fst');
                    rendered += markup;
                    rendered += this.SPACE.repeat(tspaces);
                } else if (isTail(blockquote, caller)) {
                    console.info('blockquote tail');
                    rendered += markup;
                    rendered += this.SPACE.repeat(tspaces);
                    // first line empty blockquote
                } else if (isEmpty(blockquote) && !blockquote.rendered) {
                    rendered += markup;
                    rendered += this.EOL;
                } else {
                    throw new Error('blockquote not fast not tail - undefined behaviour');
                }
            }

            this.blockquotes[i].rendered = true;

            console.info(`blockquote rendered: "${rendered}" length: "${rendered.length}"`);

            /*
            // if not the last list (should be not last list in line)
            // render list indentation
            const listIndent =
                blockquote.type === 'list' &&
                listsCount > 1 &&
                i !== lastListIdx &&
                lastList &&
                lastList.row !== blockquote.row;

            if (listIndent) {
                markup = this.SPACE.repeat(blockquote.markup.length);
            }

            // inside list item, replace markup with space indentation
            const insideList =
                blockquote.type === 'list' &&
                callerStart !== null &&
                callerStart > blockquote.row &&
                !blockquote.empty;
            //&& caller.type !== 'code_block';

            if (insideList) {
                markup = this.SPACE.repeat(blockquote.markup.length);
            }

            // handle empty list item
            if (caller.type === 'list_item_close') {
                rendered += this.EOL;
            }

            // render lspaces
            rendered += this.SPACE.repeat(blockquote.lspaces);

            console.info('list indentation:', listIndent, 'inside list:', insideList);

            // in case of the ordered list first line
            // render list item order i.e. digits
            const orderedListDigits =
                blockquote.type === 'list' &&
                !blockquote.rendered &&
                blockquote.listType === 'ordered_list_open';
            if (orderedListDigits) {
                rendered += blockquote.order;
            }

            console.info('ordered list render digits:', orderedListDigits);

            // if (blockquote.type !== 'list' || !blockquote.rendered) {
            // do not render markup for lists unless it was already rendered or markup
            // is changed to ' ' which is kinda... the same
            if (
                blockquote.type !== 'list' ||
                !blockquote.rendered ||
                (markup === ' ' && caller.type !== 'fence')
            ) {
                // console.info('render markup', markup, markup.length);

                rendered += markup;
            }

            if (blockquote.empty && !blockquote.rendered && caller.type !== 'list_item_close') {
                rendered += this.EOL;
            }

            const listSpaceCond =
                blockquote.type === 'list' &&
                (caller.type === 'paragraph_open' ||
                    caller.type === 'heading_open' ||
                    (caller.type === 'code_block' && blockquote.rendered) ||
                    (caller.type === 'fence' && !blockquote.rendered && !blockquote.empty));

            const blockSpaceCond = blockquote.type === 'blockquote';

            console.info('list space cond:', listSpaceCond, 'block space cond', blockSpaceCond);

            if (listSpaceCond || blockSpaceCond) {
                // in case of being inside ordered list item
                // render additional indentation of length of the order
                // digits amount
                const orderedListIndent =
                    blockquote?.listType === 'ordered_list_open' && blockquote.rendered;
                if (orderedListIndent) {
                    console.info('rendering additional space', `${blockquote.order}`.length);
                    rspace += `${blockquote.order}`.length;
                }

                console.info('ordered list additional space:', orderedListIndent);

                if (blockquote.empty && caller.type === 'code_block') {
                    rspace = Math.max(0, rspace - 4);
                }

                rendered += this.SPACE.repeat(rspace);
            }

            if (!listIndent) {
                this.blockquotes[i].rendered = true;
            }
            */
        }

        return rendered;
    }

    setRules(rules: Renderer.RenderRuleRecord) {
        const setMsg = (name: string, fnStr: string) =>
            `${this.constructor.name}: could not set rule <${name}> with handler <${fnStr}>`;

        // eslint-disable-next-line prefer-const
        for (let [name, handler] of Object.entries(rules)) {
            if (!handler || !name?.length) {
                console.debug(setMsg(name, JSON.stringify(handler)));

                continue;
            }

            if (this.mode === MarkdownRendererMode.Development) {
                handler = MarkdownRenderer.ruleWithDebug(name, handler);
            }

            this.rules[name] = handler.bind(this);
        }
    }
}

export {MarkdownRenderer};
export default {MarkdownRenderer};
