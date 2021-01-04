|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|
|----------------|----------------|----------------|
|<a name="FCJT_getTransactionByIndex_000010"></a>FCJT_getTransactionB<br>yIndex_000010|有效的地址，有效的sequence|**预置条件**`地址有历史交易`<br><br>**输入内容**`查询有效的地址，遍历所有的有效sequence`<br><br>**预期结果**`返回详细的交易信息`|
|<a name="FCJT_getTransactionByIndex_000020"></a>FCJT_getTransactionB<br>yIndex_000020|有效的地址，无效的sequence|**预置条件**`地址有历史交易`<br><br>**输入内容**`查询有效的地址，但是sequence无效（比如一个很大的数值、0、负数、小数、乱码字符串等）`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getTransactionByIndex_000030"></a>FCJT_getTransactionB<br>yIndex_000030|无效的地址参数_01|**预置条件**`无`<br><br>**输入内容**`地址长度不够、或者过长、或者不以j开头`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getTransactionByIndex_000040"></a>FCJT_getTransactionB<br>yIndex_000040|无效的地址参数_02|**预置条件**`无`<br><br>**输入内容**`地址长度没问题且以j开头，但是一个不存在没被使用过的地址`<br><br>**预期结果**`返回相应的提示信息`|
