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

export type Container = {
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

    // constants
    // end of line used by renderer
    protected EOL: string;
    // space used by renderer
    protected SPACE: string;

    // pending tokens stack
    protected pending: Token[];

    // containers
    protected containers: Array<Container>;
    protected lists: Array<Token>;

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

        this.EOL = EOL;
        this.SPACE = SPACE;

        this.pending = [];
        this.containers = new Array<Container>();
        this.lists = new Array<Token>();

        this.setRules({...MarkdownRenderer.defaultRules, ...customRules});
    }

    isBlockquote(blockquote: Container) {
        return blockquote.type === 'blockquote';
    }

    isOrderedList(blockquote: Container) {
        return this.isList(blockquote) && blockquote.listType === 'ordered_list_open';
    }

    isUnorderedList(blockquote: Container) {
        return this.isList(blockquote) && blockquote.listType === 'bullet_list_open';
    }

    isList(blockquote: Container) {
        return blockquote.type === 'list';
    }

    isTail(blockquote: Container, ctx: Token) {
        const [start] = ctx?.map ?? [null];
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

    isFst(blockquote: Container, ctx: Token) {
        const [start] = ctx?.map ?? [null];
        // eslint-disable-next-line eqeqeq, no-eq-null
        if (start == null) {
            const blockquoteStr = JSON.stringify(blockquote);
            const ctxStr = JSON.stringify(ctx);
            throw new Error(
                `failed to render blockquote: ${blockquoteStr} caller: ${ctxStr} doesn't have map`,
            );
        }
        return (
            (blockquote.row === start && !blockquote.rendered) ||
            (!blockquote.rendered && blockquote.type === 'blockquote')
        );
    }

    isListItemClose(token: Token) {
        return token.type === 'list_item_close';
    }

    isBlockquoteClose(token: Token) {
        return token.type === 'blockquote_close';
    }

    isEmpty(blockquote: Container) {
        return blockquote.empty;
    }

    isCode(token: Token) {
        return token.type === 'code_block';
    }

    sameRow(left: Container, right: Container) {
        return left.row === right.row;
    }

    aligned(left: Container, right: Container) {
        // return left.col + left.tspaces + left.markup.length === right.col - right.lspaces;
        return left.col + left.tspaces + left.markup.length >= right.col - right.lspaces;
    }

    // containers methods
    // eslint-disable-next-line complexity
    renderContainer(caller: Token): string {
        let rendered = '';

        if (!caller) {
            throw new Error('provide caller token');
        }

        // console.info('containers:', this.containers, 'caller:', caller);

        if (!this.containers.length) {
            return rendered;
        }

        for (let i = 0; i < this.containers.length; i++) {
            const blockquote = this.containers[i];
            const previous = this.containers[i - 1];
            const {markup, tspaces, order} = blockquote;

            // common behaviour between containers
            // merge left trailling spaces and right leading spaces
            if (i && this.sameRow(previous, blockquote) && this.aligned(previous, blockquote)) {
                const lspaces = Math.max(blockquote.lspaces - previous.tspaces, 0);

                this.containers[i].lspaces = lspaces;
            }

            const lspaces = this.containers[i].lspaces;

            // common behaviour render leading spaces
            rendered += this.SPACE.repeat(lspaces);

            // only one of the handlers should be ran for the container
            // handle empty blockquote
            if (this.isBlockquoteClose(caller) && !blockquote.rendered) {
                rendered += this.EOL;
                rendered += markup;
            }
            // handle empty list item
            else if (this.isListItemClose(caller) && !blockquote.rendered) {
                if (this.isOrderedList(blockquote)) {
                    rendered += this.EOL;
                    rendered += order;
                    rendered += markup;
                } else if (this.isUnorderedList(blockquote)) {
                    rendered += this.EOL;
                    rendered += markup;
                } else {
                    throw new Error('empty list not ordered and not unordered');
                }
            }
            // handle ordered list
            else if (this.isOrderedList(blockquote)) {
                if (this.isFst(blockquote, caller) && !this.isEmpty(blockquote)) {
                    // console.info('ordered fst');

                    let codeIndent = 0;
                    if (this.isCode(caller) && !this.isEmpty(blockquote)) {
                        const codeFstLine = caller.content.split('\n')[0] ?? '';

                        codeIndent = codeFstLine.length - codeFstLine.trim().length;
                    }

                    rendered += order;
                    rendered += markup;
                    rendered += this.SPACE.repeat(tspaces - codeIndent);

                    if (this.isCode(caller) && !this.isEmpty(blockquote)) {
                        // console.info('ordered fst code_block not empty');

                        this.containers[i].tspaces = this.containers[i].tspaces - 4 - codeIndent;
                    }
                } else if (this.isTail(blockquote, caller)) {
                    // console.info('ordered tail');
                    let indentation = 0;

                    const orderLen = `${order}`.length;

                    // indent with spaces of length of the markup and order string
                    // but only in the case of the content going on the new line
                    // after list open
                    if (!this.isEmpty(blockquote)) {
                        indentation += orderLen;
                        indentation += markup.length;
                    }

                    indentation += tspaces;

                    if (this.isCode(caller)) {
                        indentation += 4;
                    }

                    rendered += this.SPACE.repeat(indentation);
                    // first line was empty
                    // render empty open markup new line and indentation
                } else if (this.isEmpty(blockquote) && !blockquote.rendered) {
                    // console.info('ordered empty fst');
                    rendered += order;
                    rendered += markup;
                    rendered += this.EOL;

                    let indentation = 0;

                    indentation += tspaces;

                    rendered += this.SPACE.repeat(indentation);
                } else {
                    throw new Error('ordered list not fst not tail - undefined behaviour');
                }
            }
            // handle unordered list
            else if (this.isUnorderedList(blockquote)) {
                if (this.isFst(blockquote, caller) && !this.isEmpty(blockquote)) {
                    // console.info('unordered fst not empty');
                    rendered += markup;
                    rendered += this.SPACE.repeat(tspaces);
                } else if (this.isTail(blockquote, caller)) {
                    // console.info('unordered tail');
                    let indentation = 0;

                    // indent with spaces of length of the markup
                    // but only in the case of the content going on the new line
                    // after list open
                    if (!this.isEmpty(blockquote)) {
                        indentation += markup.length;
                    }

                    if (this.isCode(caller)) {
                        indentation += 4;
                    }

                    indentation += tspaces;

                    rendered += this.SPACE.repeat(indentation);

                    // first line was empty
                    // render empty open markup new line and indentation
                } else if (this.isEmpty(blockquote) && !blockquote.rendered) {
                    // console.info('empty fst');
                    rendered += markup;
                    rendered += this.EOL;

                    let indentation = 0;

                    indentation += tspaces;

                    rendered += this.SPACE.repeat(indentation);
                } else {
                    throw new Error('unordered list not fst not tail - undefined behaviour');
                }
            }
            // handle blockquote
            else if (this.isBlockquote(blockquote)) {
                if (this.isFst(blockquote, caller)) {
                    // console.info('blockquote fst');
                    rendered += markup;
                    rendered += this.SPACE.repeat(tspaces);
                } else if (this.isTail(blockquote, caller)) {
                    // console.info('blockquote tail');
                    rendered += markup;
                    rendered += this.SPACE.repeat(tspaces);
                    // first line empty blockquote
                } else if (this.isEmpty(blockquote) && !blockquote.rendered) {
                    rendered += markup;
                    rendered += this.EOL;
                } else {
                    throw new Error('blockquote not fast not tail - undefined behaviour');
                }
            }

            // common behaviour between containers
            // mark container as rendered
            this.containers[i].rendered = true;

            // console.info(`blockquote rendered: "${rendered}" length: "${rendered.length}"`);
        }

        // returns result of running one of the handlers
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
