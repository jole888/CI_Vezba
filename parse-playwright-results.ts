import fs from "fs";
import path from "path";

const reportPath = path.join("playwright-report", "report.json");

const emptySummary = { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 };

type Test = {
  status: "expected" | "unexpected" | "skipped" | "flaky";
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
          switch (test.status) {
            case "expected": passed++; break;
            case "unexpected": failed++; break;
            case "skipped": skipped++; break;
            case "flaky": flaky++; break;
          }
        }
      }
    }
  };

  if (!report?.suites?.length) {
    console.warn("⚠️ No suites found in report.json");
    return emptySummary;
  }

  traverse(report.suites);
  return { total, passed, failed, skipped, flaky };
}

try {
  const summary = fs.existsSync(reportPath)
    ? parseSummary(JSON.parse(fs.readFileSync(reportPath, "utf8")))
    : emptySummary;

  const summaryString = JSON.stringify(summary);
  fs.writeFileSync("test-summary.json", summaryString);

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
