"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var mocha_1 = require("mocha");
var testrail_1 = require("./testrail");
var shared_1 = require("./shared");
var testrail_interface_1 = require("./testrail.interface");
var MochaTestRailReporter = /** @class */ (function (_super) {
    __extends(MochaTestRailReporter, _super);
    function MochaTestRailReporter(runner, options) {
        var _this = _super.call(this, runner) || this;
        _this.results = [];
        _this.passes = 0;
        _this.fails = 0;
        _this.pending = 0;
        _this.out = [];
        var reporterOptions = options.reporterOptions;
        _this.validate(reporterOptions, 'domain');
        _this.validate(reporterOptions, 'username');
        _this.validate(reporterOptions, 'password');
        _this.validate(reporterOptions, 'projectId');
        _this.validate(reporterOptions, 'suiteId');
        runner.on('start', function () {
        });
        runner.on('suite', function (suite) {
        });
        runner.on('suite end', function () {
        });
        runner.on('pending', function (test) {
            _this.pending++;
            _this.out.push(test.fullTitle() + ': pending');
        });
        runner.on('pass', function (test) {
            var _a, _b;
            _this.passes++;
            _this.out.push(test.fullTitle() + ': pass');
            var caseIds = shared_1.titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                if (test.speed === 'fast') {
                    var results = caseIds.map(function (caseId) {
                        return {
                            case_id: caseId,
                            status_id: testrail_interface_1.Status.Passed,
                            comment: test.title
                        };
                    });
                    (_a = _this.results).push.apply(_a, results);
                }
                else {
                    var results = caseIds.map(function (caseId) {
                        return {
                            case_id: caseId,
                            status_id: testrail_interface_1.Status.Passed,
                            comment: test.title + " (" + test.duration + "ms)"
                        };
                    });
                    (_b = _this.results).push.apply(_b, results);
                }
            }
        });
        runner.on('fail', function (test) {
            var _a;
            _this.fails++;
            _this.out.push(test.fullTitle() + ': fail');
            var caseIds = shared_1.titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                var results = caseIds.map(function (caseId) {
                    return {
                        case_id: caseId,
                        status_id: testrail_interface_1.Status.Failed,
                        comment: test.title + "\n" + test.err
                    };
                });
                (_a = _this.results).push.apply(_a, results);
            }
        });
        runner.on('end', function () {
            if (_this.results.length == 0) {
                console.warn("No testcases were matched. Ensure that your tests are declared correctly and matches TCxxx");
            }
            var executionDateTime = new Date().toISOString();
            var total = _this.passes + _this.fails + _this.pending;
            var name = "Automated test run " + executionDateTime;
            var description = "Automated test run executed on " + executionDateTime + "\nExecution summary:\nPasses: " + _this.passes + "\nFails: " + _this.fails + "\nPending: " + _this.pending + "\nTotal: " + total + "\nExecution details:\n" + _this.out.join('\n') + "                     \n";
            new testrail_1.TestRail(reporterOptions).publish(name, description, _this.results);
        });
        return _this;
    }
    MochaTestRailReporter.prototype.validate = function (options, name) {
        if (options == null) {
            throw new Error("Missing --reporter-options in mocha.opts");
        }
        if (options[name] == null) {
            throw new Error("Missing " + name + " value. Please update --reporter-options in mocha.opts");
        }
    };
    return MochaTestRailReporter;
}(mocha_1.reporters.Spec));
module.exports = MochaTestRailReporter;
//# sourceMappingURL=mocha-testrail-reporter.js.map