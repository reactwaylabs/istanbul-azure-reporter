import low from "lowlight";
import { Parent } from "unist";
import { VFileCompatible } from "unified";
import os from "os";
import { NodeElement, TextElement } from "./contracts";

(low as any).registerAlias("typescript", "tsx");

export function highlightParser(language: string) {
    return (file: VFileCompatible): Parent => {
        const content = file.toString();
        const contentLines = content.split(new RegExp(os.EOL));

        const lineElementsList: Array<NodeElement | TextElement> = [];

        for (const line of contentLines) {
            const lineElement: NodeElement = {
                type: "element",
                tagName: "span",
                properties: {
                    class: "line"
                },
                children: []
            };

            const wordsList = line.split(" ");

            for (let i = 0; i < wordsList.length; i++) {
                const word = wordsList[i];
                lineElement.children.push(...low.highlight(language, word).value);

                if (i !== wordsList.length - 1) {
                    const space: TextElement = {
                        type: "text",
                        value: " "
                    };
                    lineElement.children.push(space);
                }
            }

            const newLine: TextElement = {
                type: "text",
                value: os.EOL
            };

            lineElementsList.push(lineElement, newLine);
        }

        return {
            type: "root",
            children: lineElementsList
        };
    };
}
