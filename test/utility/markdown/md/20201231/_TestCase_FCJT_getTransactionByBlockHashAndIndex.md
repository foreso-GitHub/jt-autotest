|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|
|----------------|----------------|----------------|
|<a name="FCJT_getTransactionByBlockHashAndIndex_000010"></a>FCJT_getTransactionB<br>yBlockHashAndIndex_0<br>00010|有效区块哈希，有效交易索引|**预置条件**`区块内有数笔交易`<br><br>**输入内容**`查询有效区块哈希，遍历所有有效交易索引`<br><br>**预期结果**`返回详细的交易信息`|
|<a name="FCJT_getTransactionByBlockHashAndIndex_000020"></a>FCJT_getTransactionB<br>yBlockHashAndIndex_0<br>00020|有效区块哈希，无效交易索引|**预置条件**`区块内有数笔交易`<br><br>**输入内容**`查询有效区块哈希，但是交易索引无效（比如一个很大的数值、负数、小数、乱码字符串等）`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getTransactionByBlockHashAndIndex_000030"></a>FCJT_getTransactionB<br>yBlockHashAndIndex_0<br>00030|无效区块哈希|**预置条件**`无`<br><br>**输入内容**`查询无效区块哈希（不存在的哈希、长度不够的哈希、任意数字字符串），索引为任意数字或字符串等`<br><br>**预期结果**`返回相应的提示信息`|
