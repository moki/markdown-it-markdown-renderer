import Token from 'markdown-it/lib/token';
import {ContainerOrderedList, ContainerUnorderedList} from 'src/rules/block/list';
import {ContainerBlockquote, isBlockquote} from 'src/rules/block/blockquote';

export type ContainerRenderer<CT extends ContainerBase> = (
    containers: Container<CT>[],
    i: number,
    caller: Token,
) => string;

export type Container<CT extends ContainerBase> =
    | ContainerBlockquote
    | ContainerOrderedList
    | ContainerUnorderedList
    | CT;

export type ContainerBase = {
    type: string;
    lspaces: number;
    tspaces: number;
    empty?: boolean;
    rendered: boolean;
    row: number;
    col: number;
    markup: string;
};

function isTail<CT extends ContainerBase>(container: Container<CT>, ctx: Token) {
    const [start] = ctx?.map ?? [null];
    // eslint-disable-next-line eqeqeq, no-eq-null
    if (start == null) {
        const containerStr = JSON.stringify(container);
        const ctxStr = JSON.stringify(ctx);
        throw new Error(
            `failed to render container: ${containerStr} caller: ${ctxStr} doesn't have map`,
        );
    }

    // >= instead of > because we can open markup on the same line as list
    // as an example with ``` and then span inside the list with fences content
    return start >= container.row && container.rendered;
}

function isFst<CT extends ContainerBase>(container: Container<CT>, ctx: Token) {
    const [start] = ctx?.map ?? [null];
    // eslint-disable-next-line eqeqeq, no-eq-null
    if (start == null) {
        const containerStr = JSON.stringify(container);
        const ctxStr = JSON.stringify(ctx);
        throw new Error(
            `failed to render container: ${containerStr} caller: ${ctxStr} doesn't have map`,
        );
    }
    return (
        (container.row === start && !container.rendered) ||
        (!container.rendered && isBlockquote(container))
    );
}

function isEmpty<CT extends ContainerBase>(container: Container<CT>) {
    return container.empty;
}

function sameRow<CT extends ContainerBase>(left: Container<CT>, right: Container<CT>) {
    return left.row === right.row;
}

function aligned<CT extends ContainerBase>(left: Container<CT>, right: Container<CT>) {
    return left.col + left.tspaces + left.markup.length >= right.col - right.lspaces;
}

export {isFst, isTail, isEmpty, sameRow, aligned};
export default {isFst, isTail, isEmpty, sameRow, aligned};
