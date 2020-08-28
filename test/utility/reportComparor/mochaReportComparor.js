// 1. load report1 and report2 (json) from file
// 2. find all test items, put them in one big array
// 3. compare report1 array and report2 array
// 3.1 compare fullTitle to match same test (sample1)
// 3.2 compare state
// 3.2.1 same
// 3.2.2 passed => not passed (failed, pending, skipped, etc)
// 3.2.3 not passed => passed
// 3.2.4 none => state
// 3.2.5 state => none
// 3.3 compare stats (sample2)




//region sample1
/*
"tests": [
    {
        "title": "0010\t查询最新区块号：发起查询请求，等待5秒或10秒（同步时间），再次发起查询请求",
        "fullTitle": "Jingtum测试 测试模式: rpc@http://121.37.216.100:9545/v1/jsonrpc is working 测试jt_blockNumber 0010\t查询最新区块号：发起查询请求，等待5秒或10秒（同步时间），再次发起查询请求",
        "timedOut": false,
        "duration": 26,
        "state": "failed",
        "speed": null,
        "pass": false,
        "fail": true,
        "pending": false,
        "context": null,
        "code": "// await testCase.checkFunction(testCase)\ntry{\n    // logger.debug('===before checkFunction')\n    // logger.debug('hasExecuted: ' + testCase.hasExecuted)\n    framework.printTestCaseInfo(testCase)\n    await testCase.checkFunction(testCase)\n    // logger.debug('===after checkFunction')\n    framework.afterTestFinish(testCase)\n}\ncatch(ex){\n    framework.afterTestFinish(testCase)\n    throw ex\n}",
        "err": {
            "message": "AssertionError: expected 0 to be at least 1",
            "estack": "AssertionError: expected 0 to be at least 1\n    at Object.checkFunction (test\\testCases\\tcsGetBlockNumber.js:50:75)\n    at Context.<anonymous> (test\\framework\\framework.js:645:40)",
            "diff": "- 0\n+ 1\n"
        },
        "uuid": "41a17ea1-4e31-4a54-a1e9-7217c5986039",
        "parentUUID": "0fb3bfe3-a834-462f-9323-5f628c61f0d8",
        "isHook": false,
        "skipped": false
    },
    {
        "title": "0010\t查询最新区块号",
        "fullTitle": "Jingtum测试 测试模式: rpc@http://121.37.216.100:9545/v1/jsonrpc is working 测试jt_blockNumber 0010\t查询最新区块号",
        "timedOut": false,
        "duration": 31,
        "state": "passed",
        "speed": "fast",
        "pass": true,
        "fail": false,
        "pending": false,
        "context": null,
        "code": "// await testCase.checkFunction(testCase)\ntry{\n    // logger.debug('===before checkFunction')\n    // logger.debug('hasExecuted: ' + testCase.hasExecuted)\n    framework.printTestCaseInfo(testCase)\n    await testCase.checkFunction(testCase)\n    // logger.debug('===after checkFunction')\n    framework.afterTestFinish(testCase)\n}\ncatch(ex){\n    framework.afterTestFinish(testCase)\n    throw ex\n}",
        "err": {},
        "uuid": "0f8305d2-b962-4ca5-b22f-ee6de7e4bf64",
        "parentUUID": "0fb3bfe3-a834-462f-9323-5f628c61f0d8",
        "isHook": false,
        "skipped": false
    }
],
*/
//endregion

//region sample2
/*
"stats": {
    "suites": 6,
    "tests": 26,
    "passes": 12,
    "pending": 0,
    "failures": 14,
    "start": "2020-08-26T03:09:22.346Z",
    "end": "2020-08-26T03:09:33.451Z",
    "duration": 11105,
    "testsRegistered": 26,
    "passPercent": 46.15384615384615,
    "pendingPercent": 0,
    "other": 0,
    "hasOther": false,
    "skipped": 0,
    "hasSkipped": false
  },
*/
//endregion

