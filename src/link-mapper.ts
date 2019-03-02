import path from "path";
import { Node } from "istanbul-lib-report";

export class LinkMapper {
    public static getPath(node: Node | string) {
        if (typeof node === "string") {
            return node;
        }

        let filePath = node.getQualifiedName();
        if (node.isSummary()) {
            if (filePath !== "") {
                filePath += "/index.html";
            } else {
                filePath = "index.html";
            }
        } else {
            filePath += ".html";
        }
        return filePath;
    }

    public static relativePath(source: Node | string, target: Node | string) {
        const targetPath = this.getPath(target);
        const sourcePath = path.dirname(this.getPath(source));

        return path.relative(sourcePath, targetPath);
    }

    public static assetPath(node: Node, name: string) {
        return this.relativePath(this.getPath(node), name);
    }
}
