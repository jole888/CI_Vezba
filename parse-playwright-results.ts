import fs from "fs";
import path from "path";

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

  const summary = {
    total,
    passed,
    failed,
    skipped,
    flaky,
  };

  fs.writeFileSync("test-summary.json", JSON.stringify(summary, null, 2));
  console.log("✅ Test summary generated.");
} catch (err) {
  console.error("❌ Failed to parse .last-run.json:", err);
  process.exit(1);
}
