import { Node, Parent } from "unist";

export = index;
declare function index(tree: Node, test: string | Function, visitor: index.VisitorHandler, reverse?: any): void;
declare function index(tree: Node, visitor: index.VisitorHandler, reverse?: any): void;
declare function index(tree: Node, test: string | Function, visitor: index.VisitorHandler, reverse?: any): void;
declare namespace index {
    type VisitorHandler = (node: Node, index: number, parent: Parent | undefined) => void;

    const CONTINUE: boolean;
    const EXIT: boolean;
    const SKIP: string;
}
