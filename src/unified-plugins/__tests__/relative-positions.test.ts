import fs from "fs";
import path from "path";
import low from "lowlight";
import unified from "unified";
import os from "os";
import visit from "unist-util-visit";
import { Position } from "unist";

import { relativePositions } from "../relative-positions";

const exampleCode = fs.readFileSync(path.resolve(__dirname, "./example-code.txt"), "utf8");
const exampleCodeLines = exampleCode.split(os.EOL);

function getText(lines: string[], _positon: Position): string {
    const position: Position = {
        start: {
            line: _positon.start.line - 1,
            column: _positon.start.column - 1
        },
        end: {
            line: _positon.end.line - 1,
            column: _positon.end.column - 1
        }
    };
    const startingIndex = position.start.line;
    let result: string[] = [];

    for (let lineIndex = startingIndex; lineIndex <= position.end.line; lineIndex++) {
        const line = lines[lineIndex];

        // Comment symbols explanation:
        // Line            []
        // Text Range      +++
        // Range start/end |
        // Current line    <--
        if (lineIndex === position.start.line && lineIndex === position.end.line) {
            // [ |++++| ] <--
            result.push(line.substring(position.start.column, position.end.column));
        } else if (lineIndex === position.start.line && lineIndex < position.end.line) {
            // [  |+++++] <--
            // [+++++|  ]
            result.push(line.substring(position.start.column, line.length));
        } else if (lineIndex > position.start.line && lineIndex < position.end.line) {
            // [  |+++++]
            // [++++++++] <--
            // [+++++|  ]
            result.push(line);
        } else if (lineIndex > position.start.line && lineIndex === position.end.line) {
            // [  |+++++]
            // [+++++|  ] <--
            result.push(line.substring(0, position.end.column));
        }
    }

    return result.join(os.EOL);
}

it("check positions with source", () => {
    const ast = low.highlight("js", exampleCode).value;

    const astUpdate = unified()
        .use(relativePositions)
        .runSync({ type: "root", children: ast });

    expect(astUpdate).toMatchSnapshot();

    visit(astUpdate, "text", node => {
        const position = node.position!;
        expect(position).toBeDefined();

        const valueFromSource = getText(exampleCodeLines, position);
        expect(node.value).toBe(valueFromSource);
    });
});
