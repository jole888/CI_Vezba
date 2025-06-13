"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var reportPath = path_1.default.join("playwright-report", ".last-run.json");
try {
    var data = fs_1.default.readFileSync(reportPath, "utf8");
    var manifest = JSON.parse(data);
    var suites = manifest.suites || [];
    var total_1 = 0;
    var passed_1 = 0;
    var failed_1 = 0;
    var skipped_1 = 0;
    var flaky_1 = 0;
    var traverse_1 = function (suites) {
        for (var _i = 0, suites_1 = suites; _i < suites_1.length; _i++) {
            var suite = suites_1[_i];
            if (suite.suites)
                traverse_1(suite.suites);
            for (var _a = 0, _b = suite.tests || []; _a < _b.length; _a++) {
                var test = _b[_a];
                total_1++;
                switch (test.outcome) {
                    case "expected":
                        passed_1++;
                        break;
                    case "unexpected":
                        failed_1++;
                        break;
                    case "skipped":
                        skipped_1++;
                        break;
                    case "flaky":
                        flaky_1++;
                        break;
                }
            }
        }
    };
    traverse_1(suites);
    var summary = {
        total: total_1,
        passed: passed_1,
        failed: failed_1,
        skipped: skipped_1,
        flaky: flaky_1,
    };
    fs_1.default.writeFileSync("test-summary.json", JSON.stringify(summary, null, 2));
    console.log("✅ Test summary generated.");
}
catch (err) {
    console.error("❌ Failed to parse .last-run.json:", err);
    process.exit(1);
}
