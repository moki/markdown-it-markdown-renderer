import type Renderer from 'markdown-it/lib/renderer';

import {hr} from './hr';
import {paragraph} from './paragraph';
import {heading} from './heading';
import {code} from './code';
import {fence} from './fence';
import {html} from './html';

const block: Renderer.RenderRuleRecord = {
    ...paragraph,
    ...heading,
    ...hr,
    ...code,
    ...fence,
    ...html,
};

export {block};
export default {block};
