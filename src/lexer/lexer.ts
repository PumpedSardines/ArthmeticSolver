/**
 * Generates tokens from an arithmetic input
 */

import { ErrorType, getErrorText } from "../error/error";

export enum LexerToken {
    Addition,
    Subtraction,
    Multiplication,
    Division,
    LeftParentheses,
    RightParentheses,
    Number,
}

export type LexerTokenFull = {
    token: LexerToken;
    raw: string;
    cl: number;
    ln: number;
};

/**
 * Generates a list of tokens from a
 * @param input - The input arithmetic string
 */
function lexer(input: string): LexerTokenFull[] {
    const lines = input.split(/\n\r?/);
    const tokens = [];

    // This algorithm splits first on lines and then on characters on each line
    // So that if an error occurs, line an column can be printed out.

    for (let ln = 0; ln < lines.length; ln++) {
        const chars = lines[ln].split("");

        // This three variables are used to store information if we're currently evaluating a number
        // Since a number can be longer than one char every number character that is encountered needs to be stored

        let begCl = 0; // Keeps count of the beginning column position so that the correct column can be inserted
        let isNum = false; // This keeps track if we're currently evaluating a number
        let numTot = ""; // This keeps track of all numbers we've encountered so far

        for (let cl = 0; cl < chars.length; cl++) {
            if (/[0-9\.]/.test(chars[cl])) {
                if (!isNum) {
                    isNum = true;
                    begCl = cl;
                }
                numTot += chars[cl];
            } else {
                if (isNum) {
                    tokens.push({
                        token: LexerToken.Number,
                        raw: numTot,
                        cl: begCl + 1,
                        ln: ln + 1,
                    });
                    isNum = false;
                    numTot = "";
                }

                if (chars[cl].match(/ |\t/)) {
                    continue;
                }

                const token = (() => {
                    switch (chars[cl]) {
                        case "+":
                            return LexerToken.Addition;
                        case "-":
                            return LexerToken.Subtraction;
                        case "*":
                            return LexerToken.Multiplication;
                        case "/":
                            return LexerToken.Division;
                        case "(":
                            return LexerToken.LeftParentheses;
                        case ")":
                            return LexerToken.RightParentheses;
                        default:
                            throw new Error(
                                getErrorText(
                                    ErrorType.Lexer,
                                    cl + 1,
                                    ln + 1,
                                    "Token '" +
                                        chars[cl] +
                                        "' is not recognized"
                                )
                            );
                    }
                })();
                tokens.push({
                    token: token,
                    raw: chars[cl],
                    cl: cl + 1,
                    ln: ln + 1,
                });
            }
        }

        if (isNum) {
            tokens.push({
                token: LexerToken.Number,
                raw: numTot,
                cl: begCl + 1,
                ln: ln + 1,
            });
        }
    }

    // In the case of empty input and no tokens were generated
    if (tokens.length === 0) {
        throw new Error(
            getErrorText(ErrorType.Lexer, 1, 1, "Input generated zero tokens")
        );
    }

    // Loop through and validate so all numbers are valid numbers.
    for (const token of tokens) {
        const validNumberRegExp = /^\d*\.?\d+$/;

        if (
            token.token === LexerToken.Number &&
            !validNumberRegExp.test(token.raw)
        ) {
            throw new Error(
                getErrorText(
                    ErrorType.Lexer,
                    token.cl,
                    token.ln,
                    `Number ${token.raw} is not a valid number`
                )
            );
        }
    }

    return tokens;
}

export default lexer;
