import { Attacher, Transformer } from "unified";
import { Position, Point, Parent } from "unist";

import { matchAll, NEWLINE_PATTERN } from "../helpers";
import { isNodeElement, isNodeText, modifyTreeFromDown, isNodeRoot } from "./helpers";
import { TextElement } from "./contracts";

export function getEndPoint(node: TextElement, position: Position): Point {
    const text = node.value;
    const matches = matchAll(NEWLINE_PATTERN, text);
    if (matches.length === 0) {
        return {
            line: position.start.line,
            column: position.start.column + text.length
        };
    }

    const lastMatch: RegExpMatchArray = matches[matches.length - 1];
    const lastLineOffset = lastMatch.index!;
    const lastLineLength = lastMatch.length;
    const lastLine = text.substr(lastLineOffset + lastLineLength);

    return {
        line: position.start.line + matches.length,
        column: lastLine.length + 1
    };
}

function getParentPosition(node: Parent): Position | undefined {
    let nodeStartPoint: Point | undefined;
    let nodeEndPoint: Point | undefined;

    node.children.forEach((child, index) => {
        if (child.position == null) {
            return;
        }

        nodeEndPoint = child.position.end;

        if (index === 0) {
            // First child
            nodeStartPoint = child.position.start;
        }
    });

    if (nodeStartPoint != null && nodeEndPoint != null) {
        return {
            start: nodeStartPoint,
            end: nodeEndPoint
        };
    }
}

export const relativePositions: Attacher = _options => {
    const transformer: Transformer = tree => {
        let lastPosition: Position = {
            start: {
                line: 1,
                column: 1
            },
            end: {
                line: 1,
                column: 1
            }
        };

        modifyTreeFromDown(tree, node => {
            if (isNodeText(node)) {
                const endPosition: Point = getEndPoint(node, lastPosition);
                const resolvedPosition = {
                    start: {
                        line: lastPosition.start.line,
                        column: lastPosition.start.column
                    },
                    end: endPosition
                };

                lastPosition = {
                    start: endPosition,
                    end: endPosition
                };

                return {
                    ...node,
                    position: resolvedPosition
                };
            } else if (isNodeElement(node) || isNodeRoot(node)) {
                return {
                    ...node,
                    position: getParentPosition(node)
                };
            }

            console.warn(`Not supported Node type '${node.type}'.`);
            return node;
        });

        return tree;
    };

    return transformer;
};
