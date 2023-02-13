import MdIt from 'markdown-it';
import {MarkdownRenderer} from 'src/renderer';
import customRules from '../src/rules';

const mdit = new MdIt();
const xmdit = new MdIt();

xmdit.renderer = new MarkdownRenderer({customRules});

export function equals(rule: string, md: string) {
    it(`html equals for ${rule}`, () => {
        // TODO: move trim to renderer
        const a = xmdit.render(md).trim();
        const b = mdit.render(md);

        expect(a).toMatchSnapshot('MD');
        expect(b).toMatchSnapshot('HTML');
        expect(b).toEqual(mdit.render(a));
    });
}

function mergeTemplate(strings: string[], vars: string[]) {
    const result = [];

    let [source, next] = [strings, vars];
    while (source.length) {
        result.push(source.shift());
        [source, next] = [next, source];
    }

    return result.join('');
}

export function trim(strings: string[], ...vars: string[]) {
    const gap = /^[\t\s]+/.exec(strings[0].replace(/^\n/, ''))[0] || '';

    return mergeTemplate(
        strings.map((string) => string.split('\n' + gap).join('\n')),
        vars,
    );
}