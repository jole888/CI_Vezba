const fs = require("fs");
const path = require("path");

const manifestPath = path.join("playwright-report", "manifest.json");

try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const suites = manifest.suites || [];

  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let flaky = 0;

  const traverse = (suites) => {
    for (const suite of suites) {
      if (suite.suites) traverse(suite.suites);
      for (const test of suite.tests || []) {
        total++;
        const outcome = test.outcome;
        if (outcome === "expected") passed++;
        else if (outcome === "unexpected") failed++;
        else if (outcome === "skipped") skipped++;
        else if (outcome === "flaky") flaky++;
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

  fs.writeFileSync("test-summary.json", JSON.stringify(summary));
  console.log("✅ Test summary generated.");
} catch (err) {
  console.error("❌ Failed to parse manifest.json:", err);
  process.exit(1);
}
