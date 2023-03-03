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
    row: number;
    col: number;
    spaces: number;
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
    renderBlockquote(): string {
        let rendered = '';

        for (const {markup, spaces} of this.blockquotes) {
            rendered += markup + this.SPACE.repeat(spaces);
        }

        if (rendered.length) {
            this.renderedBlockquote = true;
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
