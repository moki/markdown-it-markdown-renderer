import {MarkdownRenderer} from 'src/renderer';
import Token from 'markdown-it/lib/token';

import {image, initState} from 'src/rules/inline/image';

describe('image', () => {
    it('is named image', () => {
        const handler = image.image;

        expect(handler).toBeTruthy();
    });

    it('puts image token onto pending stack', () => {
        // const renderer = new MarkdownRenderer({rules: {...image}});
        const renderer = new MarkdownRenderer({rules: {...image}, initState});
        const spy = jest.spyOn(renderer, 'renderInline').mockImplementation(() => '');

        let handler = image.image;
        if (!handler) {
            throw new Error('image rule is not implemented');
        }

        handler = handler.bind(renderer);

        const img = new Token('image', '', 0);
        const tokens: Token[] = [img];

        handler(tokens, 0, {}, {}, renderer);

        const pending = renderer['state']['image']['pending'].pop();

        expect(pending).toStrictEqual(img);

        spy.mockRestore();
    });

    it('calls renderInline with image_open, image.children, image_close tokens', () => {
        const renderer = new MarkdownRenderer({rules: {...image}, initState});
        const spy = jest.spyOn(renderer, 'renderInline');

        let handler = image.image;
        if (!handler) {
            throw new Error('image rule is not implemented');
        }

        handler = handler.bind(renderer);

        const img = new Token('image', '', 0);
        const children = [] as Token[];

        img.children = children;

        const tokens: Token[] = [img];

        handler(tokens, 0, {}, {}, renderer);

        const open = new Token('image_open', '', 0);
        const close = new Token('image_close', '', 0);
        const tokens_ = [open, ...children, close];

        expect(spy).toHaveBeenCalledWith(tokens_, {}, {});
    });
});

describe('image_open', () => {
    it('is named image_open', () => {
        const handler = image.image_open;

        expect(handler).toBeTruthy();
    });

    it('returns ![ for image_open token', () => {
        const renderer = new MarkdownRenderer({rules: {...image}, initState});

        let handler = image.image_open;
        if (!handler) {
            throw new Error('image_open rule is not implemented');
        }

        handler = handler.bind(renderer);

        const open = new Token('image_open', '', 0);
        const tokens = [open] as Token[];

        const expected = `![`;
        const actual = handler(tokens, 0, {}, {}, renderer);

        expect(actual).toStrictEqual(expected);
    });
});

describe('image_close', () => {
    it('is named image_close', () => {
        const handler = image.image_close;

        expect(handler).toBeTruthy();
    });

    it('takes image token from stack', () => {
        const renderer = new MarkdownRenderer({rules: {...image}, initState});

        let handler = image.image_close;
        if (!handler) {
            throw new Error('image_close rule is not implemented');
        }

        handler = handler.bind(renderer);

        const img = new Token('image', '', 0);
        const children = [];
        img.children = children;

        renderer['state']['image']['pending'].push(img);

        const close = new Token('image_close', '', 0);
        const tokens = [close];

        handler(tokens, 0, {}, {}, renderer);

        expect(renderer['state']['image']['pending']).toHaveLength(0);
    });

    it('return ] and (src[ "title"]) for image_close tag', () => {
        const renderer = new MarkdownRenderer({rules: {...image}, initState});

        let handler = image.image_close;
        if (!handler) {
            throw new Error('image_close rule is not implemented');
        }

        handler = handler.bind(renderer);

        const close = new Token('image_close', '', 0);
        const tokens = [close];

        const img = new Token('image', '', 0);
        const src = 'folder/file.png';
        const title = 'cool image';

        img.attrSet('src', src);
        img.attrSet('title', title);

        renderer['state']['image']['pending'].push(img);

        const expected = `](${src} "${title}")`;

        const actual = handler(tokens, 0, {}, {}, renderer);

        expect(actual).toStrictEqual(expected);
    });
});

describe('image', () => {
    it('renders image with src and title', () => {
        const renderer = new MarkdownRenderer({rules: {...image}, initState});

        const img = new Token('image', '', 0);
        const src = 'folder/image.png';
        const title = 'cool page';
        img.attrSet('src', src);
        img.attrSet('title', title);

        // const close = new Token('image_close', '', 0);
        const tokens = [img];

        const expected = `![](${src} "${title}")`;
        const actual = renderer.render(tokens, {}, {});

        expect(actual).toStrictEqual(expected);
    });

    it('renders image with \' as title markup if title contains "', () => {
        const renderer = new MarkdownRenderer({rules: {...image}, initState});

        const img = new Token('image', '', 0);
        const src = 'folder/image.png';
        const title = 'some would say: "it\'s a cool image"';
        img.attrSet('src', src);
        img.attrSet('title', title);

        const tokens = [img];

        const expected = `![](${src} '${title}')`;
        const actual = renderer.render(tokens, {}, {});

        expect(actual).toStrictEqual(expected);
    });

    it('render image with src', () => {
        const renderer = new MarkdownRenderer({rules: {...image}, initState});

        const img = new Token('image', '', 0);
        const src = 'folder/image.png';
        img.attrSet('src', src);

        const tokens = [img];

        const expected = `![](${src})`;
        const actual = renderer.render(tokens, {}, {});

        expect(actual).toStrictEqual(expected);
    });

    it('render empty image', () => {
        const renderer = new MarkdownRenderer({rules: {...image}, initState});

        const img = new Token('image', '', 0);

        const tokens = [img];

        const expected = `![]()`;
        const actual = renderer.render(tokens, {}, {});

        expect(actual).toStrictEqual(expected);
    });
});
