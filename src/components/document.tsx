import React from "react";

interface Props {
    title: string;
    children: React.ReactNode;
}

export function Document(props: Props): JSX.Element {
    return (
        <html>
            <head>
                <title>{props.title}</title>
                <meta charSet="utf-8" />
            </head>
            <body>{props.children}</body>
        </html>
    );
}
