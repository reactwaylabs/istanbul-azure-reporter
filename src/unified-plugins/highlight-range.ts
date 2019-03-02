import { Transformer, Attacher } from "unified";
import { Node, Position, Parent } from "unist";
import classNames from "classnames";

import { isNodeRoot, isNodeCodeLine } from "./helpers";
import { NodeElement } from "./contracts";

// prettier-ignore
function inRange(node: Position | undefined, selc: Position | undefined): boolean {
    if (node == null || selc == null) {
        return false;
    }
    
    // Comment symbols explanation:
    // Line            []
    // Text Range      +++
    // Range start/end |
    // Current line    <--

    // [ |++++| ] <--
    if (
        selc.start.line === node.start.line &&
        selc.end.line === node.end.line &&
        selc.start.column <= node.start.column &&
        selc.end.column >= node.end.column
    ) {
        return true;
    }

    // [  |+++++] <--
    // [+++++|  ]
    if (selc.start.line === node.start.line && 
        selc.end.line > node.end.line &&
        selc.start.column <= node.start.column) {
        return true;
    }

    // [  |+++++]
    // [++++++++] <--
    // [+++++|  ]
    if (selc.start.line < node.start.line && selc.end.line >= node.end.line) {
        return true;
    }

    // [  |+++++]
    // [+++++|  ] <--
    if (selc.start.line < node.start.line && 
        selc.end.line == node.end.line &&
        selc.start.column >= node.start.column) {
        return true;
    }

    return false;
}

function addHighlight(node: Node, position: Position, elementProperties: { [key: string]: string | string[] } = {}): Node | Parent {
    if (isNodeRoot(node)) {
        return {
            ...node,
            children: node.children.map(x => addHighlight(x, position, elementProperties))
        };
    } else if (isNodeCodeLine(node)) {
        let startIndex: number | undefined;
        let endIndex: number | undefined;
        const nextChildren = [...node.children];

        for (let i = 0; i < nextChildren.length; i++) {
            const child = nextChildren[i];
            if (inRange(child.position, position)) {
                if (startIndex == null) {
                    startIndex = i;
                }

                endIndex = i + 1;
            }
        }

        if (startIndex != null && endIndex != null) {
            const elementNode: NodeElement = {
                type: "element",
                tagName: "span",
                properties: elementProperties,
                children: []
            };

            const removedItems = nextChildren.splice(startIndex, endIndex - startIndex, elementNode);
            elementNode.children = removedItems;

            const updatedNodeLine: NodeElement = {
                ...node,
                children: nextChildren,
                properties: {
                    ...node.properties,
                    ...elementProperties,
                    class: classNames(node.properties.class, elementProperties.class)
                }
            };

            return updatedNodeLine;
        }
    }

    return node;
}

export interface HighlightRange {
    position: Position;
    properties?: { [key: string]: string | string[] };
}

export interface Options {
    highlightRanges: HighlightRange[];
}

export const highlightRange: Attacher = _options => {
    const resolveOptions = (opts: any): opts is Options => {
        return opts.highlightRanges != null && Array.isArray(opts.highlightRanges);
    };
    const options: Options = resolveOptions(_options) ? _options : { highlightRanges: [] };

    const transformer: Transformer = tree => {
        let result: Node = tree;

        for (const highlight of options.highlightRanges) {
            result = addHighlight(result, highlight.position, highlight.properties);
        }

        return result;
    };

    return transformer;
};
