export const matchAll = (pattern: string, text: string, flags: string = ""): Array<RegExpMatchArray> => {
    const regex = new RegExp(pattern, "g" + flags.replace("g", ""));
    const result: Array<RegExpMatchArray> = [];
    while (true) {
        const matches = regex.exec(text);
        if (matches === null) {
            break;
        }
        result.push(matches);
    }
    return result;
};

export const NEWLINE_PATTERN = "(\\r\\n|\\n)";
