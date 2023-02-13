import Renderer from 'markdown-it/lib/renderer';

import {softbreak} from './softbreak';
import {hardbreak} from './hardbreak';
import {text} from './text';
import {emphasis} from './emphasis';
import {code} from './code';
import {link} from './link';
import {image} from './image';

// https://spec.commonmark.org/0.30/#inlines
//
// html tags https://spec.commonmark.org/0.30/#raw-html
// html are handled by default html_inline and html_block rules
//
// autolinks https://spec.commonmark.org/0.30/#autolinks
// autolinks are handled by link rule
//
// images https://spec.commonmark.org/0.30/#images
//
// links
// inline links https://spec.commonmark.org/0.30/#links
// reference links: https://spec.commonmark.org/0.30/#reference-link
// link reference definition: https://spec.commonmark.org/0.30/#link-reference-definition
//
// code span `code` https://spec.commonmark.org/0.30/#code-spans
//
// emphasis
// strong - **, __
// em - _, * https://spec.commonmark.org/0.30/#emphasis-and-strong-emphasis
//
// text https://spec.commonmark.org/0.30/#textual-content
//
// hard line breaks https://spec.commonmark.org/0.30/#hard-line-breaks
//
// soft line breaks https://spec.commonmark.org/0.30/#soft-line-breaksk
const inline: Renderer.RenderRuleRecord = {
    ...code,
    ...link,
    ...image,
    ...emphasis,
    ...text,
    ...softbreak,
    ...hardbreak,
};

export {inline};
export default {inline};
