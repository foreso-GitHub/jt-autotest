//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const utility = require('../../framework/testUtility')
//endregion

//region design

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

//endregion

module.exports = mochaReportComparor = {

    //region stats

    compareStats: function(stats1, stats2){
        let result = {}
        result.statList = {}
        result.statList.stats1 = stats1
        result.statList.stats2 = stats2
        result.fullComparison = mochaReportComparor.checkStats(stats1, stats2, true)
        result.differences = mochaReportComparor.checkStats(stats1, stats2, false)

        return result
    },

    checkStats: function(stats1, stats2, ifOutputFull){
        const CHANGE_SIGNAL = ' ==> '
        let result = {}

        if(ifOutputFull || stats1.suites != stats2.suites){
            result.suites = stats1.suites + CHANGE_SIGNAL + stats2.suites
        }

        if(ifOutputFull || stats1.tests != stats2.tests){
            result.tests = stats1.tests + CHANGE_SIGNAL + stats2.tests
        }

        if(ifOutputFull || stats1.passes != stats2.passes){
            result.passes = stats1.passes + CHANGE_SIGNAL + stats2.passes
        }

        if(ifOutputFull || stats1.pending != stats2.pending){
            result.pending = stats1.pending + CHANGE_SIGNAL + stats2.pending
        }

        if(ifOutputFull || stats1.failures != stats2.failures){
            result.failures = stats1.failures + CHANGE_SIGNAL + stats2.failures
        }

        if(ifOutputFull){
            result.start = stats1.start + CHANGE_SIGNAL + stats2.start
            result.end = stats1.end + CHANGE_SIGNAL + stats2.end
        }

        if(ifOutputFull || stats1.duration != stats2.duration){
            result.duration = stats1.duration + CHANGE_SIGNAL + stats2.duration
            stats1.time = utility.span2Time(stats1.duration)
            stats2.time = utility.span2Time(stats2.duration)
            result.time = utility.printTime(stats1.time) + CHANGE_SIGNAL + utility.printTime(stats2.time)
        }

        if(ifOutputFull || stats1.testsRegistered != stats2.testsRegistered){
            result.testsRegistered = stats1.testsRegistered + CHANGE_SIGNAL + stats2.testsRegistered
        }

        if(ifOutputFull || stats1.passPercent != stats2.passPercent){
            result.passPercent = stats1.passPercent + CHANGE_SIGNAL + stats2.passPercent
        }

        if(ifOutputFull || stats1.pendingPercent != stats2.pendingPercent){
            result.pendingPercent = stats1.pendingPercent + CHANGE_SIGNAL + stats2.pendingPercent
        }

        if(ifOutputFull || stats1.other != stats2.other){
            result.other = stats1.other + CHANGE_SIGNAL + stats2.other
        }

        if(ifOutputFull || stats1.hasOther != stats2.hasOther){
            result.hasOther = stats1.hasOther + CHANGE_SIGNAL + stats2.hasOther
        }

        if(ifOutputFull || stats1.skipped != stats2.skipped){
            result.skipped = stats1.skipped + CHANGE_SIGNAL + stats2.skipped
        }

        if(ifOutputFull || stats1.hasSkipped != stats2.hasSkipped){
            result.hasSkipped = stats1.hasSkipped + CHANGE_SIGNAL + stats2.hasSkipped
        }

        return result
    },

    //endregion

    //region tests

    collectTests: function(results){
        let testList = []
        testList = mochaReportComparor.goThroughSuites(results, testList)
        // logger.debug('===testList: ' + JSON.stringify(testList.length))
        return testList
    },

    goThroughSuites: function(suites, testList){
        for(let i = 0; i < suites.length; i++){
            let suite = suites[i]
            testList = mochaReportComparor.goThroughTests(suite.tests, testList)
            testList = mochaReportComparor.goThroughSuites(suite.suites, testList)
        }
        return testList
    },

    goThroughTests: function(tests, testList){
        testList = testList.concat(tests)
        // logger.debug('===testList: ' + JSON.stringify(testList.length))
        return testList
    },

    //region

}


