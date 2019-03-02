import { Node, Parent } from "unist";

export = index;
declare function index(tree: Node, visitor: (node: Node, ancestors: Parent[]) => void, reverse?: any): void;
declare function index(tree: Node, test: string, visitor: (node: Node, ancestors: Parent[]) => void, reverse?: any): void;
declare namespace index {
    const CONTINUE: boolean;
    const EXIT: boolean;
    const SKIP: string;
}
