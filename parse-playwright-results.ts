import fs from "fs";
import path from "path";

const reportPath = path.join("playwright-report", ".last-run.json");

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

function parseSummary(manifest: Manifest) {
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

  traverse(manifest.suites || []);
  return { total, passed, failed, skipped, flaky };
}

try {
  if (!fs.existsSync(reportPath)) {
    const emptySummary = { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 };
    console.warn(`⚠️ Report not found at ${reportPath}`);
    console.log(JSON.stringify(emptySummary));
    process.exit(0);
  }

  const data = fs.readFileSync(reportPath, "utf8");
  const manifest: Manifest = JSON.parse(data);
  const summary = parseSummary(manifest);

  // Write to disk (optional)
  fs.writeFileSync("test-summary.json", JSON.stringify(summary, null, 2));

  // Output to GitHub Actions if available
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `summary=${JSON.stringify(summary)}\n`);
  }

  // Output to STDOUT for use in shell assignment
  console.log(JSON.stringify(summary));
} catch (err: any) {
  console.error(`❌ Failed to parse report: ${err.message}`);
  process.exit(1);
}
