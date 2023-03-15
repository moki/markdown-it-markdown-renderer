import MarkdownIt from 'markdown-it';
import {MarkdownRenderer, MarkdownRendererEnv, MarkdownRendererMode} from 'src/renderer';
import {tests} from 'commonmark-spec';

import {CommonMarkSpecEntry} from './__fixtures__';

const renderer = new MarkdownRenderer({mode: MarkdownRendererMode.Production});

const md = new MarkdownIt('commonmark', {html: true});

// helpers
// always evaluate to provided value <v>
const always = (v: boolean) => () => v;
// always return input value <a> as a result
const id = (a: string) => a;

// modify markdown-it parser behaviour
// disable escape rule
md.inline.ruler.at('escape', always(false));
// disable entity rule
md.inline.ruler.at('entity', always(false));
// disable links normalization
md.normalizeLink = id;

// @ts-ignore
md.renderer = renderer;

// test only rules that are implemented
const sectionsKeep = new Set([
    /*
     */
    'Backslash escapes',
    'Entity and numeric character references',
    'Inlines',
    'Code spans',
    'Links',
    'Autolinks',
    'Emphasis and strong emphasis',
    'Hard line breaks',
    'Soft line breaks',
    'Textual content',
    'Raw HTML',
    'Images',
    'Thematic breaks',
    'Paragraphs',
    'ATX headings',
    'Setext headings',
    'Indented code blocks',
    'Fenced code blocks',
    'HTML blocks',
    'Block quotes',
    'Indented code blocks',
    // 'Lists',
    //'List items',
]);

/*
export const semanticsTests = new Set([
    // 'Backslash escapes',
    // fence is not implemented
    19, 34, 36,
    // tabulated code block not implemented
    18,
    // lost info by the parser, does not change meaning of the constructs
    22, 23, 24,

    // 'Entity and numeric character references',
    // lists are not implemented
    38,
    // best we can do is disable link normalization:
    // md.normalizeLink = id;
    // gives us same html render
    32,

    // 'Code spans',
    // parser strips leading(mostleft), trailling(mostright) space
    // for code_inline on both sides
    329, 330, 331, 340, 17,
    // parser treats new lines inside of the code_inline as spaces
    335, 336, 337,

    // 'Links',
    // refs are consumed by the parser
    33, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 542, 543,
    544, 545, 546, 547, 548, 549, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 560, 561, 562,
    563, 564, 565, 566, 567, 568, 569, 570,
    // spaces consumed by the parser
    509,
    // title quotes are "normalized"
    505,
    // by default use double title quotes
    504,
    // best we can with html entities see disabling link normalization below
    502, 499,
    // < and > are consumed by the parser
    485, 488, 491, 498,
    // lost info by the parser, does not change meaing of the constructs
    494, 497,

    // 'Images'
    // refs are consumed by the parser
    572, 575, 576, 581, 582, 583, 584, 585, 586, 587, 588, 589, 590, 591, 592,
    // < and > are consumed by the parser
    579,
    // spaces are consumed by the parser
    578,

    // 'Hard line breaks',
    // consumed by the parser, hard line breaks are always \ followed by \n
    633, 635, 636, 637,
    // headings are not implemented
    646, 647,
    // code_inline parser consumes new lines, transforms into spaces
    641, 640,
    // lists are not implemented
    638,

    // 'Soft line breaks',
    // trailing spaces consumed by the parser
    649,

    // 'Raw HTML',
    // paragraphs are not implemented
    626,

    // 'Thematic breaks',
    // lists are not implemented
    57, 60, 61,
    // headers are not implemented
    59,
    // leading spaces are consumed by the parser
    49,

    // code indent blocks are not implemented
    48,
    // spaces consumed by the parser
    47, 51, 52, 53, 54,

    // 'Paragraphs'
    // spaces between blocks are consumed by the parser
    221,
    // hard line breaks are always transformed into explicit form:
    // \ followed by a newline
    226,
    // code indent blocks are not implemented
    225,
    // leading spaces are consumed by the parser
    222, 223,

    // 'ATX headings'
    // trailling spaces after heading open syntax are consumed by the parser
    67,
    // normalization into heading open syntax always having spacing after
    // optional heading close syntax are consumed by the parser
    79, 73, 72,
    // optional indentation before heading open syntax consumed by the parser
    71, 70, 68,
    // test intended to fail
    69,

    // 'Setext headings',
    // leading, inside the markup, trailling  spaces are consumed by the parser
    84, 87, 88, 89, 80, 83,
    // spaces are consumed by the parser
    105,
    // indented code block are not implemented
    85, 100,
    // lists are not implemented
    99, 94,
    // intended to fail
    104,

    // 'Indented code blocks',
    // trailling spaces consumed by the parser
    111,
    // indentation inside paragraph after softbreak is consumed by the parser
    113,
    // lists are not implemented
    108, 109,

    // 'Fenced code blocks'
    // paragraph new lines becomes spaces
    121,
    // code_inline leading and trailling spaces are consumed by the parser
    145,
    // semantics are the same
    128,
    // normalize not closed fence blocks
    139, 137, 126, 127,
    // normalize markup close different from markup open
    124, 143,

    // 'HTML blocks',
    // spaces are consumed by the parser
    // note: doesn't change semantics(i.e. same html render)
    152,
    // extra spacing after paragraph doesn't change semantics
    // but helps prevent joining with previous paragraph
    182, 185, 180, 179, 177, 176, 172, 170, 169, 148,
    // lists are not implemented
    175,
    // semantics are the same
    174,

    // 'Block quotes'
    // paragraphs
    // blockquotes are lazy, semantics preserved
    251, 249, 233, 243, 241,
    // we always separate paragraphs
    248,
    // we always render spaces that follows blockquote even on empty lines
    244,
    // fences
    // close fences explicitly
    237,
    // omit empty lines inside empty blockquote
    240,
    // headers
    // lazy blockquotes inside paragraphs
    228, 229,
    // leading spaces consumed by the parser
    230,
    // lists are not implemented
    238, 235,

    // 'List items'
    // empty lines are consumed by the parser, semantics preserved
    // 262,
    // empty line between code_block and blockquote start is optional
    253,
    // empty lines before paragraph are consumed
    255,
    // we render indentation even on empty lines between list item members
    256, 258,
]);
*/

