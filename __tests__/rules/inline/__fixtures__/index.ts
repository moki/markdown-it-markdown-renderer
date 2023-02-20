import type {CommonMarkSpecEntry} from '../../__fixtures__';

const fixtures: CommonMarkSpecEntry[] = [
    {
        section: 'inline',
        number: 'text',
        markdown: 'line of text',
        html: '',
    },
    {
        section: 'inline',
        number: 'text empty',
        markdown: '',
        html: '',
    },
    {
        section: 'inline',
        number: 'emphasis',
        markdown: '*italics*',
        html: '',
    },
    {
        section: 'inline',
        number: 'emphasis empty',
        markdown: '**',
        html: '',
    },
    {
        section: 'inline',
        number: 'strong emphasis',
        markdown: '**bold**',
        html: '',
    },
    {
        section: 'inline',
        number: 'strong emphasis + emphasis',
        markdown: '***bold italics***',
        html: '',
    },
    {
        section: 'inline',
        number: 'softbreak',
        markdown: 'some line\nnext line',
        html: '',
    },
    {
        section: 'inline',
        number: 'hardbreak',
        markdown: 'some line\\\nnext line',
        html: '',
    },
    {
        section: 'inline',
        number: 'code',
        markdown: '`console.log("hello");`',
        html: '',
    },
    {
        section: 'inline',
        number: 'code with text',
        markdown: 'Sentence with `console.log("hello");` code inside of it',
        html: '',
    },
    {
        section: 'inline',
        number: 'code empty',
        markdown: '``',
        html: '',
    },
    {
        section: 'inline',
        number: 'link label href title',
        markdown: '[text](folder/file.md "title")',
        html: '',
    },
    {
        section: 'inline',
        number: 'link label href title with " inside',
        markdown: '[text](folder/file.md \'title: "quote"\')',
        html: '',
    },
    {
        section: 'inline',
        number: 'link label href',
        markdown: '[text](folder/file.md)',
        html: '',
    },
    {
        section: 'inline',
        number: 'link label',
        markdown: '[text]()',
        html: '',
    },
    {
        section: 'inline',
        number: 'link bold label',
        markdown: '[**text**]()',
        html: '',
    },
    {
        section: 'inline',
        number: 'link italics label',
        markdown: '[*text*]()',
        html: '',
    },
    {
        section: 'inline',
        number: 'link bold italics label',
        markdown: '[***text***]()',
        html: '',
    },
    {
        section: 'inline',
        number: 'link empty',
        markdown: '[]()',
        html: '',
    },
    {
        section: 'inline',
        number: 'autolink',
        markdown: '<https://z0r.de/1729>',
        html: '',
    },
    {
        section: 'inline',
        number: 'autolink empty',
        markdown: '<>',
        html: '',
    },
    {
        section: 'inline',
        number: 'image label src title',
        markdown: '![diplo](logo/diplo.png "diplodoc")',
        html: '',
    },
    {
        section: 'inline',
        number: 'image label src',
        markdown: '![diplo](logo/diplo.png)',
        html: '',
    },
    {
        section: 'inline',
        number: 'image label',
        markdown: '![diplo]()',
        html: '',
    },
    {
        section: 'inline',
        number: 'image bold label',
        markdown: '![**diplo**]()',
        html: '',
    },
    {
        section: 'inline',
        number: 'image italics label',
        markdown: '![*diplo*]()',
        html: '',
    },
    {
        section: 'inline',
        number: 'image bold italics label',
        markdown: '![***diplo***]()',
        html: '',
    },
    {
        section: 'inline',
        number: 'image empty',
        markdown: '![]()',
        html: '',
    },
];

export {fixtures};
export default {fixtures};
