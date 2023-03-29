import type MarkdownIt from 'markdown-it';

import {MarkdownRenderer, MarkdownRendererParams} from 'src/renderer';
import heading, {HeadingState} from 'src/rules/block/heading';
import image, {ImageState} from 'src/rules/inline/image';
import link, {LinkState} from 'src/rules/inline/link';

export type State = HeadingState & ImageState & LinkState;

const initState = () => ({
    ...heading.initState(),
    ...image.initState(),
    ...link.initState(),
});

export const defaultParameters = {
    initState,
};

// helpers
// always evaluate to provided value <v>
const always = (v: boolean) => () => v;
// always return input value <a> as a result
const id = (a: string) => a;

function mdRenderer(parser: MarkdownIt, parameters?: MarkdownRendererParams<State>) {
    // disable escape rule
    parser.inline.ruler.at('escape', always(false));
    // disable entity rule
    parser.inline.ruler.at('entity', always(false));
    // disable links normalization
    parser.normalizeLink = id;

    const options = {
        ...defaultParameters,
        ...parameters,
    };

    const renderer = new MarkdownRenderer(options);

    // @ts-ignore
    parser.renderer = renderer;
}

export {mdRenderer};
export default {mdRenderer};
