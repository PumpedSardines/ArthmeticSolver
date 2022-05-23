export enum SyntaxToken {
    Addition = "add",
    Subtraction = "sub",
    Multiplication = "mul",
    Division = "div",
    Negate = "neg",
    Number = "num",
}

export type TreePoint<T extends SyntaxToken> = {
    type: T;
    cl: number;
    ln: number;
};

// Recursive types are dumb
// You can't move these objects outside from here
// Because then typescript will whine about "circular dependencies"
export type AllTreePoints =
    | (TreePoint<SyntaxToken.Addition> & {
          a: AllTreePoints;
          b: AllTreePoints;
      })
    | (TreePoint<SyntaxToken.Subtraction> & {
          a: AllTreePoints;
          b: AllTreePoints;
      })
    | (TreePoint<SyntaxToken.Multiplication> & {
          a: AllTreePoints;
          b: AllTreePoints;
      })
    | (TreePoint<SyntaxToken.Division> & {
          a: AllTreePoints;
          b: AllTreePoints;
      })
    | (TreePoint<SyntaxToken.Negate> & {
          value: AllTreePoints;
      })
    | (TreePoint<SyntaxToken.Number> & {
          number: number;
      });
