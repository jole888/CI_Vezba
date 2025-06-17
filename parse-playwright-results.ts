import fs from "fs";
import path from "path";

const reportPath = path.join("playwright-report", "report.json");

const emptySummary = { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 };

type TestResult = {
  status: "passed" | "failed" | "skipped" | "timedOut" | "interrupted" | "flaky";
};

type Test = {
  results: TestResult[];
};

type Spec = {
  tests: Test[];
};

type Suite = {
  suites?: Suite[];
  specs?: Spec[];
};

type ReportJson = {
  suites?: Suite[];
};

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

  const summaryString = JSON.stringify(summary); // one-line JSON
  fs.writeFileSync("test-summary.json", summaryString);

  console.log("✅ Test summary written to test-summary.json");
  console.log(summaryString);

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `summary=${summaryString}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `passed=${summary.passed}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `failed=${summary.failed}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `skipped=${summary.skipped}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `flaky=${summary.flaky}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `total=${summary.total}\n`);
  }
} catch (err: any) {
  console.error(`❌ Failed to parse report: ${err.message}`);
  const fallback = JSON.stringify(emptySummary);
  console.log(fallback);
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `summary=${fallback}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `passed=0\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `failed=0\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `skipped=0\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `flaky=0\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `total=0\n`);
  }
  process.exit(1);
}
