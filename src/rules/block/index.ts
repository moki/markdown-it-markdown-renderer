import Renderer from 'markdown-it/lib/renderer';

import {hr} from './hr';

const block: Renderer.RenderRuleRecord = {
    ...hr,
};

export {block};
export default {block};
