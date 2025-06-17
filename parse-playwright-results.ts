import fs from "fs";
import path from "path";

const reportPath = path.join("playwright-report", "report.json");

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

const emptySummary = { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 };

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
          case "expected": passed++; break;
          case "unexpected": failed++; break;
          case "skipped": skipped++; break;
          case "flaky": flaky++; break;
        }
      }
    }
  };

  if (!manifest?.suites?.length) {
    console.warn("⚠️ No test suites found in report.json");
    return emptySummary;
  }

  traverse(manifest.suites);
  return { total, passed, failed, skipped, flaky };
}

try {
  const summary = fs.existsSync(reportPath)
    ? parseSummary(JSON.parse(fs.readFileSync(reportPath, "utf8")))
    : emptySummary;

  const summaryString = JSON.stringify(summary);

  fs.writeFileSync("test-summary.json", summaryString); // za ostale korake

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `summary=${summaryString}\n`);
  }

  console.log(summaryString);
} catch (err: any) {
  console.error(`❌ Failed to parse report: ${err.message}`);
  const fallback = JSON.stringify(emptySummary);
  console.log(fallback);
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `summary=${fallback}\n`);
  }
  process.exit(1);
}
