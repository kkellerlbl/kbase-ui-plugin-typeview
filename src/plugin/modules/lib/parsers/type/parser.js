/*eslint no-control-regex: 0 */
define([], function () {
    'use strict';

    function peg$subclass(child, parent) {
        function ctor() { this.constructor = child; }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
    }

    function peg$SyntaxError(message, expected, found, location) {
        this.message  = message;
        this.expected = expected;
        this.found    = found;
        this.location = location;
        this.name     = 'SyntaxError';

        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, peg$SyntaxError);
        }
    }

    peg$subclass(peg$SyntaxError, Error);

    peg$SyntaxError.buildMessage = function(expected, found) {
        var DESCRIBE_EXPECTATION_FNS = {
            literal: function(expectation) {
                return '"' + literalEscape(expectation.text) + '"';
            },

            'class': function(expectation) {
                var escapedParts = '',
                    i;

                for (i = 0; i < expectation.parts.length; i++) {
                    escapedParts += expectation.parts[i] instanceof Array
                        ? classEscape(expectation.parts[i][0]) + '-' + classEscape(expectation.parts[i][1])
                        : classEscape(expectation.parts[i]);
                }

                return '[' + (expectation.inverted ? '^' : '') + escapedParts + ']';
            },

            any: function(expectation) {
                return 'any character';
            },

            end: function(expectation) {
                return 'end of input';
            },

            other: function(expectation) {
                return expectation.description;
            }
        };

        function hex(ch) {
            return ch.charCodeAt(0).toString(16).toUpperCase();
        }

        function literalEscape(s) {
            return s
                .replace(/\\/g, '\\\\')
                .replace(/"/g,  '\\"')
                .replace(/\0/g, '\\0')
                .replace(/\t/g, '\\t')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
                .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
        }

        function classEscape(s) {
            return s
                .replace(/\\/g, '\\\\')
                .replace(/\]/g, '\\]')
                .replace(/\^/g, '\\^')
                .replace(/-/g,  '\\-')
                .replace(/\0/g, '\\0')
                .replace(/\t/g, '\\t')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
                .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
        }

        function describeExpectation(expectation) {
            return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
        }

        function describeExpected(expected) {
            var descriptions = new Array(expected.length),
                i, j;

            for (i = 0; i < expected.length; i++) {
                descriptions[i] = describeExpectation(expected[i]);
            }

            descriptions.sort();

            if (descriptions.length > 0) {
                for (i = 1, j = 1; i < descriptions.length; i++) {
                    if (descriptions[i - 1] !== descriptions[i]) {
                        descriptions[j] = descriptions[i];
                        j++;
                    }
                }
                descriptions.length = j;
            }

            switch (descriptions.length) {
            case 1:
                return descriptions[0];

            case 2:
                return descriptions[0] + ' or ' + descriptions[1];

            default:
                return descriptions.slice(0, -1).join(', ')
            + ', or '
            + descriptions[descriptions.length - 1];
            }
        }

        function describeFound(found) {
            return found ? '"' + literalEscape(found) + '"' : 'end of input';
        }

        return 'Expected ' + describeExpected(expected) + ' but ' + describeFound(found) + ' found.';
    };

    function peg$parse(input, options) {
        options = options !== void 0 ? options : {};

        var peg$FAILED = {},

            peg$startRuleFunctions = { Start: peg$parseStart },
            peg$startRuleFunction  = peg$parseStart,

            peg$c0 = function(typespec) {return typespec;},
            peg$c1 = function(comments) {return comments;},
            peg$c2 = peg$anyExpectation(),
            peg$c3 = '\n',
            peg$c4 = peg$literalExpectation('\n', false),
            peg$c5 = peg$otherExpectation('whitespace'),
            peg$c6 = '\t',
            peg$c7 = peg$literalExpectation('\t', false),
            peg$c8 = '\x0B',
            peg$c9 = peg$literalExpectation('\x0B', false),
            peg$c10 = '\f',
            peg$c11 = peg$literalExpectation('\f', false),
            peg$c12 = ' ',
            peg$c13 = peg$literalExpectation(' ', false),
            peg$c14 = '\xA0',
            peg$c15 = peg$literalExpectation('\xA0', false),
            peg$c16 = '\uFEFF',
            peg$c17 = peg$literalExpectation('\uFEFF', false),
            peg$c18 = '/*',
            peg$c19 = peg$literalExpectation('/*', false),
            peg$c20 = '*/',
            peg$c21 = peg$literalExpectation('*/', false),
            peg$c22 = function(comment) {return {comment: comment.map(function(c){return c[1];}).join('')};},
            peg$c23 = 'string',
            peg$c24 = peg$literalExpectation('string', false),
            peg$c25 = 'int',
            peg$c26 = peg$literalExpectation('int', false),
            peg$c27 = 'float',
            peg$c28 = peg$literalExpectation('float', false),
            peg$c29 = 'UnspecifiedObject',
            peg$c30 = peg$literalExpectation('UnspecifiedObject', false),
            peg$c31 = 'tuple',
            peg$c32 = peg$literalExpectation('tuple', false),
            peg$c33 = '<',
            peg$c34 = peg$literalExpectation('<', false),
            peg$c35 = ',',
            peg$c36 = peg$literalExpectation(',', false),
            peg$c37 = '>',
            peg$c38 = peg$literalExpectation('>', false),
            peg$c39 = function(value) {
          	return {
                    type: 'tuple',
                    spec: value.map(function (v) {
                        return v[0];
                    })
                };
            },
            peg$c40 = 'list',
            peg$c41 = peg$literalExpectation('list', false),
            peg$c42 = function(value) {
                return {
                    type: 'list',
                    spec: value
                };
            },
            peg$c43 = 'structure',
            peg$c44 = peg$literalExpectation('structure', false),
            peg$c45 = '{',
            peg$c46 = peg$literalExpectation('{', false),
            peg$c47 = '}',
            peg$c48 = peg$literalExpectation('}', false),
            peg$c49 = function(value) {
                return {
                    type: 'structure',
                    spec: value.map(function (v) {
                        return {
                            type: v[1],
                            identifier: v[3]
                        };
                    })
                };
            },
            peg$c50 = 'mapping',
            peg$c51 = peg$literalExpectation('mapping', false),
            peg$c52 = function(key, value) {
                return {
                    type: 'mapping',
                    spec: {
                        keyType: key,
                        valueType: value
                    }
                };
            },
            peg$c53 = '#',
            peg$c54 = peg$literalExpectation('#', false),
            peg$c55 = '.',
            peg$c56 = peg$literalExpectation('.', false),
            peg$c57 = '-',
            peg$c58 = peg$literalExpectation('-', false),
            peg$c59 = /^[0-9]/,
            peg$c60 = peg$classExpectation([['0', '9']], false, false),
            peg$c61 = /^[a-z]/,
            peg$c62 = peg$classExpectation([['a', 'z']], false, false),
            peg$c63 = /^[A-Z]/,
            peg$c64 = peg$classExpectation([['A', 'Z']], false, false),
            peg$c65 = /^[_]/,
            peg$c66 = peg$classExpectation(['_'], false, false),
            peg$c67 = peg$otherExpectation('identifier'),
            peg$c68 = function(value) {return value.join('');},
            peg$c69 = ';',
            peg$c70 = peg$literalExpectation(';', false),
            peg$c71 = 'typedef',
            peg$c72 = peg$literalExpectation('typedef', false),
            peg$c73 = function(type, identifier) {
                return {
                    expression: 'typedef',
                    spec: type,
                    identifier: identifier
                };
            },

            peg$currPos          = 0,
            peg$savedPos         = 0,
            peg$posDetailsCache  = [{ line: 1, column: 1 }],
            peg$maxFailPos       = 0,
            peg$maxFailExpected  = [],
            peg$silentFails      = 0,

            peg$result;

        if ('startRule' in options) {
            if (!(options.startRule in peg$startRuleFunctions)) {
                throw new Error('Can\'t start parsing from rule "' + options.startRule + '".');
            }

            peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
        }

        function text() {
            return input.substring(peg$savedPos, peg$currPos);
        }

        function location() {
            return peg$computeLocation(peg$savedPos, peg$currPos);
        }

        function expected(description, location) {
            location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos);

            throw peg$buildStructuredError(
                [peg$otherExpectation(description)],
                input.substring(peg$savedPos, peg$currPos),
                location
            );
        }

        function error(message, location) {
            location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos);

            throw peg$buildSimpleError(message, location);
        }

        function peg$literalExpectation(text, ignoreCase) {
            return { type: 'literal', text: text, ignoreCase: ignoreCase };
        }

        function peg$classExpectation(parts, inverted, ignoreCase) {
            return { type: 'class', parts: parts, inverted: inverted, ignoreCase: ignoreCase };
        }

        function peg$anyExpectation() {
            return { type: 'any' };
        }

        function peg$endExpectation() {
            return { type: 'end' };
        }

        function peg$otherExpectation(description) {
            return { type: 'other', description: description };
        }

        function peg$computePosDetails(pos) {
            var details = peg$posDetailsCache[pos], p;

            if (details) {
                return details;
            } else {
                p = pos - 1;
                while (!peg$posDetailsCache[p]) {
                    p--;
                }

                details = peg$posDetailsCache[p];
                details = {
                    line:   details.line,
                    column: details.column
                };

                while (p < pos) {
                    if (input.charCodeAt(p) === 10) {
                        details.line++;
                        details.column = 1;
                    } else {
                        details.column++;
                    }

                    p++;
                }

                peg$posDetailsCache[pos] = details;
                return details;
            }
        }

        function peg$computeLocation(startPos, endPos) {
            var startPosDetails = peg$computePosDetails(startPos),
                endPosDetails   = peg$computePosDetails(endPos);

            return {
                start: {
                    offset: startPos,
                    line:   startPosDetails.line,
                    column: startPosDetails.column
                },
                end: {
                    offset: endPos,
                    line:   endPosDetails.line,
                    column: endPosDetails.column
                }
            };
        }

        function peg$fail(expected) {
            if (peg$currPos < peg$maxFailPos) { return; }

            if (peg$currPos > peg$maxFailPos) {
                peg$maxFailPos = peg$currPos;
                peg$maxFailExpected = [];
            }

            peg$maxFailExpected.push(expected);
        }

        function peg$buildSimpleError(message, location) {
            return new peg$SyntaxError(message, null, null, location);
        }

        function peg$buildStructuredError(expected, found, location) {
            return new peg$SyntaxError(
                peg$SyntaxError.buildMessage(expected, found),
                expected,
                found,
                location
            );
        }

        function peg$parseStart() {
            var s0, s1;

            s0 = peg$currPos;
            s1 = peg$parseTypeSpec();
            if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c0(s1);
            }
            s0 = s1;

            return s0;
        }

        function peg$parseTypeSpec() {
            var s0, s1;

            s0 = [];
            s1 = peg$parseStatement();
            while (s1 !== peg$FAILED) {
                s0.push(s1);
                s1 = peg$parseStatement();
            }

            return s0;
        }

        function peg$parseStatement() {
            var s0, s1;

            s0 = peg$currPos;
            s1 = peg$parseComment();
            if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c1(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
                s0 = peg$parseTypedef();
            }

            return s0;
        }

        function peg$parseSourceCharacter() {
            var s0;

            if (input.length > peg$currPos) {
                s0 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c2); }
            }

            return s0;
        }

        function peg$parseEOLN() {
            var s0;

            if (input.charCodeAt(peg$currPos) === 10) {
                s0 = peg$c3;
                peg$currPos++;
            } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c4); }
            }

            return s0;
        }

        function peg$parseW() {
            var s0, s1;

            peg$silentFails++;
            if (input.charCodeAt(peg$currPos) === 9) {
                s0 = peg$c6;
                peg$currPos++;
            } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c7); }
            }
            if (s0 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 11) {
                    s0 = peg$c8;
                    peg$currPos++;
                } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c9); }
                }
                if (s0 === peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 12) {
                        s0 = peg$c10;
                        peg$currPos++;
                    } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c11); }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 32) {
                            s0 = peg$c12;
                            peg$currPos++;
                        } else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c13); }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 160) {
                                s0 = peg$c14;
                                peg$currPos++;
                            } else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c15); }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 65279) {
                                    s0 = peg$c16;
                                    peg$currPos++;
                                } else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$c17); }
                                }
                            }
                        }
                    }
                }
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c5); }
            }

            return s0;
        }

        function peg$parseWEOLN() {
            var s0;

            s0 = peg$parseW();
            if (s0 === peg$FAILED) {
                s0 = peg$parseEOLN();
            }

            return s0;
        }

        function peg$parseSPACE() {
            var s0;

            if (input.charCodeAt(peg$currPos) === 32) {
                s0 = peg$c12;
                peg$currPos++;
            } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c13); }
            }

            return s0;
        }

        function peg$parseComment() {
            var s0, s1, s2, s3, s4, s5;

            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c18) {
                s1 = peg$c18;
                peg$currPos += 2;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c19); }
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$currPos;
                peg$silentFails++;
                if (input.substr(peg$currPos, 2) === peg$c20) {
                    s5 = peg$c20;
                    peg$currPos += 2;
                } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c21); }
                }
                peg$silentFails--;
                if (s5 === peg$FAILED) {
                    s4 = void 0;
                } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                }
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseSourceCharacter();
                    if (s5 !== peg$FAILED) {
                        s4 = [s4, s5];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$currPos;
                    peg$silentFails++;
                    if (input.substr(peg$currPos, 2) === peg$c20) {
                        s5 = peg$c20;
                        peg$currPos += 2;
                    } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c21); }
                    }
                    peg$silentFails--;
                    if (s5 === peg$FAILED) {
                        s4 = void 0;
                    } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                    }
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parseSourceCharacter();
                        if (s5 !== peg$FAILED) {
                            s4 = [s4, s5];
                            s3 = s4;
                        } else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                if (s2 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 2) === peg$c20) {
                        s3 = peg$c20;
                        peg$currPos += 2;
                    } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c21); }
                    }
                    if (s3 !== peg$FAILED) {
                        s4 = peg$parseEOLN();
                        if (s4 === peg$FAILED) {
                            s4 = null;
                        }
                        if (s4 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c22(s2);
                            s0 = s1;
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }

            return s0;
        }

        function peg$parseBuiltinTypeString() {
            var s0;

            if (input.substr(peg$currPos, 6) === peg$c23) {
                s0 = peg$c23;
                peg$currPos += 6;
            } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c24); }
            }

            return s0;
        }

        function peg$parseBuiltinTypeInt() {
            var s0;

            if (input.substr(peg$currPos, 3) === peg$c25) {
                s0 = peg$c25;
                peg$currPos += 3;
            } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c26); }
            }

            return s0;
        }

        function peg$parseBuiltinTypeFloat() {
            var s0;

            if (input.substr(peg$currPos, 5) === peg$c27) {
                s0 = peg$c27;
                peg$currPos += 5;
            } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c28); }
            }

            return s0;
        }

        function peg$parseBuiltinTypeUnspecifiedObject() {
            var s0;

            if (input.substr(peg$currPos, 17) === peg$c29) {
                s0 = peg$c29;
                peg$currPos += 17;
            } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c30); }
            }

            return s0;
        }

        function peg$parseBuiltinSimpleType() {
            var s0;

            s0 = peg$parseBuiltinTypeString();
            if (s0 === peg$FAILED) {
                s0 = peg$parseBuiltinTypeInt();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseBuiltinTypeFloat();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parseBuiltinTypeUnspecifiedObject();
                    }
                }
            }

            return s0;
        }

        function peg$parseBuiltinTupleType() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

            s0 = peg$currPos;
            if (input.substr(peg$currPos, 5) === peg$c31) {
                s1 = peg$c31;
                peg$currPos += 5;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c32); }
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseW();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseW();
                }
                if (s2 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 60) {
                        s3 = peg$c33;
                        peg$currPos++;
                    } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c34); }
                    }
                    if (s3 !== peg$FAILED) {
                        s4 = [];
                        s5 = peg$currPos;
                        s6 = peg$parseType();
                        if (s6 !== peg$FAILED) {
                            s7 = [];
                            s8 = peg$parseW();
                            while (s8 !== peg$FAILED) {
                                s7.push(s8);
                                s8 = peg$parseW();
                            }
                            if (s7 !== peg$FAILED) {
                                s8 = [];
                                if (input.charCodeAt(peg$currPos) === 44) {
                                    s9 = peg$c35;
                                    peg$currPos++;
                                } else {
                                    s9 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$c36); }
                                }
                                while (s9 !== peg$FAILED) {
                                    s8.push(s9);
                                    if (input.charCodeAt(peg$currPos) === 44) {
                                        s9 = peg$c35;
                                        peg$currPos++;
                                    } else {
                                        s9 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$c36); }
                                    }
                                }
                                if (s8 !== peg$FAILED) {
                                    s9 = [];
                                    s10 = peg$parseW();
                                    while (s10 !== peg$FAILED) {
                                        s9.push(s10);
                                        s10 = peg$parseW();
                                    }
                                    if (s9 !== peg$FAILED) {
                                        s6 = [s6, s7, s8, s9];
                                        s5 = s6;
                                    } else {
                                        peg$currPos = s5;
                                        s5 = peg$FAILED;
                                    }
                                } else {
                                    peg$currPos = s5;
                                    s5 = peg$FAILED;
                                }
                            } else {
                                peg$currPos = s5;
                                s5 = peg$FAILED;
                            }
                        } else {
                            peg$currPos = s5;
                            s5 = peg$FAILED;
                        }
                        if (s5 !== peg$FAILED) {
                            while (s5 !== peg$FAILED) {
                                s4.push(s5);
                                s5 = peg$currPos;
                                s6 = peg$parseType();
                                if (s6 !== peg$FAILED) {
                                    s7 = [];
                                    s8 = peg$parseW();
                                    while (s8 !== peg$FAILED) {
                                        s7.push(s8);
                                        s8 = peg$parseW();
                                    }
                                    if (s7 !== peg$FAILED) {
                                        s8 = [];
                                        if (input.charCodeAt(peg$currPos) === 44) {
                                            s9 = peg$c35;
                                            peg$currPos++;
                                        } else {
                                            s9 = peg$FAILED;
                                            if (peg$silentFails === 0) { peg$fail(peg$c36); }
                                        }
                                        while (s9 !== peg$FAILED) {
                                            s8.push(s9);
                                            if (input.charCodeAt(peg$currPos) === 44) {
                                                s9 = peg$c35;
                                                peg$currPos++;
                                            } else {
                                                s9 = peg$FAILED;
                                                if (peg$silentFails === 0) { peg$fail(peg$c36); }
                                            }
                                        }
                                        if (s8 !== peg$FAILED) {
                                            s9 = [];
                                            s10 = peg$parseW();
                                            while (s10 !== peg$FAILED) {
                                                s9.push(s10);
                                                s10 = peg$parseW();
                                            }
                                            if (s9 !== peg$FAILED) {
                                                s6 = [s6, s7, s8, s9];
                                                s5 = s6;
                                            } else {
                                                peg$currPos = s5;
                                                s5 = peg$FAILED;
                                            }
                                        } else {
                                            peg$currPos = s5;
                                            s5 = peg$FAILED;
                                        }
                                    } else {
                                        peg$currPos = s5;
                                        s5 = peg$FAILED;
                                    }
                                } else {
                                    peg$currPos = s5;
                                    s5 = peg$FAILED;
                                }
                            }
                        } else {
                            s4 = peg$FAILED;
                        }
                        if (s4 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 62) {
                                s5 = peg$c37;
                                peg$currPos++;
                            } else {
                                s5 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c38); }
                            }
                            if (s5 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$c39(s4);
                                s0 = s1;
                            } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }

            return s0;
        }

        function peg$parseBuiltinListType() {
            var s0, s1, s2, s3, s4, s5, s6, s7;

            s0 = peg$currPos;
            if (input.substr(peg$currPos, 4) === peg$c40) {
                s1 = peg$c40;
                peg$currPos += 4;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c41); }
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseW();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseW();
                }
                if (s2 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 60) {
                        s3 = peg$c33;
                        peg$currPos++;
                    } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c34); }
                    }
                    if (s3 !== peg$FAILED) {
                        s4 = [];
                        s5 = peg$parseW();
                        while (s5 !== peg$FAILED) {
                            s4.push(s5);
                            s5 = peg$parseW();
                        }
                        if (s4 !== peg$FAILED) {
                            s5 = peg$parseType();
                            if (s5 !== peg$FAILED) {
                                s6 = [];
                                s7 = peg$parseW();
                                while (s7 !== peg$FAILED) {
                                    s6.push(s7);
                                    s7 = peg$parseW();
                                }
                                if (s6 !== peg$FAILED) {
                                    if (input.charCodeAt(peg$currPos) === 62) {
                                        s7 = peg$c37;
                                        peg$currPos++;
                                    } else {
                                        s7 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$c38); }
                                    }
                                    if (s7 !== peg$FAILED) {
                                        peg$savedPos = s0;
                                        s1 = peg$c42(s5);
                                        s0 = s1;
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }

            return s0;
        }

        function peg$parseBuiltinStructType() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

            s0 = peg$currPos;
            if (input.substr(peg$currPos, 9) === peg$c43) {
                s1 = peg$c43;
                peg$currPos += 9;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c44); }
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseW();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseW();
                }
                if (s2 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 123) {
                        s3 = peg$c45;
                        peg$currPos++;
                    } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c46); }
                    }
                    if (s3 !== peg$FAILED) {
                        s4 = [];
                        s5 = peg$currPos;
                        s6 = [];
                        s7 = peg$parseWEOLN();
                        while (s7 !== peg$FAILED) {
                            s6.push(s7);
                            s7 = peg$parseWEOLN();
                        }
                        if (s6 !== peg$FAILED) {
                            s7 = peg$parseType();
                            if (s7 !== peg$FAILED) {
                                s8 = [];
                                s9 = peg$parseWEOLN();
                                if (s9 !== peg$FAILED) {
                                    while (s9 !== peg$FAILED) {
                                        s8.push(s9);
                                        s9 = peg$parseWEOLN();
                                    }
                                } else {
                                    s8 = peg$FAILED;
                                }
                                if (s8 !== peg$FAILED) {
                                    s9 = peg$parseIdentifier();
                                    if (s9 !== peg$FAILED) {
                                        s10 = [];
                                        s11 = peg$parseWEOLN();
                                        while (s11 !== peg$FAILED) {
                                            s10.push(s11);
                                            s11 = peg$parseWEOLN();
                                        }
                                        if (s10 !== peg$FAILED) {
                                            s11 = peg$parseLineTerminator();
                                            if (s11 !== peg$FAILED) {
                                                s6 = [s6, s7, s8, s9, s10, s11];
                                                s5 = s6;
                                            } else {
                                                peg$currPos = s5;
                                                s5 = peg$FAILED;
                                            }
                                        } else {
                                            peg$currPos = s5;
                                            s5 = peg$FAILED;
                                        }
                                    } else {
                                        peg$currPos = s5;
                                        s5 = peg$FAILED;
                                    }
                                } else {
                                    peg$currPos = s5;
                                    s5 = peg$FAILED;
                                }
                            } else {
                                peg$currPos = s5;
                                s5 = peg$FAILED;
                            }
                        } else {
                            peg$currPos = s5;
                            s5 = peg$FAILED;
                        }
                        if (s5 !== peg$FAILED) {
                            while (s5 !== peg$FAILED) {
                                s4.push(s5);
                                s5 = peg$currPos;
                                s6 = [];
                                s7 = peg$parseWEOLN();
                                while (s7 !== peg$FAILED) {
                                    s6.push(s7);
                                    s7 = peg$parseWEOLN();
                                }
                                if (s6 !== peg$FAILED) {
                                    s7 = peg$parseType();
                                    if (s7 !== peg$FAILED) {
                                        s8 = [];
                                        s9 = peg$parseWEOLN();
                                        if (s9 !== peg$FAILED) {
                                            while (s9 !== peg$FAILED) {
                                                s8.push(s9);
                                                s9 = peg$parseWEOLN();
                                            }
                                        } else {
                                            s8 = peg$FAILED;
                                        }
                                        if (s8 !== peg$FAILED) {
                                            s9 = peg$parseIdentifier();
                                            if (s9 !== peg$FAILED) {
                                                s10 = [];
                                                s11 = peg$parseWEOLN();
                                                while (s11 !== peg$FAILED) {
                                                    s10.push(s11);
                                                    s11 = peg$parseWEOLN();
                                                }
                                                if (s10 !== peg$FAILED) {
                                                    s11 = peg$parseLineTerminator();
                                                    if (s11 !== peg$FAILED) {
                                                        s6 = [s6, s7, s8, s9, s10, s11];
                                                        s5 = s6;
                                                    } else {
                                                        peg$currPos = s5;
                                                        s5 = peg$FAILED;
                                                    }
                                                } else {
                                                    peg$currPos = s5;
                                                    s5 = peg$FAILED;
                                                }
                                            } else {
                                                peg$currPos = s5;
                                                s5 = peg$FAILED;
                                            }
                                        } else {
                                            peg$currPos = s5;
                                            s5 = peg$FAILED;
                                        }
                                    } else {
                                        peg$currPos = s5;
                                        s5 = peg$FAILED;
                                    }
                                } else {
                                    peg$currPos = s5;
                                    s5 = peg$FAILED;
                                }
                            }
                        } else {
                            s4 = peg$FAILED;
                        }
                        if (s4 !== peg$FAILED) {
                            s5 = [];
                            s6 = peg$parseWEOLN();
                            while (s6 !== peg$FAILED) {
                                s5.push(s6);
                                s6 = peg$parseWEOLN();
                            }
                            if (s5 !== peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 125) {
                                    s6 = peg$c47;
                                    peg$currPos++;
                                } else {
                                    s6 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$c48); }
                                }
                                if (s6 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$c49(s4);
                                    s0 = s1;
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }

            return s0;
        }

        function peg$parseBuiltinMappingType() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

            s0 = peg$currPos;
            if (input.substr(peg$currPos, 7) === peg$c50) {
                s1 = peg$c50;
                peg$currPos += 7;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c51); }
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseW();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseW();
                }
                if (s2 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 60) {
                        s3 = peg$c33;
                        peg$currPos++;
                    } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c34); }
                    }
                    if (s3 !== peg$FAILED) {
                        s4 = [];
                        s5 = peg$parseW();
                        while (s5 !== peg$FAILED) {
                            s4.push(s5);
                            s5 = peg$parseW();
                        }
                        if (s4 !== peg$FAILED) {
                            s5 = peg$parseType();
                            if (s5 !== peg$FAILED) {
                                s6 = [];
                                s7 = peg$parseW();
                                while (s7 !== peg$FAILED) {
                                    s6.push(s7);
                                    s7 = peg$parseW();
                                }
                                if (s6 !== peg$FAILED) {
                                    if (input.charCodeAt(peg$currPos) === 44) {
                                        s7 = peg$c35;
                                        peg$currPos++;
                                    } else {
                                        s7 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$c36); }
                                    }
                                    if (s7 !== peg$FAILED) {
                                        s8 = [];
                                        s9 = peg$parseW();
                                        while (s9 !== peg$FAILED) {
                                            s8.push(s9);
                                            s9 = peg$parseW();
                                        }
                                        if (s8 !== peg$FAILED) {
                                            s9 = peg$parseType();
                                            if (s9 !== peg$FAILED) {
                                                if (input.charCodeAt(peg$currPos) === 62) {
                                                    s10 = peg$c37;
                                                    peg$currPos++;
                                                } else {
                                                    s10 = peg$FAILED;
                                                    if (peg$silentFails === 0) { peg$fail(peg$c38); }
                                                }
                                                if (s10 !== peg$FAILED) {
                                                    peg$savedPos = s0;
                                                    s1 = peg$c52(s5, s9);
                                                    s0 = s1;
                                                } else {
                                                    peg$currPos = s0;
                                                    s0 = peg$FAILED;
                                                }
                                            } else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        } else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }

            return s0;
        }

        function peg$parseReferenceType() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 35) {
                s1 = peg$c53;
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c54); }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseIdentifier();
                if (s2 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 46) {
                        s3 = peg$c55;
                        peg$currPos++;
                    } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c56); }
                    }
                    if (s3 !== peg$FAILED) {
                        s4 = peg$parseIdentifier();
                        if (s4 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 45) {
                                s5 = peg$c57;
                                peg$currPos++;
                            } else {
                                s5 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c58); }
                            }
                            if (s5 !== peg$FAILED) {
                                s6 = peg$parseInteger();
                                if (s6 !== peg$FAILED) {
                                    if (input.charCodeAt(peg$currPos) === 46) {
                                        s7 = peg$c55;
                                        peg$currPos++;
                                    } else {
                                        s7 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$c56); }
                                    }
                                    if (s7 !== peg$FAILED) {
                                        s8 = peg$parseInteger();
                                        if (s8 !== peg$FAILED) {
                                            if (input.charCodeAt(peg$currPos) === 35) {
                                                s9 = peg$c53;
                                                peg$currPos++;
                                            } else {
                                                s9 = peg$FAILED;
                                                if (peg$silentFails === 0) { peg$fail(peg$c54); }
                                            }
                                            if (s9 !== peg$FAILED) {
                                                s1 = [s1, s2, s3, s4, s5, s6, s7, s8, s9];
                                                s0 = s1;
                                            } else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        } else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }

            return s0;
        }

        function peg$parseType() {
            var s0;

            s0 = peg$parseBuiltinListType();
            if (s0 === peg$FAILED) {
                s0 = peg$parseBuiltinTupleType();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseBuiltinStructType();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parseBuiltinMappingType();
                        if (s0 === peg$FAILED) {
                            s0 = peg$parseBuiltinSimpleType();
                            if (s0 === peg$FAILED) {
                                s0 = peg$parseReferenceType();
                                if (s0 === peg$FAILED) {
                                    s0 = peg$parseIdentifier();
                                }
                            }
                        }
                    }
                }
            }

            return s0;
        }

        function peg$parseInteger() {
            var s0, s1;

            s0 = [];
            if (peg$c59.test(input.charAt(peg$currPos))) {
                s1 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c60); }
            }
            if (s1 !== peg$FAILED) {
                while (s1 !== peg$FAILED) {
                    s0.push(s1);
                    if (peg$c59.test(input.charAt(peg$currPos))) {
                        s1 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c60); }
                    }
                }
            } else {
                s0 = peg$FAILED;
            }

            return s0;
        }

        function peg$parseIdentifierCharacter() {
            var s0;

            if (peg$c61.test(input.charAt(peg$currPos))) {
                s0 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c62); }
            }
            if (s0 === peg$FAILED) {
                if (peg$c63.test(input.charAt(peg$currPos))) {
                    s0 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c64); }
                }
                if (s0 === peg$FAILED) {
                    if (peg$c59.test(input.charAt(peg$currPos))) {
                        s0 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c60); }
                    }
                    if (s0 === peg$FAILED) {
                        if (peg$c65.test(input.charAt(peg$currPos))) {
                            s0 = input.charAt(peg$currPos);
                            peg$currPos++;
                        } else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c66); }
                        }
                    }
                }
            }

            return s0;
        }

        function peg$parseIdentifier() {
            var s0, s1, s2;

            peg$silentFails++;
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parseIdentifierCharacter();
            if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    s2 = peg$parseIdentifierCharacter();
                }
            } else {
                s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c68(s1);
            }
            s0 = s1;
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c67); }
            }

            return s0;
        }

        function peg$parseLineTerminator() {
            var s0;

            if (input.charCodeAt(peg$currPos) === 59) {
                s0 = peg$c69;
                peg$currPos++;
            } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c70); }
            }

            return s0;
        }

        function peg$parseTypedefKeyword() {
            var s0;

            if (input.substr(peg$currPos, 7) === peg$c71) {
                s0 = peg$c71;
                peg$currPos += 7;
            } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c72); }
            }

            return s0;
        }

        function peg$parseTypedef() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

            s0 = peg$currPos;
            s1 = peg$parseTypedefKeyword();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseW();
                if (s3 !== peg$FAILED) {
                    while (s3 !== peg$FAILED) {
                        s2.push(s3);
                        s3 = peg$parseW();
                    }
                } else {
                    s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                    s3 = peg$parseType();
                    if (s3 !== peg$FAILED) {
                        s4 = [];
                        s5 = peg$parseW();
                        if (s5 !== peg$FAILED) {
                            while (s5 !== peg$FAILED) {
                                s4.push(s5);
                                s5 = peg$parseW();
                            }
                        } else {
                            s4 = peg$FAILED;
                        }
                        if (s4 !== peg$FAILED) {
                            s5 = peg$parseIdentifier();
                            if (s5 !== peg$FAILED) {
                                s6 = [];
                                s7 = peg$parseW();
                                while (s7 !== peg$FAILED) {
                                    s6.push(s7);
                                    s7 = peg$parseW();
                                }
                                if (s6 !== peg$FAILED) {
                                    s7 = peg$parseLineTerminator();
                                    if (s7 !== peg$FAILED) {
                                        s8 = [];
                                        s9 = peg$parseEOLN();
                                        while (s9 !== peg$FAILED) {
                                            s8.push(s9);
                                            s9 = peg$parseEOLN();
                                        }
                                        if (s8 !== peg$FAILED) {
                                            peg$savedPos = s0;
                                            s1 = peg$c73(s3, s5);
                                            s0 = s1;
                                        } else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }

            return s0;
        }

        peg$result = peg$startRuleFunction();

        if (peg$result !== peg$FAILED && peg$currPos === input.length) {
            return peg$result;
        } else {
            if (peg$result !== peg$FAILED && peg$currPos < input.length) {
                peg$fail(peg$endExpectation());
            }

            throw peg$buildStructuredError(
                peg$maxFailExpected,
                peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
                peg$maxFailPos < input.length
                    ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
                    : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
            );
        }
    }

    return {
        SyntaxError: peg$SyntaxError,
        parse:       peg$parse
    };
});
