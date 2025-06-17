// parse-playwright-results.ts
import fs from 'fs';
import path from 'path';
import * as core from '@actions/core';

const resultsPath = path.join(process.cwd(), 'playwright-report', 'report.json');
const summaryPath = path.join(process.cwd(), 'playwright-report', 'test-summary.json');

const raw = fs.readFileSync(resultsPath, 'utf-8');
const report = JSON.parse(raw);

let total = 0;
let passed = 0;
let failed = 0;
let skipped = 0;
let flaky = 0;

for (const suite of report.suites) {
  for (const subsuite of suite.suites) {
    for (const spec of subsuite.specs) {
      total += 1;
      const status = spec.tests[0].results[0]?.status;
      if (status === 'passed') passed += 1;
      else if (status === 'skipped') skipped += 1;
      else if (status === 'flaky') flaky += 1;
      else failed += 1;
    }
  }
}

const summary = { total, passed, failed, skipped, flaky };

// Zapiši u JSON fajl
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

// Postavi kao output za GitHub Actions
core.setOutput('total', total);
core.setOutput('passed', passed);
core.setOutput('failed', failed);
core.setOutput('skipped', skipped);
core.setOutput('flaky', flaky);
