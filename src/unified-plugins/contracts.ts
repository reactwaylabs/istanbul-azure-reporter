import { Node, Parent } from "unist";

export interface NodeElement extends Parent {
    type: "element";
    tagName: string;
    properties: { [key: string]: string | string[] };
}

export interface TextElement extends Node {
    type: "text";
    value: string;
}
