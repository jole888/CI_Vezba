import fs from "fs";
import path from "path";

const reportPath = path.join("playwright-report", "report.json");

const emptySummary = { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 };

interface TestResult {
  status: "passed" | "failed" | "skipped" | "timedOut" | "interrupted" | "flaky";
}

interface Test {
  results: TestResult[];
}

interface Spec {
  tests: Test[];
}

interface Suite {
  suites?: Suite[];
  specs?: Spec[];
}

interface ReportJson {
  suites?: Suite[];
}

function parseSummary(report: ReportJson) {
  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let flaky = 0;

  const traverse = (suites: Suite[]) => {
    for (const suite of suites) {
      if (suite.suites) traverse(suite.suites);
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          total++;
          const result = test.results?.[0];
          if (!result) continue;
          switch (result.status) {
            case "passed":
              passed++;
              break;
            case "failed":
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
    }
  };

  if (!report?.suites?.length) {
    console.warn("⚠️ No suites in report.json");
    return emptySummary;
  }

  traverse(report.suites);
  return { total, passed, failed, skipped, flaky };
}

try {
  const summary = fs.existsSync(reportPath)
    ? parseSummary(JSON.parse(fs.readFileSync(reportPath, "utf8")))
    : emptySummary;

  const summaryString = JSON.stringify(summary, null, 2);
  fs.writeFileSync("test-summary.json", summaryString);

  console.log("✅ Test summary written to test-summary.json");
  console.log(summaryString);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} catch (err: any) {
  console.error(`❌ Failed to parse report: ${err.message}`);
  const fallback = JSON.stringify(emptySummary, null, 2);
  fs.writeFileSync("test-summary.json", fallback);
  process.exit(1);
}
