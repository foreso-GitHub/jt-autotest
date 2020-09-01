//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const utility = require('../../framework/testUtility')
const testState = require('../../framework/enums').reportTestState
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

const CHANGE_SIGNAL = ' ==> '

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

    //region collect all tests in report
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

    //endregion

    //region compare tests in 2 reports

    compareTests: function(testList1, testList2, ifAttachRawTest){
        let result = {}
        result.same = {}
        mochaReportComparor.createClassByState(result.same)
        result.differences = {}
        result.differences.passed = {}
        mochaReportComparor.createClassForPassed(result.differences.passed)
        result.differences.notPassed = {}
        mochaReportComparor.createClassForNotPassed(result.differences.notPassed)
        result.differences.beRemoved = {}
        mochaReportComparor.createClassByState(result.differences.beRemoved)
        result.differences.beAdded = {}
        mochaReportComparor.createClassByState(result.differences.beAdded)

        let cloneTestList1 = utility.cloneArray(testList1)
        let cloneTestList2 = utility.cloneArray(testList2)

        for(let i = 0; i < testList1.length; i++){
            let j = 0
            let length = cloneTestList2.length
            while(j < length){
                let test1 = testList1[i]
                let test2 = cloneTestList2[j]
                if(test1.title === test2.title){
                    if(mochaReportComparor.compareState(test1, test2)){
                        mochaReportComparor.createCompareResult(test1, test2, result.same, ifAttachRawTest)
                    }else{
                        let container = test1.state == testState.passed ?
                            result.differences.passed : result.differences.notPassed
                        mochaReportComparor.createCompareResult(test1, test2, container, ifAttachRawTest)
                    }
                    //existed in both list, now removed in clone lists.
                    let r1 = testUtility.remove(cloneTestList1, test1)
                    let r2 = testUtility.remove(cloneTestList2, test2)
                    length = cloneTestList2.length
                    break
                }
                j++
            }
        }

        //classify removed tests
        for(let i = 0; i < cloneTestList1.length; i++){
            mochaReportComparor.createCompareResult(cloneTestList1[i], null,
                result.differences.beRemoved, ifAttachRawTest)
        }

        //classify new tests
        for(let i = 0; i < cloneTestList2.length; i++){
            mochaReportComparor.createCompareResult(null, cloneTestList2[i],
                result.differences.beAdded, ifAttachRawTest)
        }

        mochaReportComparor.countByState(result.same)
        mochaReportComparor.countByState(result.differences.passed)
        mochaReportComparor.countByState(result.differences.notPassed)
        mochaReportComparor.countByState(result.differences.beRemoved)
        mochaReportComparor.countByState(result.differences.beAdded)

        return result
    },

    compareState: function(test1, test2){
        return test1.state === test2.state
    },

    createClassByState: function(container){
        container.passed = []
        container.failed = []
        container.pending = []
        container.hooked = []
        container.skipped = []
        container.others = []
    },

    createClassForPassed: function(container){
        container.p2f = []
        container.p2pd = []
        container.p2h = []
        container.p2s = []
        container.others = []
    },

    createClassForNotPassed: function(container){
        container.f2p = []
        container.pd2p = []
        container.h2p = []
        container.s2p = []
        container.others = []
    },

    createCompareResult: function(test1, test2, container, ifAttachRawTest){
        let result = {}
        let test
        if(test1 != null && test2 != null){
            result.title = test1.title
            let state1 = mochaReportComparor.convertState(test1)
            let state2 = mochaReportComparor.convertState(test2)
            if(state1 === state2){
                result.state = state1
            }else{
                result.state = state1 + CHANGE_SIGNAL + state2
            }
        }else{
            test = test1 ? test1 : test2
            result.title = test.title
            result.state = mochaReportComparor.convertState(test)
        }

        if(ifAttachRawTest != null && ifAttachRawTest){
            result.test1 = test1
            result.test2 = test2
        }

        mochaReportComparor.classifyByState(result.state, container, result)
    },

    //if state == null, try to make it match to other right state
    convertState: function(test){
        let state = test.state
        if(state == null){
            if(test.skipped){
                state = testState.skipped
            }else if (test.pending){
                state = testState.pending
            }else if (test.isHook){
                state = testState.hooked
            }
        }
        return state
    },

    classifyByState: function(state, container, compareResult){
        if(state === testState.passed){
            container.passed.push(compareResult)
        }else if(state === testState.failed){
            container.failed.push(compareResult)
        }else if(state === testState.skipped){
            container.skipped.push(compareResult)
        }else if(state === testState.pending){
            container.pending.push(compareResult)
        }else if(state === testState.hooked){
            container.hooked.push(compareResult)
        }
        else if(state === testState.p2f){
            container.p2f.push(compareResult)
        }else if(state === testState.p2pd){
            container.p2pd.push(compareResult)
        }else if(state === testState.p2h){
            container.p2h.push(compareResult)
        }else if(state === testState.p2s){
            container.p2s.push(compareResult)
        }
        else if(state === testState.f2p){
            container.f2p.push(compareResult)
        }else if(state === testState.pd2p){
            container.pd2p.push(compareResult)
        }else if(state === testState.h2p){
            container.h2p.push(compareResult)
        }else if(state === testState.s2p){
            container.s2p.push(compareResult)
        }
        else{
            container.others.push(compareResult)
        }
    },

    countByState: function(container){
        container.totalCount = 0
        if(container.passed) {
            container.passedCount = container.passed.length
            container.totalCount += container.passedCount
        }
        if(container.failed) {
            container.failedCount = container.failed.length
            container.totalCount += container.failedCount
        }
        if(container.skipped) {
            container.skippedCount = container.skipped.length
            container.totalCount += container.skippedCount
        }
        if(container.pending) {
            container.pendingCount = container.pending.length
            container.totalCount += container.pendingCount
        }
        if(container.hooked) {
            container.hookedCount = container.hooked.length
            container.totalCount += container.hookedCount
        }

        if(container.p2f) {
            container.passed2failedCount = container.p2f.length
            container.totalCount += container.passed2failedCount
        }
        if(container.p2pd) {
            container.passed2pendingCount = container.p2pd.length
            container.totalCount += container.passed2pendingCount
        }
        if(container.p2h) {
            container.passed2hookedCount = container.p2h.length
            container.totalCount += container.passed2hookedCount
        }
        if(container.p2s) {
            container.passed2skippedCount = container.p2s.length
            container.totalCount += container.passed2skippedCount
        }

        if(container.f2p) {
            container.failed2passedCount = container.f2p.length
            container.totalCount += container.failed2passedCount
        }
        if(container.pd2p) {
            container.pending2passedCount = container.pd2p.length
            container.totalCount += container.pending2passedCount
        }
        if(container.h2p) {
            container.hooked2passedCount = container.h2p.length
            container.totalCount += container.hooked2passedCount
        }
        if(container.s2p) {
            container.skipped2passedCount = container.s2p.length
            container.totalCount += container.skipped2passedCount
        }

        if(container.others) {
            container.othersCount = container.others.length
            container.totalCount += container.othersCount
        }
    },

    //endregion

    //endregion

    //region report
    compareReports: function(report1, report2, ifAttachRawTest){
        let result = {}
        result.statsChanges = mochaReportComparor.compareStats(report1.stats, report2.stats)

        let testList1 = mochaReportComparor.collectTests(report1.results)
        let testList2 = mochaReportComparor.collectTests(report2.results)
        result.testsChanges = mochaReportComparor.compareTests(testList1, testList2, ifAttachRawTest)

        return result
    },
    //endregion

    //region report file
    compareReportFiles: async function(file1, file2, ifAttachRawTest){
        let report1 = await utility.loadJsonFile(file1)
        let report2 = await utility.loadJsonFile(file2)
        let result = mochaReportComparor.compareReports(report1, report2, ifAttachRawTest)
        result.misc = {}
        let date = new Date()
        result.misc.compareTime = date.toISOString()
        result.misc.time = date.getTime()
        result.misc.report1 = file1
        result.misc.report2 = file2
        return result
    },
    //region

}


