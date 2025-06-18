import fs from "fs";
import path from "path";

// Tip za pojedinačni test
interface Test {
  outcome: "expected" | "unexpected" | "skipped" | "flaky";
}

// Tip za suite koji može sadržavati pod-suites i testove
interface Suite {
  suites?: Suite[];
  tests?: Test[];
}

// Glavni tip za .last-run.json fajl
interface LastRunManifest {
  suites?: Suite[];
}

// Tip za sažetak koji ćemo upisivati
interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
}

const reportPath = path.join("playwright-report", ".last-run.json");
const outputPath = path.join("playwright-report", "test-summary.json");

const emptySummary: TestSummary = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  flaky: 0,
};

function parseSummary(manifest: LastRunManifest): TestSummary {
  const suites = manifest.suites || [];

  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let flaky = 0;

  const traverse = (suites: Suite[]) => {
    for (const suite of suites) {
      if (suite.suites) {
        traverse(suite.suites);
      }

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

  return { total, passed, failed, skipped, flaky };
}

try {
  const summary = fs.existsSync(reportPath)
    ? parseSummary(JSON.parse(fs.readFileSync(reportPath, "utf8")) as LastRunManifest)
    : emptySummary;

  const summaryString = JSON.stringify(summary, null, 2);
  fs.writeFileSync(outputPath, summaryString);
  console.log("✅ Test summary written to playwright-report/test-summary.json");
  console.log(summaryString);

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `summary=${summaryString}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `passed=${summary.passed}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `failed=${summary.failed}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `skipped=${summary.skipped}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `flaky=${summary.flaky}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `total=${summary.total}\n`);
  }
} catch (err) {
  if (err instanceof Error) {
    console.error(`❌ Failed to parse report: ${err.message}`);
  } else {
    console.error("❌ Unknown error while parsing report.");
  }

  const fallback = JSON.stringify(emptySummary, null, 2);
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
