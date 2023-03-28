import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';
import {Options} from 'markdown-it';

export type CustomRendererParams<S = {}> = {
    handlers?: CustomRendererHanlders;
    rules?: Renderer.RenderRuleRecord;
    mode?: CustomRendererMode;
    initState?: () => S;
};

export type CustomRendererHanlders = Record<string, Renderer.RenderRule | Renderer.RenderRule[]>;

export enum CustomRendererMode {
    Production,
    Development,
}

class CustomRenderer<State = {}> extends Renderer {
    protected mode: CustomRendererMode;
    protected handlers: Map<string, Renderer.RenderRule[]>;
    protected state: State;

    constructor({
        mode = CustomRendererMode.Production,
        handlers = {},
        rules = {},
        initState = () => ({} as State),
    }: CustomRendererParams<State>) {
        super();

        this.mode = mode;
        this.setRules(rules);

        this.state = initState();
        this.handlers = new Map<string, Renderer.RenderRule[]>();
        this.setHandlers({...handlers});
    }

    setRules(rules: Renderer.RenderRuleRecord) {
        for (const [name, rule] of Object.entries(rules)) {
            if (!rule || !name?.length) {
                continue;
            }

            this.rules[name] = rule.bind(this);
        }
    }

    setHandlers(rules: CustomRendererHanlders) {
        for (const [name, handler] of Object.entries(rules)) {
            if (!handler || !name?.length) {
                continue;
            }

            this.handle(name, handler);
        }
    }

    handle(type: string, handler: Renderer.RenderRule | Renderer.RenderRule[]) {
        const handlers = this.handlers.get(type) ?? [];

        const normalized = (Array.isArray(handler) ? handler : [handler]).map((h) => h.bind(this));

        this.handlers.set(type, [...handlers, ...normalized]);
    }

    render(tokens: Token[], options: Options, env: unknown) {
        let rendered = '';

        let children;
        let type;
        let len;
        let i;

        for (i = 0, len = tokens.length; i < len; i++) {
            type = tokens[i].type;
            children = tokens[i].children;

            if (type === 'inline' && Array.isArray(children)) {
                rendered += this.renderInline(children, options, env);

                continue;
            }

            rendered += this.processToken(tokens, i, options, env);
        }

        return rendered;
    }

    renderInline(tokens: Token[], options: Options, env: unknown) {
        let rendered = '';

        let len;
        let i;

        for (i = 0, len = tokens.length; i < len; i++) {
            rendered += this.processToken(tokens, i, options, env);
        }

        return rendered;
    }

    processToken(tokens: Token[], i: number, options: Options, env: unknown) {
        let rendered = '';

        const type = tokens[i].type;
        const handlers = this.handlers.get(type);
        const rule = this.rules[type];

        if (handlers) {
            for (const handler of handlers) {
                rendered += handler(tokens, i, options, env, this);
            }
        }

        if (rule) {
            rendered += rule(tokens, i, options, env, this);
        } else {
            rendered += this.renderToken(tokens, i, options);
        }

        return rendered;
    }
}

export {CustomRenderer};
export default {CustomRenderer};
