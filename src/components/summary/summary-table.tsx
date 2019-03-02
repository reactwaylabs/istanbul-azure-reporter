import React from "react";
import { Styles } from "../styles";

interface Props {
    children: React.ReactNode;
}

export function SummaryTable(props: Props): JSX.Element {
    return (
        <>
            <Styles src="./summary.css" />
            <table className="coverage-summary">
                <thead>
                    <tr>
                        <th>File</th>
                        <th />
                        <th>Statements</th>
                        <th />
                        <th>Branches</th>
                        <th />
                        <th>Functions</th>
                        <th />
                        <th>Lines</th>
                        <th />
                    </tr>
                </thead>
                <tbody>{props.children}</tbody>
            </table>
        </>
    );
}
