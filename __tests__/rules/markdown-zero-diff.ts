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
    'Indented code blocks',
    'Block quotes',
    'List items',
]);

export const semanticsTests = new Set([
    // 'Backslash escapes',
    // lost info by the parser, does not change meaning of the constructs
    22, 23,

    // 'Entity and numeric character references',
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
    633, 635, 636, 637, 645,
    // trailling spaces
    647,
    // code_inline parser consumes new lines, transforms into spaces
    641, 640,

    638,

    // 'Soft line breaks',
    // trailing spaces consumed by the parser
    649,

    // 'Raw HTML',
    // paragraphs are not implemented

    // 'Thematic breaks',
    // spaces are consumed by the parser
    47, 49, 51, 52, 53, 54, 56, 60, 61,

    // 'Paragraphs'
    // spaces are consumed by the parser
    221, 222, 223, 224,
    // hard line breaks are always transformed into explicit form:
    // \ followed by a newline
    226,

    // 'ATX headings'
    // trailling spaces after heading open syntax are consumed by the parser
    67, 68, 71, 70,
    // normalization into heading open syntax always having spacing after
    // optional heading close syntax are consumed by the parser
    79, 73, 72,

    // 'Setext headings',
    // leading, inside the markup, trailling  spaces are consumed by the parser
    82, 84, 87, 88, 89, 80, 83,
    // spaces are consumed by the parser
    105,
    // intended to fail
    104,

    // 'Indented code blocks',
    // trailling spaces consumed by the parser
    111,
    // indentation inside paragraph after softbreak is consumed by the parser
    113,

    108, 109, 117, 118,

    // 'Fenced code blocks'
    // code_inline spaces and new lines are consumed by the parser
    145, 121,
    // normalize not closed fence blocks
    124, 127, 128, 139, 137, 126, 143,

    // 'HTML blocks',
    // spaces are consumed by the parser
    // note: doesn't change semantics(i.e. same html render)
    // extra spacing after paragraph doesn't change semantics
    // but helps prevent joining with previous paragraph
    182, 185, 180, 179, 177, 176, 172, 170, 169, 148,

    174, 175,

    // 'Block quotes'
    // paragraphs
    // blockquotes are lazy, semantics preserved
    228, 229, 241, 233, 249, 243, 251,
    // we always separate paragraphs
    248,
    // we always render spaces that follows blockquote even on empty lines
    244,
    // fences
    // close fences explicitly
    237,
    // omit empty lines inside empty blockquote
    240,
    // leading spaces consumed by the parser
    230,
    // lists are not implemented
    238,

    // 'List items'
    253, 254, 255, 256, 258, 259, 260, 262, 263, 268, 272, 273, 274, 275, 276, 277, 279, 280, 282,
    286, 287, 288, 290, 291, 293, 299, 306, 307, 308, 309, 312, 314, 315, 316, 317, 319, 325, 326,
]);

const units = tests.filter(({section, number}) => {
    const cond = semanticsTests.has(number);

    // return cond;
    if (cond) {
        return false;
    }

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

            expect(normalizeMD(rendered)).toStrictEqual(normalizeMD(markdown));
        });
    });
});
