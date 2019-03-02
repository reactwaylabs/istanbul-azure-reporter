import React from "react";
import ReactDOMServer from "react-dom/server";
import path from "path";
import { Visitor, Node, Context } from "istanbul-lib-report";

import { LinkMapper } from "./link-mapper";

import { Layout } from "./components/layout";
import { SummaryTable, SummaryLine } from "./components/summary";
import { DetailsCodeView } from "./components/details/details-code-view";
import { Link } from "./contracts";

export class AzureReporter implements Visitor {
    private datetime: string = new Date().toString();
    private readonly outputFolder: string = "html/";

    private resolveBreadcrumbsLinks(node: Node): Link[] {
        let parent: Node | undefined = node.getParent();
        const ancestors: Node[] = [];

        while (parent != null) {
            ancestors.push(parent);
            parent = parent.getParent();
        }

        const links: Link[] = ancestors
            .map<Link>(ancestor => {
                const name = ancestor.getRelativeName() || "All files";
                const url = LinkMapper.relativePath(node, ancestor);

                return {
                    name: name,
                    url: url
                };
            })
            .reverse();

        if (links.length > 0) {
            links.push({
                name: node.getRelativeName(),
                url: null
            });
        }

        return links;
    }

    public onSummary(root: Node, state: Context): void {
        const summaryFilePath = LinkMapper.getPath(root);
        const summaryFileName = path.basename(summaryFilePath, path.extname(summaryFilePath));
        const breadcrumbs: Link[] = this.resolveBreadcrumbsLinks(root);

        const summaryLines: JSX.Element[] = [];
        for (const child of root.getChildren()) {
            const metrics = child.getCoverageSummary(false);
            const fileName: string = child.getRelativeName();
            const filePath: string = LinkMapper.relativePath(root, child);

            summaryLines.push(<SummaryLine key={fileName} fileName={fileName} filePath={filePath} coverageSummary={metrics} />);
        }

        const page = (
            <Layout title={summaryFileName} breadcrumbs={breadcrumbs} datetime={this.datetime} coverage={root.getCoverageSummary(false)}>
                <SummaryTable>{summaryLines}</SummaryTable>
            </Layout>
        );

        const cw = state.writer.writeFile(path.join(this.outputFolder, summaryFilePath));
        cw.write(ReactDOMServer.renderToStaticMarkup(page));
        cw.close();
    }

    public onDetail(root: Node, state: Context): void {
        const filePath = LinkMapper.getPath(root);
        const fileCoverage = root.getFileCoverage();
        const fileName = path.basename(filePath, path.extname(filePath));
        const sourceFile = state.sourceFinder(fileCoverage.path);
        const breadcrumbs: Link[] = this.resolveBreadcrumbsLinks(root);

        const page = (
            <Layout title={fileName} breadcrumbs={breadcrumbs} datetime={this.datetime} coverage={root.getCoverageSummary(false)}>
                <DetailsCodeView fileContents={sourceFile} fileCoverage={fileCoverage} fileExtension={path.extname(fileName)} />
            </Layout>
        );

        const cw = state.writer.writeFile(path.join(this.outputFolder, filePath));
        cw.write(ReactDOMServer.renderToStaticMarkup(page));
        cw.close();
    }

    public onStart(root: Node, state: Context): void {}
    public onSummaryEnd(root: Node, state: Context): void {}
    public onEnd(root: Node, state: Context): void {}
}