// 318, 320, 321, 312 (?)

// const semanticsTests = new Set([245, 264, 278, 500]);
// const semanticsTests = new Set([232, 236, 278]);

// todo: 257 276
// const semanticsTests = new Set([232, 236, 278, 294]);
// const semanticsTests = new Set([278]);

// const semanticsTests = new Set([278, 260, 294]);
// const semanticsTests = new Set([232, 236, 245, 260, 264, 278, 281, 282, 284, 294, 500]);
// const semanticsTests = new Set([298]);
// const semanticsTests = new Set([281, 282, 284]);

// 260 - blockquote with list item
// 278 - new line list item
// 294 - nested lists
// 282, 284 - empty list

// const semanticsTests = new Set([278, 270, 264]);
// const semanticsTests = new Set([264]);

const semanticsTests = new Set([
    // unordered
    257, 232, 236, 245, 261, 264, 270, 278, 281, 284, 294, 295, 298, 300, 301, 303, 310, 318, 322,
    323,
]);

// const semanticsTests = new Set([]);

console.log = (a) => a;
console.info = (a) => a;

const units = tests.filter(({section, number}) => {
    const cond = semanticsTests.has(number);

    return cond;

    if (!sectionsKeep.has(section)) {
        return false;
    }

    if (semanticsTests.has(number)) {
        return false;
    }

    return true;
});

// omit first and last empty lines
const filterOutEmptyFstLst = (line, i, ls) => (i && i + 1 !== ls.length) || line.trim().length;
const normalizeMD = (str: string) => str.split('\n').filter(filterOutEmptyFstLst).join('\n');

describe('markdown zero diff', () => {
    units.forEach((entry: CommonMarkSpecEntry) => {
        const {section, number, markdown} = entry;

        const name = `${section} ${number}`;

        test(name, () => {
            // passing array of original markdown string split by new lines
            const env: MarkdownRendererEnv = {source: markdown.split('\n')};
            const rendered = md.render(markdown, env);

            console.info(rendered);
            // rendered.split('\n').forEach((l) => console.info(l, l.length));

            // expect(rendered.trimEnd()).toStrictEqual(markdown.trimEnd());
            expect(normalizeMD(rendered)).toStrictEqual(normalizeMD(markdown));
        });
    });
});
