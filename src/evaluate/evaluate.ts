import { AllTreePoints, SyntaxToken } from "../syntax/types";

function evaluate(syntax: AllTreePoints): number {
    switch(syntax.type) {
        case SyntaxToken.Number: {
            return syntax.number;
        }
        case SyntaxToken.Addition: {
            return evaluate(syntax.a) + evaluate(syntax.b);
        }
        case SyntaxToken.Subtraction: {
            return evaluate(syntax.a) - evaluate(syntax.b);
        }
        case SyntaxToken.Division: {
            return evaluate(syntax.a) / evaluate(syntax.b);
        }
        case SyntaxToken.Multiplication: {
            return evaluate(syntax.a) * evaluate(syntax.b);
        }
        case SyntaxToken.Negate: {
            return evaluate(syntax.value) * -1;
        }
    }
}

export default evaluate