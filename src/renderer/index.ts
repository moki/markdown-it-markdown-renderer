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

export type Blockquote = {
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

        // console.info('blockquotes:', this.blockquotes, 'caller:', caller);

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

        for (let i = 0; i < this.blockquotes.length; i++) {
            const blockquote = this.blockquotes[i];
            let markup = blockquote.markup;

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
                // console.info('list indent inside');
                markup = this.SPACE.repeat(blockquote.markup.length);
            }

            // handle empty list item
            if (caller.type === 'list_item_close') {
                rendered += this.EOL;
            }

            // render lspaces
            rendered += this.SPACE.repeat(blockquote.lspaces);

            // console.info('list indentation:', listIndent, 'inside list:', insideList);

            // if (blockquote.type !== 'list' || !blockquote.rendered) {
            // do not render markup for lists unless it was already rendered or markup
            // is changed to ' ' which is kinda... the same
            if (blockquote.type !== 'list' || !blockquote.rendered || markup === ' ') {
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
                    caller.type === 'code_block' ||
                    (caller.type === 'fence' && !blockquote.rendered && !blockquote.empty));

            const blockSpaceCond = blockquote.type === 'blockquote';

            // console.info('list space cond:', listSpaceCond, 'block space cond', blockSpaceCond);

            if (listSpaceCond || blockSpaceCond) {
                /*
                let rspacing = blockquote.tspaces;

                if (!blockquote.empty && rspacing > 4 && caller.type === 'code_block') {
                    // if (caller.type === 'code_block') {
                    // rspacing -= 4;
                    rspacing -= 4;
                    console.info('rspacing:', rspacing);
                } else {
                    rspacing = 4;
                }
                rendered += this.SPACE.repeat(rspacing);
                */

                let rspace = blockquote.tspaces;

                if (blockquote.empty && caller.type === 'code_block') {
                    rspace = Math.max(0, rspace - 4);
                    // rspace = 0;
                }

                rendered += this.SPACE.repeat(rspace);

                /*
                console.info(
                    'rendering indentation of len:',
                    this.SPACE.repeat(blockquote.tspaces).length,
                );
                */
            }

            if (!listIndent) {
                this.blockquotes[i].rendered = true;
            }
        }

        return rendered;
    }

    /*
    renderBlockquote(caller: Token): string {
        const rendered = '';
        console.log('caller:', caller);
        return rendered;

        if (!caller?.map) {
            throw new Error(`unable to render indentation for: ${caller}`);
        }

        const callerRow = caller.map[0];

        // const markups = this.blockquotes.filter((bq) => bq.row === callerRow);
        for (let i = 0; i < this.blockquotes.length; i++) {
            const markup = this.blockquotes[i];
            console.log('caller', caller);
            console.log('markup', markup);
            console.log('types', typeof callerRow, typeof markup.row);
            if (markup.row === callerRow && !markup.rendered) {
                rendered += this.SPACE.repeat(markup.lspace ?? 0);
                rendered += markup.markup;
                rendered += this.SPACE.repeat(markup.tspaces);
                // } else if (markup.row === callerRow - 1 && !markup.rendered) {
            } else if (
                markup.row === callerRow - 1 &&
                markup.type === 'list' &&
                !markup.rendered &&
                markup.containsLineBreak
            ) {
                rendered += this.SPACE.repeat(markup.lspace ?? 0);
                rendered += markup.markup;

                if (markup.containsLineBreak) {
                    rendered += this.EOL;
                }

                if (caller.type === 'paragraph_open') {
                    rendered += this.SPACE.repeat(markup.tspaces);
                }
            }

            console.info(this.blockquotes);

            this.blockquotes[i].rendered = true;
            this.renderedBlockquote = true;
        }
        if (this.renderedBlockquote) {
            return rendered;
        }

        this.renderedBlockquote = true;

        return rendered;
    }
    */

    /*
    renderBlockquote(caller = ''): string {
        let rendered = '';

        console.log(this.blockquotes, caller);

        const last = this.blockquotes[this.blockquotes.length - 1];
        
        for (const {markup, tspaces, lspaces, containsLineBreak} of this.blockquotes) {

            if (markup === ' ' && caller !== 'paragraph' && caller !== 'heading') {
                continue;
            }

            // const lspaces = lspace ?? 0;
            rendered += this.SPACE.repeat(lspaces ?? 0) + markup;

            if (containsLineBreak && caller !== 'list_close') {
                rendered += this.EOL;
            }

            if (
                caller === 'paragraph' ||
                caller === 'heading' ||
                (markup === '>' && caller === 'code_block')
            ) {
                rendered += this.SPACE.repeat(tspaces);
            }
        }

        if (rendered.length) {
            this.renderedBlockquote = true;
        }

        const last = this.blockquotes[this.blockquotes.length - 1];

        if (last?.type === 'list') {
            const updated = {
                ...last,
                markup: this.SPACE.repeat(last.markup.length),
            };

            this.blockquotes[this.blockquotes.length - 1] = updated;
        }

        return rendered;
    }
    */

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
