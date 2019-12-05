var {expect}=require("chai");
var assert = require('assert');

var jingtum = require('../app/jingtum.js');

describe("jingtum test",function(){
    this.timeout(10000);
    var mode = ["rpc","api","ws"];

    //region utility methods
    async function get2BlockNumber(config) {
        return new Promise(async(resolve, reject) => {
            var result = {};
            result.blockNumber1 = await jingtum.getBlockDiff(config);
            setTimeout(
                async() => {
                    result.blockNumber2 = await jingtum.getBlockDiff(config);
                    resolve(result);
                }, 5000);
        })
    }
    //endregion

    mode.forEach(function(mode) {
        describe("jingtum test mode "  + mode,function() {
            it("getBlockNumber", function () {
                return Promise.resolve(get2BlockNumber(mode)).then(function (value) {
                    // expect(value.blockNumber1).to.be.above(340000);
                    expect(value.blockNumber2 - value.blockNumber1).to.be.most(2);
                    expect(value.blockNumber2 - value.blockNumber1).to.be.least(1);
                }, function (err) {
                    assert.ok(!err);
                });
            });

            it("getBlockNumber again", function () {
                return Promise.resolve(get2BlockNumber(mode)).then(function (value) {
                    // expect(value.blockNumber1).to.be.above(340000);
                    expect(value.blockNumber2 - value.blockNumber1).to.be.most(2);
                    expect(value.blockNumber2 - value.blockNumber1).to.be.least(1);
                }, function (err) {
                    assert.ok(!err);
                });
            });
        })
    });



    //region just some tries

    // it("getBlockNumber", async () => {
    //     var blockNumber1 = await jingtum.getBlockNumber();
    //     expect(blockNumber1).to.be.above(340000);
    // })

    // it("一段时间以后返回数据",function(done){
    //     // demo.waitTwoSecond("hello",function(data){
    //     //     expect(data).to.equal("hello")
    //     //     done(); //只有调用done方法才能等待调用结束以后测试
    //     //     //mocha默认的等待时间是2秒，上述操作超过两秒，报错
    //     //     //运行命令mocha demo-1.test.js -t 5000重置等待时间解决
    //     // })
    //
    //     setTimeout(
    //         function () {
    //         var blockNumber2 = jingtum.getBlockNumber();
    //         // expect(blockNumber2 - blockNumber1).to.be.most(2);
    //         done();
    //     }, 1000);
    // })

    // it('异步请求应该返回一个对象', function() {
    //     return jingtum.getBlockNumber()
    //         .then(function(res) {
    //             var blockNumber1 = res;
    //
    //             setTimeout(
    //                 function() {
    //                     jingtum.getBlockNumber()
    //                         .then(function(res2){
    //                             var blockNumber2 = res2;
    //                             expect(blockNumber2 - blockNumber1).to.be.least(1);
    //                             expect(blockNumber2 - blockNumber1).to.be.most(2);
    //                         })
    //                     // done();
    //             }, 2000);
    //
    //
    //         });
    // });

    // it("promise test", function() {
    //
    //     return Promise.resolve("OK").then(function(value) {
    //         assert.equal(value, "!dsadfasdfOKx"); //这里明显是应该直接抛出断言错误
    //     }, function(err) {
    //         assert.ok(!err);
    //     });
    //
    // });

    // it("getBlockNumber", function() {
    //
    //     return Promise.resolve(get2BlockNumber()).then(function(value) {
    //         // expect(value.blockNumber1).to.be.above(340000);
    //         expect(value.blockNumber2 - value.blockNumber1).to.be.most(2);
    //         expect(value.blockNumber2 - value.blockNumber1).to.be.least(1);
    //         // expect(value.blockNumber2).to.be.above(380000);
    //     }, function(err) {
    //         assert.ok(!err);
    //     });
    //
    // });

    //endregion
})

