import {code} from './inline/code';
import {emphasis} from './inline/emphasis';
import {hardbreak} from './inline/hardbreak';
import {image} from './inline/image';
import {link} from './inline/link';
import {softbreak} from './inline/softbreak';
import {text} from './inline/text';

import {paragraph} from './block/paragraph';

export default {
    ...code,
    ...emphasis,
    ...hardbreak,
    ...image,
    ...link,
    ...softbreak,
    ...text,
    ...paragraph,
};
