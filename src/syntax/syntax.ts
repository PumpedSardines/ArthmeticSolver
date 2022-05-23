/**
 * Generates a syntax tree from tokens
 * This entire file is very unsafe, modify with care
 */

import { ErrorType, getErrorText } from "../error/error";
import { LexerToken, LexerTokenFull } from "../lexer/lexer";
import { AllTreePoints, SyntaxToken } from "./types";

type ComboToken = LexerTokenFull | AllTreePoints;

/**
 * Generates a syntax tree from a list of lexer tokens
 * @param tokens - Lexer tokens to generate from
 * @returns A syntax tree of the operations
 */
function syntax(tokens: ComboToken[]): AllTreePoints {
    let newTreePoints: ComboToken[] = JSON.parse(JSON.stringify(tokens));

    if(newTreePoints.length === 1) {
        return singleAny(newTreePoints[0]);
    }

    if (newTreePoints.length === 2) {
        return singleNegation(newTreePoints);
    }

    newTreePoints = evaluateParentheses(newTreePoints);
    newTreePoints = handleNegation(newTreePoints);

    for (const operators of [
        [LexerToken.Addition, LexerToken.Subtraction],
        [LexerToken.Multiplication, LexerToken.Division],
    ]) {
        for (let i = newTreePoints.length - 1; i >= 0; i--) {
            let cur = newTreePoints[i];

            if (!("token" in cur)) {
                continue;
            }

            if (operators.includes(cur.token)) {
                if (i === 0 || i === newTreePoints.length - 1) {
                    throw new Error(
                        getErrorText(
                            ErrorType.Syntax,
                            cur.cl,
                            cur.ln,
                            "unexpected token '" + cur.raw + "'"
                        )
                    );
                }

                const spliceBefore = newTreePoints.splice(0, i);
                const spliceAfter = newTreePoints.splice(
                    1,
                    newTreePoints.length - 1
                );

                return {
                    type: (() => {
                        switch (cur.token) {
                            case LexerToken.Addition:
                                return SyntaxToken.Addition;
                            case LexerToken.Subtraction:
                                return SyntaxToken.Subtraction;
                            case LexerToken.Multiplication:
                                return SyntaxToken.Multiplication;
                            case LexerToken.Division:
                                return SyntaxToken.Division;
                            default:
                                throw new Error(
                                    getErrorText(
                                        ErrorType.Syntax,
                                        cur.cl,
                                        cur.ln,
                                        "Unknown error, unexpected token"
                                    )
                                );
                        }
                    })(),
                    cl: cur.cl,
                    ln: cur.ln,
                    a: syntax(spliceBefore),
                    b: syntax(spliceAfter),
                };
            }
        }
    }

    throw new Error(
        getErrorText(
            ErrorType.Syntax,
            0,
            0,
            "Couldn't parse expression syntax error"
        )
    );
}

/**
 * Loops trough a list of tokens and evaluates all parentheses
 * @param tokens - Tokens list
 */
function evaluateParentheses(tokens: ComboToken[]): ComboToken[] {
    const newTokens: ComboToken[] = JSON.parse(JSON.stringify(tokens));

    let isParentheses = false;
    let startP = 0;
    let paraCount = 0;
    for (let i = 0; i < newTokens.length; i++) {
        const curr = newTokens[i];
        if (!("token" in curr)) {
            continue;
        }

        if (curr.token === LexerToken.LeftParentheses) {
            if (!isParentheses) {
                startP = i;
            }
            isParentheses = true;
            paraCount++;
        }

        if (curr.token === LexerToken.RightParentheses) {
            if (!isParentheses) {
                throw new Error(
                    getErrorText(
                        ErrorType.Syntax,
                        curr.cl,
                        curr.ln,
                        "Unexpected token ')'"
                    )
                );
            }
            paraCount--;

            if (paraCount == 0) {
                // This splices the entire expression with parentheses (3 + 4)
                const splicedTokens = newTokens.splice(startP, i - startP + 1);

                i -= i - startP - 1;

                // This splices the entire expression without parentheses 3 + 4
                let innerTokens = splicedTokens.splice(1, splicedTokens.length - 2);

                const tree = syntax(innerTokens);

                newTokens.splice(startP, 0, tree);

                startP = 0;
                isParentheses = false;
            }
        }
    }

    return newTokens;
}


