# autotest-demo
The demo of auto test of jingtum new chain.

要求
1. 要兼顾rpc，restful api和websocket3种链接方式，但只写一套测试script。链接方式可扩展。
2. 要有测试报告和测试覆盖率。
3. 统一的response分析判断。
4. 持续集成，代码变化自动跑测试，生成报告。

方案：
测试：nodejs + mocha + chai
管理：Lerna
CI：Travis
代码规整工具：Prettier，ESLint


