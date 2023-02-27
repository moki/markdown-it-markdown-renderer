import Renderer from 'markdown-it/lib/renderer';

import {hr} from './hr';
import {paragraph} from './paragraph';
import {heading} from './heading';
import {code} from './code';

const block: Renderer.RenderRuleRecord = {
    ...paragraph,
    ...heading,
    ...hr,
    ...code,
};

export {block};
export default {block};
