|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|
|----------------|----------------|----------------|
|<a name="FCJT_removeData_000010"></a>FCJT_removeData_0000<br>10|无效的from参数_01|**预置条件**`无`<br><br>**输入内容**`from地址参数位数不够、或过长、或不以j开头`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_removeData_000020"></a>FCJT_removeData_0000<br>20|无效的from参数_02|**预置条件**`无`<br><br>**输入内容**`from地址参数格式正确，但地址内没有底层币等任何币种`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_removeData_000030"></a>FCJT_removeData_0000<br>30|无效的to参数_01|**预置条件**`无`<br><br>**输入内容**`to地址参数位数不够、或过长、或不以j开头`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_removeData_000040"></a>FCJT_removeData_0000<br>40|无效的to参数_02|**预置条件**`无`<br><br>**输入内容**`to地址参数格式正确，但地址内没有底层币等任何币种`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_removeData_000050"></a>FCJT_removeData_0000<br>50|无效的fee参数_01|**预置条件**`无`<br><br>**输入内容**`fee为0、小数、负数、或字符串等`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_removeData_000060"></a>FCJT_removeData_0000<br>60|无效的fee参数_02|**预置条件**`无`<br><br>**输入内容**`fee为不足以发起交易的数`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_removeData_000070"></a>FCJT_removeData_0000<br>70|无效的fee参数_03|**预置条件**`无`<br><br>**输入内容**`fee大于12，但是超过from地址的余额`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_removeData_000080"></a>FCJT_removeData_0000<br>80|无效的secret参数_01|**预置条件**`无`<br><br>**输入内容**`secret参数位数不够、或过长、或不以s开头`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_removeData_000090"></a>FCJT_removeData_0000<br>90|无效的secret参数_02|**预置条件**`无`<br><br>**输入内容**`secret参数格式正确，但不是from地址正确的秘钥`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_removeData_000100"></a>FCJT_removeData_0001<br>00|无效的data参数_01|**预置条件**`无`<br><br>**输入内容**`data参数哈希长度不够或过长`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_removeData_000110"></a>FCJT_removeData_0001<br>10|无效的data参数_02|**预置条件**`无`<br><br>**输入内容**`data参数哈希没有被存证过`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_removeData_000120"></a>FCJT_removeData_0001<br>20|有效的删除数据交易|**预置条件**`无`<br><br>**输入内容**`所有参数有效`<br><br>**预期结果**`删除数据成功`|
