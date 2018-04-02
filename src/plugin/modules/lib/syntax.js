define([
    'highlight'
], function(
    hljs
) {
    'use strict';

    hljs.registerLanguage('kidl', () => {
        return {
            case_insensitive: false,
            keywords: {
                keyword: 'module typedef funcdef authentication returns',
                builtin: 'string int float UnspecifiedObject list mapping structure tuple'
            },
            contains: [
                hljs.C_BLOCK_COMMENT_MODE
                // hljs.COMMENT(
                //     '/\\*', // begin
                //     '\\*/' // end
                // )
            ]
        };
    });
    // PR.registerLangHandler(
    //     PR.createSimpleLexer(
    //         [
    //             // Whitespace
    //             [PR.PR_PLAIN, /^[\t\n\r \xA0]+/, null, '\t\n\r \xA0'],
    //             // A double or single quoted, possibly multi-line, string.
    //             /* TODO: test and fix this ... I don't think this works 
    //              * TODO: and also the jslint warnings about ^ and . should be heeded
    //              *   http://stackoverflow.com/questions/3039955/jslint-reports-insecure-for-my-regex-what-does-that-mean
    //              *   */
    //             [PR.PR_STRING, /^(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/, null,
    //                 '"\''
    //             ]
    //         ], [
    //             [PR.PR_COMMENT, /^(?:\/\*[\s\S]*?(?:\*\/|$))/],
    //             [PR.PR_KEYWORD, /^\b(?:module|typedef|funcdef|authentication|returns)\b/, null],
    //             // A number is a hex integer literal, a decimal real literal, or in
    //             // scientific notation.
    //             [PR.PR_LITERAL,
    //                 /^\b(?:string|int|float|UnspecifiedObject|list|mapping|structure|tuple)\b/
    //             ],
    //             // An identifier
    //             [PR.PR_PLAIN, /^[a-z_][\w-]*/i],
    //             // A run of punctuation
    //             [PR.PR_PUNCTUATION, /^[^\w\t\n\r \xA0"'][^\w\t\n\r \xA0+\-"']*/]
    //         ]), ['spec']);

    const linkRegex = /#(.+?)\.(.+?)-(.+?)\.(.+?)#/g;

    function replaceMarkedTypeLinksInSpec(curModule, specText) {
        return specText.replace(linkRegex, '<a href=#spec/type/$1.$2-$3.$4>$2</a>');
    }

    let lastGeneratedSpecPrefix = 0;

    var generateSpecPrefix = function() {
        lastGeneratedSpecPrefix += 1;
        return lastGeneratedSpecPrefix;
    };

    function highlightKIDL(input) {
        return hljs.highlight('kidl', input);
    }

    return {
        highlightKIDL,
        replaceMarkedTypeLinksInSpec,
        generateSpecPrefix
    };

});