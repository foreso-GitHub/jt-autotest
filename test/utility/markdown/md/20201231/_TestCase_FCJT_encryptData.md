|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|
|----------------|----------------|----------------|
|<a name="FCJT_encryptData_000010"></a>FCJT_encryptData_000<br>010|无效的address参数_01|**预置条件**`无`<br><br>**输入内容**`address参数是一个不存在的地址`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_encryptData_000020"></a>FCJT_encryptData_000<br>020|无效的address参数_02|**预置条件**`无`<br><br>**输入内容**`address参数是一个存在的地址，但是没有底层币`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_encryptData_000030"></a>FCJT_encryptData_000<br>030|无效的secret参数_01|**预置条件**`无`<br><br>**输入内容**`secret参数位数不够、或过长、或不以s开头`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_encryptData_000040"></a>FCJT_encryptData_000<br>040|无效的secret参数_02|**预置条件**`无`<br><br>**输入内容**`secret参数格式正确，但不是from地址正确的秘钥`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_encryptData_000050"></a>FCJT_encryptData_000<br>050|无效的data参数|**预置条件**`无`<br><br>**输入内容**`data参数包含非十六进制字符`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_encryptData_000060"></a>FCJT_encryptData_000<br>060|data参数最大长度测试|**预置条件**`无`<br><br>**输入内容**`其他参数都有效，输入很长的十六进制字符串作为data参数（长度可以逐渐增加），测试该参数是否有最大长度限制`<br><br>**预期结果**`数据加密成功或返回相应的提示信息`|
|<a name="FCJT_encryptData_000070"></a>FCJT_encryptData_000<br>070|有效的数据加密测试|**预置条件**`无`<br><br>**输入内容**`所以参数都有效`<br><br>**预期结果**`数据加密成功`|
