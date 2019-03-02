import React from "react";
import { FileCoverage } from "istanbul-lib-coverage";
import unified from "unified";
import html from "rehype-react";
import { Parent } from "unist";
import classNames from "classnames";

import { highlightParser } from "../../unified-plugins/highlight";
import { relativePositions } from "../../unified-plugins/relative-positions";
import { highlightRange, HighlightRange } from "../../unified-plugins/highlight-range";
import { isNodeCodeLine } from "../../unified-plugins/helpers";
import { Styles } from "../styles";

function functionRanges(fileCoverage: FileCoverage): HighlightRange[] {
    const result: HighlightRange[] = [];

    for (const fName of Object.keys(fileCoverage.f)) {
        const hitCounts = fileCoverage.f[fName];
        const meta = fileCoverage.fnMap[fName];
        if (meta.decl == null || hitCounts !== 0) {
            continue;
        }

        result.push({
            position: meta.decl,
            properties: {
                class: "not-covered",
                title: "Function is not covered"
            }
        });
    }

    return result;
}
function statementsRanges(fileCoverage: FileCoverage): HighlightRange[] {
    const result: HighlightRange[] = [];

    if (fileCoverage.s != null) {
        for (const stName of Object.keys(fileCoverage.statementMap)) {
            const meta = fileCoverage.statementMap[stName];
            const hitCounts = fileCoverage.s[stName];

            if (hitCounts !== 0) {
                continue;
            }

            result.push({
                position: meta,
                properties: {
                    class: "not-covered",
                    title: "Statement is not covered"
                }
            });
        }
    }

    return result;
}
function branchesRanges(fileCoverage: FileCoverage): HighlightRange[] {
    const result: HighlightRange[] = [];

    if (fileCoverage.b != null) {
        for (const bName of Object.keys(fileCoverage.b)) {
            const hitCountsList = fileCoverage.b[bName];
            const locationsList = fileCoverage.branchMap[bName].locations;
            const sumCount = hitCountsList.reduce((a, b) => a + b);

            if (sumCount > 0 || (sumCount === 0 && hitCountsList.length === 1)) {
                for (let i = 0; i < hitCountsList.length && i < locationsList.length; i += 1) {
                    const count = hitCountsList[i];
                    const location = locationsList[i];

                    if (count !== 0) {
                        continue;
                    }

                    result.push({
                        position: location,
                        properties: {
                            class: "not-covered",
                            title: "Function is not covered"
                        }
                    });
                }
            }
        }
    }

    return result;
}

interface Props {
    fileExtension: string;
    fileContents: string;
    fileCoverage: FileCoverage;
}

export function DetailsCodeView(props: Props): JSX.Element {
    // prettier-ignore
    const ranges = [
        ...branchesRanges(props.fileCoverage),
        ...functionRanges(props.fileCoverage),
        ...statementsRanges(props.fileCoverage)
    ];

    const codeParser = unified();
    codeParser.Parser = highlightParser(props.fileExtension.replace(".", ""));

    const fileAst = codeParser.parse(props.fileContents) as Parent;

    const codeLinesNode = unified()
        .use(relativePositions)
        .use(highlightRange, { highlightRanges: ranges })
        .runSync(fileAst) as Parent;

    const linesCount = codeLinesNode.children.filter(x => isNodeCodeLine(x)).length;

    const codeContainer = (unified()
        .use(html as any, {
            createElement: React.createElement
        })
        .stringify(codeLinesNode) as any) as JSX.Element;
    const codeLines: JSX.Element[] = codeContainer.props.children;

    const lineCoverage = props.fileCoverage.getLineCoverage();

    let lines: JSX.Element[] = [];
    let hitCountLines: JSX.Element[] = [];
    for (let line = 1; line <= linesCount; line++) {
        lines.push(
            <div key={`line-${line}`} className="line" id={`L${line}`}>
                <a href={`#L${line}`}>{line}</a>
            </div>
        );

        const hitCount = lineCoverage[line];
        const className = classNames("line", {
            covered: hitCount > 0,
            "not-covered": hitCount === 0
        });
        hitCountLines.push(
            <div key={`hit-count-${line}`} className={className}>
                {hitCount != null ? `${hitCount}x` : "\u00A0"}
            </div>
        );
    }

    return (
        <>
            <Styles src="./highlightjs.css" />
            <Styles src="./details.css" />
            <table className="coverage">
                <tbody>
                    <tr>
                        <td className="code-column code-lines-container">{lines}</td>
                        <td className="code-column code-hit-counter">{hitCountLines}</td>
                        <td className="code-column code-container">{codeLines}</td>
                    </tr>
                </tbody>
            </table>
        </>
    );
}
