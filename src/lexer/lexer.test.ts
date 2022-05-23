import lexer, { LexerToken } from "./lexer";

describe("Lex correctly", () => {
    test("3 + 4", () => {
        const tokens = lexer("3 + 4");

        expect(tokens).toHaveLength(3);

        expect(tokens[0]).toMatchObject({
            token: LexerToken.Number,
            raw: "3",
            cl: 1,
            ln: 1,
        });

        expect(tokens[1]).toMatchObject({
            token: LexerToken.Addition,
            raw: "+",
            cl: 3,
            ln: 1,
        });

        expect(tokens[2]).toMatchObject({
            token: LexerToken.Number,
            raw: "4",
            cl: 5,
            ln: 1,
        });
    });

    test(`(4.4 + 3) / 6`, () => {
        const tokens = lexer(`(44.5 + 3) / 6`);

        expect(tokens).toHaveLength(7);

        expect(tokens[0]).toMatchObject({
            token: LexerToken.LeftParentheses,
            raw: "(",
            cl: 1,
            ln: 1,
        });

        expect(tokens[1]).toMatchObject({
            token: LexerToken.Number,
            raw: "44.5",
            cl: 2,
            ln: 1,
        });

        expect(tokens[2]).toMatchObject({
            token: LexerToken.Addition,
            raw: "+",
            cl: 7,
            ln: 1,
        });
    });
});

describe("Throws", () => {
    test.each([
        "asdasf",
        "987sughfoas(++-+-+-+)",
        "",
        "     ",
        "\n \n \n asdasof",
    ])("%p", (v) => {
        expect(() => lexer(v)).toThrow();
    });

    test.each(["4.412.123", "3.32.4 + 4.32"])("%p", (v) => {
        expect(() => lexer(v)).toThrow();
    });
});
