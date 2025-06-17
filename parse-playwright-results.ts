import fs from "fs";
import path from "path";

const reportPath = path.join("playwright-report", "report.json"); // promenjeno sa .last-run.json

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

  if (!manifest?.suites || manifest.suites.length === 0) {
    console.warn("⚠️ No test suites found in report.json");
    return emptySummary;
  }

  traverse(manifest.suites);
  return { total, passed, failed, skipped, flaky };
}

try {
  if (!fs.existsSync(reportPath)) {
    console.warn(`⚠️ Report not found at ${reportPath}`);
    console.log(JSON.stringify(emptySummary));
    if (process.env.GITHUB_OUTPUT) {
      // GitHub output multiline vrednosti
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `summary<<EOF\n${JSON.stringify(emptySummary)}\nEOF\n`);
    }
    process.exit(0);
  }

  const data = fs.readFileSync(reportPath, "utf8");
  const manifest: Manifest = JSON.parse(data);
  const summary = parseSummary(manifest);

  fs.writeFileSync("test-summary.json", JSON.stringify(summary, null, 2));

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `summary<<EOF\n${JSON.stringify(summary)}\nEOF\n`);
  }

  console.log(JSON.stringify(summary));
} catch (err: any) {
  console.error(`❌ Failed to parse report: ${err.message}`);
  console.log(JSON.stringify(emptySummary));
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `summary<<EOF\n${JSON.stringify(emptySummary)}\nEOF\n`);
  }
  process.exit(1);
}
