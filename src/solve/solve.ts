import evaluate from "../evaluate/evaluate";
import lexer from "../lexer/lexer";
import syntax from "../syntax/syntax";


function solve(inp: string): number {
    return evaluate(syntax(lexer(inp)));
}

export default solve;