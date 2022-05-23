import lexer from "../lexer/lexer";
import syntax from "../syntax/syntax";
import solve from "./solve";

test.each([
    ["3 + 2", 3 + 2],
    ["3 + 2 - 4", 3 + 2 - 4],
    ["3.1415 * 47", 3.1415 * 47],
    ["(0 - 3) * 4", -3 * 4],
    ["-(-3 + 4 * 7) * 66 - 3", -(-3 + 4 * 7) * 66 - 3],
    ["(123) - (4 - -323)", (123) - (4 - -323)],
    ["3 * -(-1)", 3],
    ["-2", -2],
] as [string, number][])("%p", (inp, out) => {
    expect(solve(inp)).toBe(out);
});
