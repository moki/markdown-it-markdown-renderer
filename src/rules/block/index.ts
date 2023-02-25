import Renderer from 'markdown-it/lib/renderer';

import {hr} from './hr';
import {paragraph} from './paragraph';

const block: Renderer.RenderRuleRecord = {
    ...hr,
    ...paragraph,
};

export {block};
export default {block};
