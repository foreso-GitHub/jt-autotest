|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|
|----------------|----------------|----------------|
|<a name="FCJT_getBlockByNumber_000010"></a>FCJT_getBlockByNumbe<br>r_000010|有效区块编号，Boolean为ture|**预置条件**`无`<br><br>**输入内容**`查询有效区块编号（第一个区块、最新的区块等），第二个参数为ture`<br><br>**预期结果**`返回指定区块内所有交易的整个对象`|
|<a name="FCJT_getBlockByNumber_000020"></a>FCJT_getBlockByNumbe<br>r_000020|有效区块编号，Boolean为false|**预置条件**`无`<br><br>**输入内容**`查询有效区块编号（第一个区块、最新的区块等），第二个参数为false`<br><br>**预期结果**`返回指定区块内所有交易的哈希`|
|<a name="FCJT_getBlockByNumber_000030"></a>FCJT_getBlockByNumbe<br>r_000030|区块编号为"earliest"，Boolean为ture|**预置条件**`无`<br><br>**输入内容**`查询"earliest"区块，第二个参数为ture`<br><br>**预期结果**`返回指定区块内所有交易的整个对象`|
|<a name="FCJT_getBlockByNumber_000040"></a>FCJT_getBlockByNumbe<br>r_000040|区块编号为"earliest"，Boolean为false|**预置条件**`无`<br><br>**输入内容**`查询"earliest"区块，第二个参数为false`<br><br>**预期结果**`返回指定区块内所有交易的哈希`|
|<a name="FCJT_getBlockByNumber_000050"></a>FCJT_getBlockByNumbe<br>r_000050|区块编号为"latest"，Boolean为ture|**预置条件**`无`<br><br>**输入内容**`查询"latest"区块，第二个参数为ture`<br><br>**预期结果**`返回指定区块内所有交易的整个对象`|
|<a name="FCJT_getBlockByNumber_000060"></a>FCJT_getBlockByNumbe<br>r_000060|区块编号为"latest"，Boolean为false|**预置条件**`无`<br><br>**输入内容**`查询"latest"区块，第二个参数为false`<br><br>**预期结果**`返回指定区块内所有交易的哈希`|
|<a name="FCJT_getBlockByNumber_000090"></a>FCJT_getBlockByNumbe<br>r_000090|区块编号为"pending"，Boolean为ture|**预置条件**`无`<br><br>**输入内容**`查询"pending"区块，第二个参数为ture`<br><br>**预期结果**`返回指定区块内所有交易的整个对象`|
|<a name="FCJT_getBlockByNumber_000100"></a>FCJT_getBlockByNumbe<br>r_000100|区块编号为"pending"，Boolean为false|**预置条件**`无`<br><br>**输入内容**`查询"pending"区块，第二个参数为false`<br><br>**预期结果**`返回指定区块内所有交易的哈希`|
|<a name="FCJT_getBlockByNumber_000110"></a>FCJT_getBlockByNumbe<br>r_000110|有效区块编号，无效Boolean参数|**预置条件**`无`<br><br>**输入内容**`查询有效区块编号（包括earliest、latest、pending等），第二个参数既不是ture也不是false、或者不写第二个参数`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getBlockByNumber_000120"></a>FCJT_getBlockByNumbe<br>r_000120|无效区块编号|**预置条件**`无`<br><br>**输入内容**`查询无效区块编号（不存在的编号、负数、乱码字符串等），Boolean可以为ture、false、或其他任意值或不填`<br><br>**预期结果**`返回相应的提示信息`|
