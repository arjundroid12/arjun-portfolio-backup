// Replicate the calculator's evaluate function to test it
"use strict";

const OPERATORS = new Set(["+", "-", "*", "/"]);

const tokenize = (expr) => {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (c === " ") {
      i++;
      continue;
    }
    if (OPERATORS.has(c)) {
      if (
        c === "-" &&
        (tokens.length === 0 ||
          (tokens[tokens.length - 1] &&
            OPERATORS.has(tokens[tokens.length - 1].value)))
      ) {
        let num = "-";
        i++;
        while (i < expr.length && /[0-9.]/.test(expr[i])) {
          num += expr[i];
          i++;
        }
        tokens.push({ type: "number", value: parseFloat(num) });
      } else {
        tokens.push({ type: "operator", value: c });
        i++;
      }
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let num = "";
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: "number", value: parseFloat(num) });
      continue;
    }
    i++;
  }
  return tokens;
};

const evaluateTokens = (tokens) => {
  if (tokens.length === 0) return null;
  let i;
  let pass = tokens;
  for (const op of ["*", "/"]) {
    const next = [];
    i = 0;
    while (i < pass.length) {
      const t = pass[i];
      if (t.type === "operator" && t.value === op) {
        const left = next.pop();
        const right = pass[i + 1];
        if (!left || !right || left.type !== "number" || right.type !== "number") {
          throw new Error("Invalid expression");
        }
        const result = op === "*" ? left.value * right.value : left.value / right.value;
        next.push({ type: "number", value: result });
        i += 2;
      } else {
        next.push(t);
        i++;
      }
    }
    pass = next;
  }
  let acc = pass[0];
  if (!acc || acc.type !== "number") throw new Error("Invalid expression");
  let value = acc.value;
  i = 1;
  while (i < pass.length) {
    const op = pass[i];
    const right = pass[i + 1];
    if (!op || op.type !== "operator" || !right || right.type !== "number") {
      throw new Error("Invalid expression");
    }
    if (op.value === "+") value += right.value;
    else if (op.value === "-") value -= right.value;
    i += 2;
  }
  return value;
};

const evaluate = (expr) => {
  const tokens = tokenize(expr);
  return evaluateTokens(tokens);
};

// Test cases
const tests = [
  "1+1",
  "2+3",
  "10-5",
  "4*5",
  "20/4",
  "1.5+2.5",
  "2+3*4",         // should be 14 (operator precedence)
  "10-2-3",        // should be 5 (left assoc)
  "12*4+3",        // 51
  "0.1+0.2",       // 0.3
  "-5+3",          // -2
  "5+-3",          // 2 (unary minus after operator)
  "5-3-",          // trailing operator (should error)
  "5+",            // trailing operator
  "*5",            // leading operator (should error)
  "",
  "1/0",           // Infinity
  "100/3",         // 33.333...
];

console.log("=== Test results ===");
for (const t of tests) {
  try {
    const result = evaluate(t);
    console.log(`  "${t}"  →  ${result}`);
  } catch (err) {
    console.log(`  "${t}"  →  ERROR: ${err.message}`);
  }
}
