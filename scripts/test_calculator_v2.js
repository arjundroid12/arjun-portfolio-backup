// Test calculator evaluate logic with strict mode
"use strict";

const OPERATORS = new Set(["+", "-", "*", "/"]);

const tokenize = (expr) => {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (c === " ") { i++; continue; }
    if (OPERATORS.has(c)) {
      if (c === "-" && (tokens.length === 0 || (tokens[tokens.length - 1] && OPERATORS.has(tokens[tokens.length - 1].value)))) {
        let num = "-";
        i++;
        while (i < expr.length && /[0-9.]/.test(expr[i])) { num += expr[i]; i++; }
        tokens.push({ type: "number", value: parseFloat(num) });
      } else {
        tokens.push({ type: "operator", value: c });
        i++;
      }
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let num = "";
      while (i < expr.length && /[0-9.]/.test(expr[i])) { num += expr[i]; i++; }
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

const evaluate = (expr) => evaluateTokens(tokenize(expr));

// Test cases
const tests = [
  { expr: "5+5", expected: 10 },
  { expr: "5*-3", expected: -15 },     // The bug we fixed
  { expr: "10/-2", expected: -5 },      // Similar case
  { expr: "2+-3", expected: -1 },       // Unary minus after +
  { expr: "2--3", expected: 5 },        // Double minus (2 - (-3))
  { expr: "3*4*-2", expected: -24 },    // Multiple unary
  { expr: "-5*3", expected: -15 },      // Leading unary
  { expr: "10-3", expected: 7 },
  { expr: "4*6", expected: 24 },
  { expr: "20/4", expected: 5 },
];

console.log("=== Calculator parser tests (strict mode) ===");
let pass = 0, fail = 0;
for (const t of tests) {
  try {
    const result = evaluate(t.expr);
    const ok = Math.abs(result - t.expected) < 0.0001;
    console.log(`  ${ok ? "✅" : "❌"} "${t.expr}" = ${result} (expected ${t.expected})`);
    if (ok) pass++; else fail++;
  } catch (err) {
    console.log(`  ❌ "${t.expr}" threw: ${err.message}`);
    fail++;
  }
}
console.log(`\n${pass}/${tests.length} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
