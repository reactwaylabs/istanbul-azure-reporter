import { Node, Parent } from "unist";

import { NodeElement, TextElement } from "./contracts";

export function isNodeRoot(node: Node): node is Parent {
    return node.type === "root";
}
export function isNodeParent(node: Node): node is Parent {
    return node.children != null;
}

export function isNodeElement(node: Node): node is NodeElement {
    return node.type === "element";
}
export function isNodeText(node: Node): node is TextElement {
    return node.type === "text";
}

export function isNodeCodeLine(node: Node | Parent | NodeElement): node is NodeElement {
    return (
        node.type === "element" &&
        typeof node.properties === "object" &&
        node.properties != null &&
        typeof (node.properties as any).class === "string" &&
        ((node.properties as any).class as string).indexOf("line") !== -1
    );
}

export function modifyTreeFromDown(node: Node | Parent, modifier: (node: Node | Parent) => Node | Parent): Node | Parent {
    if (isNodeParent(node)) {
        const children: Node[] = [];
        for (const child of node.children) {
            children.push(modifyTreeFromDown(child, modifier));
        }
        node.children = children;

        return modifier(node);
    }

    return modifier(node);
}
