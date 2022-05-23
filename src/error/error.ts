import chalk from "chalk";

export enum ErrorType {
    Lexer = "LEXER",
    Syntax = "SYNTAX",
}

/**
 * Generates a error string
 * @param type - The type of error
 * @param cl - Column
 * @param ln - Line
 * @param text - Error description
 */
export function getErrorText(type: ErrorType, cl: number, ln: number, text: string): string {
    const color = (() => {
        switch(type) {
            case ErrorType.Lexer:
                return chalk.blue
            case ErrorType.Syntax:
                return chalk.green
        }
    })();

    return `${chalk.red("ERROR")} [${color(type)}] (ln: ${ln}, cl: ${cl}): ${text}`
}