|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|
|----------------|----------------|----------------|
|<a name="ERR_RAS_000010"></a>ERR_RAS_000010|烤机测试|**预置条件**`5/7/9共识节点`<br><br>**输入内容**`用自动化脚本向所有共识节点不断发送各种类型的访问请求，持续数周甚至数月`<br><br>**预期结果**`链稳定运行`|
|<a name="ERR_RAS_000020"></a>ERR_RAS_000020|增加共识节点|**预置条件**`自动化脚本向所有共识节点不断发送各种类型的访问请求`<br><br>**输入内容**`增加一个共识节点`<br><br>**预期结果**`所有请求都被正确处理，新增的共识节点也可以处理各种访问请求`|
|<a name="ERR_RAS_000030"></a>ERR_RAS_000030|减少共识节点|**预置条件**`自动化脚本向所有共识节点不断发送各种类型的访问请求`<br><br>**输入内容**`减少一个共识节点`<br><br>**预期结果**`所有请求都被正确处理（除去发往被减少的节点的请求）`|
|<a name="ERR_RAS_000040"></a>ERR_RAS_000040|升级测试|**预置条件**`自动化脚本向所有共识节点不断发送各种类型的访问请求`<br><br>**输入内容**`测试链是否能够在不中断业务的情况下进行版本升级`<br><br>**预期结果**`能够在不中断业务的情况下升级整个链的版本`|
|<a name="ERR_RAS_000050"></a>ERR_RAS_000050|状态监控测试|**预置条件**`无`<br><br>**输入内容**`监控链的状态`<br><br>**预期结果**`可以监控链上各节点的运行状态`|
|<a name="ERR_RAS_000060"></a>ERR_RAS_000060|报警测试|**预置条件**`无`<br><br>**输入内容**`链的某个节点出现故障`<br><br>**预期结果**`故障信息可以自动显示给客户，故障排除后，报警消失`|
|<a name="ERR_RAS_000070"></a>ERR_RAS_000070|冗余性测试_01|**预置条件**`n个共识节点`<br><br>**输入内容**`小于n/3个共识节点发生故障`<br><br>**预期结果**`链的运行不受影响，能个处理各种请求`|
|<a name="ERR_RAS_000080"></a>ERR_RAS_000080|冗余性测试_02|**预置条件**`n个共识节点`<br><br>**输入内容**`等于或大于n/3个共识节点发生故障`<br><br>**预期结果**`链的运行中断；修复故障节点后，链可以继续运行且故障前的共识数据不受影响`|