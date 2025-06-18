import fs from "fs";
import path from "path";

const reportPath = path.join("playwright-report", "report.json");
const outputPath = "test-summary.json";

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
  let summary = emptySummary;

  if (fs.existsSync(reportPath)) {
    const rawData = fs.readFileSync(reportPath, "utf8");
    try {
      const parsedData = JSON.parse(rawData);
      summary = parseSummary(parsedData);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      console.error("❌ Error parsing report.json, using fallback.");
    }
  } else {
    console.warn("⚠️ report.json not found, using fallback.");
  }

  const summaryString = JSON.stringify(summary);
  fs.writeFileSync(outputPath, summaryString);

  console.log("✅ Test summary written to test-summary.json");
  console.log(summaryString);

  if (process.env.GITHUB_OUTPUT) {
    const outputData = `
summary=${summaryString}
passed=${summary.passed}
failed=${summary.failed}
skipped=${summary.skipped}
flaky=${summary.flaky}
total=${summary.total}
`;
    fs.writeFileSync(process.env.GITHUB_OUTPUT, outputData);
  }
} catch (err: unknown) {
  console.error(`❌ Unexpected error: ${err instanceof Error ? err.message : "Unknown error"}`);
  process.exit(1);
}
