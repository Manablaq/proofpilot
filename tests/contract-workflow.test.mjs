import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("appeal, re-check, human-decision, and report-ledger transitions execute on the contract", () => {
  const result = spawnSync("python3", ["tests/contract_workflow_test.py"], { encoding: "utf8" });
  assert.equal(result.status, 0, `workflow test failed:\n${result.stdout}\n${result.stderr}`);
});
