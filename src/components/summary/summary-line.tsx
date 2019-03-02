import React from "react";
import classNames from "classnames";
import { CoverageSummary, Totals } from "istanbul-lib-coverage";
import { getClassNameByPercentage } from "../helpers";

function MetricsColumns({ metrics }: { metrics: Totals }): JSX.Element {
    return (
        <>
            <td className={getClassNameByPercentage(metrics.pct)}>{metrics.pct}%</td>
            <td className={getClassNameByPercentage(metrics.pct)}>
                {metrics.covered}/{metrics.total}
            </td>
        </>
    );
}

interface Props {
    fileName: string;
    filePath: string;
    coverageSummary: CoverageSummary;
}

export function SummaryLine({ fileName, filePath, coverageSummary }: Props): JSX.Element {
    const overallPct = coverageSummary.statements.pct;
    return (
        <tr>
            <td className={getClassNameByPercentage(coverageSummary.statements.pct)}>
                <a href={filePath}>{fileName}</a>
            </td>
            <td className={getClassNameByPercentage(coverageSummary.statements.pct)}>
                <div className={classNames("chart", getClassNameByPercentage(coverageSummary.statements.pct))}>
                    <div className="cover-fill" style={{ width: `${overallPct}%` }} />
                    <div className="cover-empty" style={{ width: `${100 - overallPct}%` }} />
                </div>
            </td>
            <MetricsColumns metrics={coverageSummary.statements} />
            <MetricsColumns metrics={coverageSummary.branches} />
            <MetricsColumns metrics={coverageSummary.functions} />
            <MetricsColumns metrics={coverageSummary.lines} />
        </tr>
    );
}