/**
 * If what was inputted was a single token
 * @param token - The token that is evaluated
 */
function singleAny(token: ComboToken): AllTreePoints {
    if (!("token" in token)) {
        // whas was inputed is an already evaluated expression and can be passed on
        // This case happens if what was inputted was something like ((((3))))
        return token;
    }

    if (token.token !== LexerToken.Number) {
        throw new Error(
            getErrorText(
                ErrorType.Syntax,
                token.cl,
                token.ln,
                "Unexpected token '" + token.raw + "'"
            )
        );
    }

    return {
        type: SyntaxToken.Number,
        cl: token.cl,
        ln: token.ln,
        number: parseFloat(token.raw),
    };
}

/**
 * Verifies double tokens so that it is handled correctly
 *
 * A combination of double tokens can only be a negation, aka -3 or -(561 - 3)
 * This function verifies that what was inputted was a valid negation
 * @param tokens - The tokens to verify
 * @returns A negation token
 */
function singleNegation(tokens: ComboToken[]): AllTreePoints {
    if (tokens.length !== 2) {
        throw new Error(
            getErrorText(
                ErrorType.Syntax,
                0,
                0,
                "Can't handle single negation for token array longer than 2"
            )
        );
    }

    const tokenOne = tokens[0];

    if ("token" in tokenOne) {
        if (tokenOne.token !== LexerToken.Subtraction) {
            throw new Error(
                getErrorText(
                    ErrorType.Syntax,
                    tokenOne.cl,
                    tokenOne.ln,
                    `Unexpected token '${tokenOne.raw}'`
                )
            );
        }

        return {
            type: SyntaxToken.Negate,
            cl: tokenOne.cl,
            ln: tokenOne.ln,
            value: syntax([tokens[1]]),
        };
    } else {
        throw new Error(
            getErrorText(
                ErrorType.Syntax,
                tokenOne.cl,
                tokenOne.ln,
                `Unexpected expression`
            )
        );
    }
}

/**
 * Loops trough and evaluates all expressions that should be negated
 * @param tokens - Tokens that should be evaluated
 * @returns A new token array with negate objects at correct places
 */
function handleNegation(tokens: ComboToken[]): ComboToken[] {
    const newTokens: ComboToken[] = JSON.parse(JSON.stringify(tokens));

    // Find and evaluate negation
    for (let i = 0; i < newTokens.length - 1; i++) {
        const cur = newTokens[i];

        if (!("token" in cur)) {
            continue;
        }

        if (cur.token === LexerToken.Subtraction) {
            const firstOneMatch = (() => {
                if (i === 0) {
                    return true;
                }

                const prev = newTokens[i - 1];
                if (!("token" in prev)) {
                    return false;
                }
                return (
                    [
                        LexerToken.Subtraction,
                        LexerToken.Addition,
                        LexerToken.Multiplication,
                        LexerToken.Division,
                    ].find((v) => v === prev.token) !== undefined
                );
            })();

            const nextOneMatch = (() => {
                const prev = newTokens[i + 1];
                if ("token" in prev) {
                    return prev.token === LexerToken.Number;
                }
                return true;
            })();

            if (firstOneMatch && nextOneMatch) {
                newTokens.splice(
                    i,
                    2,
                    (() => {
                        return {
                            type: SyntaxToken.Negate,
                            cl: cur.cl,
                            ln: cur.ln,
                            value: (() => {
                                const prev = newTokens[i + 1];

                                if ("token" in prev) {
                                    return {
                                        type: SyntaxToken.Number,
                                        cl: prev.cl,
                                        ln: prev.ln,
                                        number: parseFloat(prev.raw),
                                    };
                                }

                                return prev;
                            })(),
                        };
                    })()
                );
            }
        }
    }

    return newTokens;
}

export default syntax;
