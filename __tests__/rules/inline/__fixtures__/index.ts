import type {CommonMarkSpecEntry} from '../../__fixtures__';

const fixtures: CommonMarkSpecEntry[] = [
    {
        section: 'inline text',
        number: 0,
        markdown: 'line of text',
        html: '',
    },
    {
        section: 'inline text empty',
        number: 1,
        markdown: '',
        html: '',
    },
    {
        section: 'inline emphasis',
        number: 2,
        markdown: '*italics*',
        html: '',
    },
    {
        section: 'inline emphasis empty',
        number: 3,
        markdown: '**',
        html: '',
    },
    {
        section: 'inline strong emphasis',
        number: 4,
        markdown: '**bold**',
        html: '',
    },
    {
        section: 'inline strong emphasis + emphasis',
        number: 5,
        markdown: '***bold italics***',
        html: '',
    },
    {
        section: 'inline softbreak',
        number: 6,
        markdown: 'some line\nnext line',
        html: '',
    },
    {
        section: 'inline hardbreak',
        number: 7,
        markdown: 'some line\\\nnext line',
        html: '',
    },
    {
        section: 'inline code',
        number: 8,
        markdown: '`console.log("hello");`',
        html: '',
    },
    {
        section: 'inline code with text',
        number: 9,
        markdown: 'Sentence with `console.log("hello");` code inside of it',
        html: '',
    },
    {
        section: 'inline code empty',
        number: 10,
        markdown: '``',
        html: '',
    },
    {
        section: 'inline link label href title',
        number: 11,
        markdown: '[text](folder/file.md "title")',
        html: '',
    },
    {
        section: 'inline link label href title with " inside',
        number: 12,
        markdown: '[text](folder/file.md \'title: "quote"\')',
        html: '',
    },
    {
        section: 'inline link label href',
        number: 13,
        markdown: '[text](folder/file.md)',
        html: '',
    },
    {
        section: 'inline link label',
        number: 14,
        markdown: '[text]()',
        html: '',
    },
    {
        section: 'inline link bold label',
        number: 15,
        markdown: '[**text**]()',
        html: '',
    },
    {
        section: 'inline link italics label',
        number: 16,
        markdown: '[*text*]()',
        html: '',
    },
    {
        section: 'inline link bold italics label',
        number: 17,
        markdown: '[***text***]()',
        html: '',
    },
    {
        section: 'inline link empty',
        number: 18,
        markdown: '[]()',
        html: '',
    },
    {
        section: 'inline autolink',
        number: 19,
        markdown: '<https://z0r.de/1729>',
        html: '',
    },
    {
        section: 'inline autolink empty',
        number: 20,
        markdown: '<>',
        html: '',
    },
    {
        section: 'inline image label src title',
        number: 21,
        markdown: '![diplo](logo/diplo.png "diplodoc")',
        html: '',
    },
    {
        section: 'inline image label src',
        number: 22,
        markdown: '![diplo](logo/diplo.png)',
        html: '',
    },
    {
        section: 'inline image label',
        number: 23,
        markdown: '![diplo]()',
        html: '',
    },
    {
        section: 'inline image bold label',
        number: 24,
        markdown: '![**diplo**]()',
        html: '',
    },
    {
        section: 'inline image italics label',
        number: 25,
        markdown: '![*diplo*]()',
        html: '',
    },
    {
        section: 'inline image bold italics label',
        number: 26,
        markdown: '![***diplo***]()',
        html: '',
    },
    {
        section: 'inline image empty',
        number: 27,
        markdown: '![]()',
        html: '',
    },
];

export {fixtures};
export default {fixtures};
