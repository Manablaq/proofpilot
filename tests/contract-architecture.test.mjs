import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../contracts/proofpilot.py", import.meta.url), "utf8");

test("campaign rubrics are canonical, bounded, and used by review execution", () => {
  assert.match(source, /def pp_rubric\(raw: str\) -> dict:/);
  assert.match(source, /set\(rubric\.keys\(\)\) != set\(RUBRIC_KEYS\)/);
  assert.match(source, /if total != 100:/);
  assert.match(source, /rubric = pp_rubric\(c\["custom_rubric_json"\]\)/);
  assert.match(source, /pp_run_review\(sd, rubric\)/);
});

test("contract and deployment identifiers are fetched and recorded without overstating linkage", () => {
  assert.match(source, /contract = pp_fetch\("contract_address", contract_url/);
  assert.match(source, /tx = pp_fetch\("deployment_tx", tx_url/);
  assert.match(source, /"contract_address_verified": contract_ok/);
  assert.match(source, /"deployment_tx_verified": tx_ok/);
  assert.match(source, /and s\.get\("deployment_tx_hash", ""\)\.lower\(\) in tt/);
  assert.doesNotMatch(source, /and s\.get\("contract_address", ""\)\.lower\(\) in tt/);
  assert.match(source, /"linkage_to_contract_not_asserted": True/);
  assert.doesNotMatch(source, /"contract_address": \{"source": "contract_address", "status": UNSUPPORTED/);
});

test("validators independently derive the canonical source-grounded decision", () => {
  assert.match(source, /def pp_compare_review\(s: dict, rubric: dict, leaders_res\)/);
  assert.match(source, /def pp_deterministic_review\(facts: dict, rubric: dict, narrative: dict\)/);
  assert.match(source, /own_facts = pp_compact_facts\(s\)/);
  assert.match(source, /pp_review_matches_facts\(leader.get\("review"\), own_facts, rubric\)/);
  assert.doesNotMatch(source, /pp_review_equivalent/);
});

test("AI commentary is bounded but cannot change consensus-critical scoring", () => {
  assert.match(source, /def pp_narrative\(s: dict, facts: dict\)/);
  assert.match(source, /Best-effort AI context; malformed or unavailable AI output never aborts review/);
  assert.match(source, /scores = \{/);
  assert.match(source, /"live_app_availability": rubric\["live_app_availability"\] if facts\["live_app_reachable"\] else 0/);
});
