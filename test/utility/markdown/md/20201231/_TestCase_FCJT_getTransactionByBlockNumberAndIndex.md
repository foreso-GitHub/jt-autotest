|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|
|----------------|----------------|----------------|
|<a name="FCJT_getTransactionByBlockNumberAndIndex_000010"></a>FCJT_getTransactionB<br>yBlockNumberAndIndex<br>_000010|有效区块编号，有效交易索引|**预置条件**`区块内有数笔交易`<br><br>**输入内容**`查询有效区块编号，遍历所有有效交易索引`<br><br>**预期结果**`返回详细的交易信息`|
|<a name="FCJT_getTransactionByBlockNumberAndIndex_000020"></a>FCJT_getTransactionB<br>yBlockNumberAndIndex<br>_000020|区块编号为"earliest"，有效交易索引|**预置条件**`区块内有数笔交易`<br><br>**输入内容**`查询"earliest"区块，遍历所有有效交易索引`<br><br>**预期结果**`返回详细的交易信息`|
|<a name="FCJT_getTransactionByBlockNumberAndIndex_000030"></a>FCJT_getTransactionB<br>yBlockNumberAndIndex<br>_000030|区块编号为"latest"，有效交易索引|**预置条件**`区块内有数笔交易`<br><br>**输入内容**`查询"latest"区块，遍历所有有效交易索引`<br><br>**预期结果**`返回详细的交易信息`|
|<a name="FCJT_getTransactionByBlockNumberAndIndex_000040"></a>FCJT_getTransactionB<br>yBlockNumberAndIndex<br>_000040|区块编号为"pending"，有效交易索引|**预置条件**`区块内有数笔交易`<br><br>**输入内容**`查询"pending"区块，遍历所有有效交易索引`<br><br>**预期结果**`返回详细的交易信息`|
|<a name="FCJT_getTransactionByBlockNumberAndIndex_000050"></a>FCJT_getTransactionB<br>yBlockNumberAndIndex<br>_000050|有效区块编号，无效交易索引|**预置条件**`区块内有数笔交易`<br><br>**输入内容**`查询有效区块编号（包括earliest、latest、pending等），但是交易索引无效（比如一个很大的数值、负数、小数、乱码字符串等）`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getTransactionByBlockNumberAndIndex_000060"></a>FCJT_getTransactionB<br>yBlockNumberAndIndex<br>_000060|无效区块编号|**预置条件**`无`<br><br>**输入内容**`查询无效区块编号（不存在的编号、负数、乱码字符串等），索引为任意数字或字符串等`<br><br>**预期结果**`返回相应的提示信息`|
