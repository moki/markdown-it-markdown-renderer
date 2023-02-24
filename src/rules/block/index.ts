import Renderer from 'markdown-it/lib/renderer';

import {hr} from './hr';
import {paragraph} from './paragraph';
import {heading} from './heading';

const block: Renderer.RenderRuleRecord = {
    ...paragraph,
    ...heading,
    ...hr,
};

export {block};
export default {block};
