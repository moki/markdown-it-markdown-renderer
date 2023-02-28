import {Options} from 'markdown-it';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {MarkdownRenderer, MarkdownRendererEnv} from 'src/renderer';

const fence: Renderer.RenderRuleRecord = {
    fence: fenceHandler,
};

function fenceHandler(
    this: MarkdownRenderer,
    tokens: Token[],
    i: number,
    options: Options,
    env: MarkdownRendererEnv,
) {
    const token = tokens[i];

    let rendered = '';

    if (i) {
        rendered += this.EOL;
    }

    const [start, end] = token.map ?? [];
    const {source} = env;
    if (start !== null && end !== null && end > start && source?.length) {
        const fenceLines = source.slice(start, end);

        rendered += fenceLines[0];

        // one line fence without close tag
        // therefore just render open line
        if (end - start === 1) {
            return rendered;
        }

        rendered += this.EOL;

        // render content
        // (everything but last line)
        if (token.content?.length) {
            const left = 1;
            const right = fenceLines.length > 2 ? fenceLines.length - 1 : fenceLines.length;
            const originalContent = fenceLines.slice(left, right);

            rendered += originalContent.join('\n');
            rendered += this.EOL;
        }

        // close markup is at least of open markup length
        const parsedFirstLine = parseFence(fenceLines[0]);
        const parsedLastLine = parseFence(fenceLines[fenceLines.length - 1]);
        const validCloseMarkupLen =
            parsedLastLine?.markup?.length >= parsedFirstLine?.markup?.length;

        // fence isn't closed
        const contentLines = token.content.split('\n').filter(Boolean);
        const noCloseMarkup =
            contentLines[contentLines.length - 1] === fenceLines[fenceLines.length - 1];

        // render close markup or last content line
        if (validCloseMarkupLen || noCloseMarkup) {
            rendered += fenceLines[fenceLines.length - 1];
        }
    }

    return rendered;
}

function parseFence(str: string) {
    let i;

    // parse indentation
    let indentation = 0;

    for (i = 0; i < str.length && str.charAt(i) === ' '; i++);

    indentation = i;

    // parse markup syntax
    let syntax = '';

    for (i = 0; i < str.length; i++) {
        const char = str.charAt(i);

        if (char === '`' || char === '~') {
            syntax = char;

            break;
        }
    }

    if (!syntax?.length) {
        return {succ: false};
    }

    const markupStart = i;

    for (; str.charAt(i) === syntax; i++);

    const markupEnd = i;

    const markup = str.slice(markupStart, markupEnd);

    const tail = str.slice(i + 1);

    return {indentation, markup, tail};
}

export {fence};
export default {fence};
