import React from "react";
import fs from "fs";
import path from "path";

const _fileCache: { [scr: string]: string } = {};

function getFile(src: string): string {
    if (_fileCache[src] == null) {
        _fileCache[src] = fs.readFileSync(path.resolve(__dirname, "../../dist/styles", src), "utf8");
    }

    return _fileCache[src];
}

interface Props {
    src: string;
}

export function Styles(props: Props): JSX.Element {
    const styles = getFile(props.src);
    return <style data-file={props.src} dangerouslySetInnerHTML={{ __html: styles }} />;
}
