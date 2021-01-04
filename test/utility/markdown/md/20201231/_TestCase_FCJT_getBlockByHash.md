|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|
|----------------|----------------|----------------|
|<a name="FCJT_getBlockByHash_000010"></a>FCJT_getBlockByHash_<br>000010|有效区块哈希，Boolean为ture|**预置条件**`无`<br><br>**输入内容**`查询有效区块哈希，第二个参数为ture`<br><br>**预期结果**`返回指定区块内所有交易的整个对象`|
|<a name="FCJT_getBlockByHash_000020"></a>FCJT_getBlockByHash_<br>000020|有效区块哈希，Boolean为false|**预置条件**`无`<br><br>**输入内容**`查询有效区块哈希，第二个参数为false`<br><br>**预期结果**`返回指定区块内所有交易的哈希`|
|<a name="FCJT_getBlockByHash_000030"></a>FCJT_getBlockByHash_<br>000030|有效区块哈希，无效Boolean参数|**预置条件**`无`<br><br>**输入内容**`查询有效区块哈希，第二个参数既不是ture也不是false、或者不写第二个参数`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getBlockByHash_000040"></a>FCJT_getBlockByHash_<br>000040|无效区块哈希|**预置条件**`无`<br><br>**输入内容**`查询无效区块哈希（不存在的哈希、长度不够的哈希、任意数字字符串），Boolean可以为任意值或不填`<br><br>**预期结果**`返回相应的提示信息`|
