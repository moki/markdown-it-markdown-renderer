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
    const {markup, info, content, map} = tokens[i];
    if (!map) {
        throw new Error('failed render fence block');
    }

    let rendered = '';

    if (i) {
        rendered += this.EOL;
    }

    let openMarkup = markup;
    let openIndent = 0;
    let closeMarkup = markup;
    let closeIndent = 0;

    let contentLines = content?.length ? content.split('\n') : [];

    const [start, end] = map;
    const {source} = env;
    if (start !== null && end !== null && end > start && source?.length) {
        const fenceLength = end - start;

        const fenceLines = source.slice(start, end);

        let firstLine, lastLine;

        firstLine = lastLine = fenceLines[0];

        if (fenceLength > 1) {
            firstLine = fenceLines[0];
            lastLine = fenceLines[fenceLines.length - 1];
        }

        if (content?.length && fenceLength === 2) {
            contentLines = fenceLines.slice(1);
        } else {
            contentLines = fenceLines.slice(1, fenceLines.length - 1);
        }

        const firstTokens = parseFence(firstLine);
        if (firstTokens?.markup?.length && firstTokens.indentation !== null) {
            openMarkup = firstTokens.markup;
            openIndent = firstTokens.indentation;
        }

        const lastTokens = parseFence(lastLine);
        if (lastTokens?.markup?.length && lastTokens.indentation !== null) {
            closeMarkup = lastTokens.markup;
            closeIndent = lastTokens.indentation;
        }
    }

    // rendered += markup;
    rendered += this.SPACE.repeat(openIndent);
    rendered += openMarkup;

    if (info?.length) {
        rendered += info;
    }

    rendered += this.EOL;

    // render content
    for (const line of contentLines) {
        rendered += line;
        rendered += this.EOL;
    }

    rendered += this.SPACE.repeat(closeIndent);
    rendered += closeMarkup;

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
