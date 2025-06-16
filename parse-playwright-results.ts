import fs from "fs";
import path from "path";
import * as core from "@actions/core";

interface Test {
  outcome: "expected" | "unexpected" | "skipped" | "flaky";
}

interface Suite {
  suites?: Suite[];
  tests?: Test[];
}

interface Manifest {
  suites?: Suite[];
}

const reportPath = path.join("playwright-report", ".last-run.json");

try {
  if (!fs.existsSync(reportPath)) {
    core.warning(`⚠️ Report file not found at path: ${reportPath}`);
    core.setOutput("summary", JSON.stringify({ total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 }));
    process.exit(0); // Graceful exit
  }

  const data = fs.readFileSync(reportPath, "utf8");
  const manifest: Manifest = JSON.parse(data);
  const suites = manifest.suites || [];

  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let flaky = 0;

  const traverse = (suites: Suite[]): void => {
    for (const suite of suites) {
      if (suite.suites) traverse(suite.suites);
      for (const test of suite.tests || []) {
        total++;
        switch (test.outcome) {
          case "expected":
            passed++;
            break;
          case "unexpected":
            failed++;
            break;
          case "skipped":
            skipped++;
            break;
          case "flaky":
            flaky++;
            break;
        }
      }
    }
  };

  traverse(suites);

  const summary = { total, passed, failed, skipped, flaky };

  fs.writeFileSync("test-summary.json", JSON.stringify(summary, null, 2));

  try {
    core.setOutput("summary", JSON.stringify(summary));
  } catch (outputErr) {
    core.warning(`⚠️ Failed to set GitHub Actions output: ${outputErr}`);
  }

  console.log("✅ Test summary generated.");
} catch (err) {
  core.setFailed(`❌ Failed to parse .last-run.json: ${err}`);
}
