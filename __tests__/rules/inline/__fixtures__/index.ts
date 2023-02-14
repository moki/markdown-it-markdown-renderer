export type SpecEntry = {
    section: string;
    example: string;
    markdown: string;
};

const fixtures: SpecEntry[] = [
    {
        section: 'inline',
        example: 'text',
        markdown: 'line of text',
    },
    {
        section: 'inline',
        example: 'text empty',
        markdown: '',
    },
    {
        section: 'inline',
        example: 'emphasis',
        markdown: '*italics*',
    },
    {
        section: 'inline',
        example: 'emphasis empty',
        markdown: '**',
    },
    {
        section: 'inline',
        example: 'strong emphasis',
        markdown: '**bold**',
    },
    {
        section: 'inline',
        example: 'strong emphasis + emphasis',
        markdown: '***bold italics***',
    },
    {
        section: 'inline',
        example: 'softbreak',
        markdown: 'some line\nnext line',
    },
    {
        section: 'inline',
        example: 'hardbreak',
        markdown: 'some line\\\nnext line',
    },
    {
        section: 'inline',
        example: 'code',
        markdown: '`console.log("hello");`',
    },
    {
        section: 'inline',
        example: 'code with text',
        markdown: 'Sentence with `console.log("hello");` code inside of it',
    },
    {
        section: 'inline',
        example: 'code empty',
        markdown: '``',
    },
    {
        section: 'inline',
        example: 'link label href title',
        markdown: '[text](folder/file.md "title")',
    },
    {
        section: 'inline',
        example: 'link label href title with " inside',
        markdown: '[text](folder/file.md \'title: "quote"\')',
    },
    {
        section: 'inline',
        example: 'link label href',
        markdown: '[text](folder/file.md)',
    },
    {
        section: 'inline',
        example: 'link label',
        markdown: '[text]()',
    },
    {
        section: 'inline',
        example: 'link empty',
        markdown: '[]()',
    },
    {
        section: 'inline',
        example: 'autolink',
        markdown: '<https://z0r.de/1729>',
    },
    {
        section: 'inline',
        example: 'autolink empty',
        markdown: '<>',
    },

    {
        section: 'inline',
        example: 'image label src title',
        markdown: '![diplo](logo/diplo.png "diplodoc")',
    },
    {
        section: 'inline',
        example: 'image label src',
        markdown: '![diplo](logo/diplo.png)',
    },
    {
        section: 'inline',
        example: 'image label',
        markdown: '![diplo]()',
    },
    {
        section: 'inline',
        example: 'image empty',
        markdown: '![]()',
    },
];

export {fixtures};
export default {fixtures};
