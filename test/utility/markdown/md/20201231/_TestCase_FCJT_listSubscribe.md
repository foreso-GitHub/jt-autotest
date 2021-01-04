|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|
|----------------|----------------|----------------|
|<a name="FCJT_listSubscribe_000010"></a>FCJT_listSubscribe_0<br>00010|参数为空_01|**预置条件**`client订阅了block、tx、多个token（全局和带issuer的都有）、多个account`<br><br>**输入内容**`参数列表为空`<br><br>**预期结果**`返回所有的订阅内容`|
|<a name="FCJT_listSubscribe_000020"></a>FCJT_listSubscribe_0<br>00020|参数为空_02|**预置条件**`client没有订阅任何信息`<br><br>**输入内容**`参数列表为空`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_listSubscribe_000030"></a>FCJT_listSubscribe_0<br>00030|参数为block_01|**预置条件**`client订阅了block`<br><br>**输入内容**`参数列表为["block"]`<br><br>**预期结果**`返回所有的订阅内容`|
|<a name="FCJT_listSubscribe_000040"></a>FCJT_listSubscribe_0<br>00040|参数为block_02|**预置条件**`client没有订阅block`<br><br>**输入内容**`参数列表为["block"]`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_listSubscribe_000050"></a>FCJT_listSubscribe_0<br>00050|参数为tx_01|**预置条件**`client订阅了tx`<br><br>**输入内容**`参数列表为["tx"]`<br><br>**预期结果**`返回所有的订阅内容`|
|<a name="FCJT_listSubscribe_000060"></a>FCJT_listSubscribe_0<br>00060|参数为tx_02|**预置条件**`client没有订阅tx`<br><br>**输入内容**`参数列表为["tx"]`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_listSubscribe_000070"></a>FCJT_listSubscribe_0<br>00070|参数为token_01|**预置条件**`client订阅了多个token（全局的和带issuer的都有）`<br><br>**输入内容**`参数列表为["token"]`<br><br>**预期结果**`返回所有的订阅内容`|
|<a name="FCJT_listSubscribe_000080"></a>FCJT_listSubscribe_0<br>00080|参数为token_02|**预置条件**`client没有订阅token`<br><br>**输入内容**`参数列表为["token"]`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_listSubscribe_000090"></a>FCJT_listSubscribe_0<br>00090|参数为account_01|**预置条件**`client订阅了多个account`<br><br>**输入内容**`参数列表为["account"]`<br><br>**预期结果**`返回所有的订阅内容`|
|<a name="FCJT_listSubscribe_000100"></a>FCJT_listSubscribe_0<br>00100|参数为account_02|**预置条件**`client没有订阅account`<br><br>**输入内容**`参数列表为["account"]`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_listSubscribe_000110"></a>FCJT_listSubscribe_0<br>00110|无效的参数|**预置条件**`无`<br><br>**输入内容**`参数列表的内容不是block/tx/token/account，可以是数字、乱码字符串等等`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_listSubscribe_000120"></a>FCJT_listSubscribe_0<br>00120|参数包含多个内容_01|**预置条件**`client订阅了block、tx、多个token（全局和带issuer的都有）、多个account`<br><br>**输入内容**`"参数列表为[""block""`<br><br>**预期结果**`""tx""`|
|<a name="FCJT_listSubscribe_000130"></a>FCJT_listSubscribe_0<br>00130|参数包含多个内容_02|**预置条件**`client订阅了block、tx、多个token（全局和带issuer的都有）、多个account`<br><br>**输入内容**`"参数列表为[""block""`<br><br>**预期结果**`""token""]"`|
|<a name="FCJT_listSubscribe_000140"></a>FCJT_listSubscribe_0<br>00140|参数包含多个内容_03|**预置条件**`client订阅了block、tx、多个token（全局和带issuer的都有）、多个account`<br><br>**输入内容**`"参数列表为[""tx""`<br><br>**预期结果**` ""account""]"`|
|<a name="FCJT_listSubscribe_000150"></a>FCJT_listSubscribe_0<br>00150|参数包含多个内容_04|**预置条件**`client订阅了block、tx、多个token（全局和带issuer的都有）、多个account`<br><br>**输入内容**`"参数列表包含一个有效的参数，一个无效的参数，比如[""block""`<br><br>**预期结果**`""123""]"`|
|<a name="FCJT_listSubscribe_000160"></a>FCJT_listSubscribe_0<br>00160|参数包含多个内容_05|**预置条件**`无`<br><br>**输入内容**`"参数列表包含几个无效的参数，比如[""abc""`<br><br>**预期结果**`""123""]"`|
|<a name="FCJT_listSubscribe_000170"></a>FCJT_listSubscribe_0<br>00170|参数包含多个内容_06|**预置条件**`client订阅了block、tx、多个token（全局和带issuer的都有），没有订阅account`<br><br>**输入内容**`"参数列表为[""block""`<br><br>**预期结果**`""account""]"`|
|<a name="FCJT_listSubscribe_000180"></a>FCJT_listSubscribe_0<br>00180|参数包含多个内容_07|**预置条件**`client订阅了block、多个token（全局和带issuer的都有）、多个account，没有订阅tx`<br><br>**输入内容**`"参数列表为[""tx""`<br><br>**预期结果**` ""token""]"`|
|<a name="FCJT_listSubscribe_000190"></a>FCJT_listSubscribe_0<br>00190|参数包含多个内容_08|**预置条件**`client什么都没订阅`<br><br>**输入内容**`"参数列表为[""block""`<br><br>**预期结果**`""tx""`|
