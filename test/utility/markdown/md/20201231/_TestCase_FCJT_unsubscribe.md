|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|
|----------------|----------------|----------------|
|<a name="FCJT_unsubscribe_000010"></a>FCJT_unsubscribe_000<br>010|取消订阅区块block_01|**预置条件**`已订阅区块`<br><br>**输入内容**`取消订阅区块，订阅内容为block，无订阅参数`<br><br>**预期结果**`取消订阅成功，停止推送相关信息`|
|<a name="FCJT_unsubscribe_000011"></a>FCJT_unsubscribe_000<br>011|取消订阅区块block_02|**预置条件**`无订阅区块`<br><br>**输入内容**`client没有订阅区块，但是发送取消订阅区块block请求`<br><br>**预期结果**`取消订阅失败，返回相应的提示信息`|
|<a name="FCJT_unsubscribe_000012"></a>FCJT_unsubscribe_000<br>012|取消订阅区块block_03|**预置条件**`已订阅区块`<br><br>**输入内容**`取消订阅区块，订阅内容为block，订阅参数为任意值`<br><br>**预期结果**`取消订阅失败，返回相应的提示信息`|
|<a name="FCJT_unsubscribe_000020"></a>FCJT_unsubscribe_000<br>020|取消订阅交易tx_01|**预置条件**`已订阅交易`<br><br>**输入内容**`取消订阅交易，订阅内容为tx，无订阅参数`<br><br>**预期结果**`取消订阅成功，停止推送相关信息`|
|<a name="FCJT_unsubscribe_000021"></a>FCJT_unsubscribe_000<br>021|取消订阅交易tx_02|**预置条件**`无订阅交易`<br><br>**输入内容**`client没有订阅交易，但是发送取消订阅交易tx请求`<br><br>**预期结果**`取消订阅失败，返回相应的提示信息`|
|<a name="FCJT_unsubscribe_000022"></a>FCJT_unsubscribe_000<br>022|取消订阅交易tx_03|**预置条件**`已订阅区块`<br><br>**输入内容**`取消订阅交易，订阅内容为tx，订阅参数为任意值`<br><br>**预期结果**`取消订阅失败，返回相应的提示信息`|
|<a name="FCJT_unsubscribe_000030"></a>FCJT_unsubscribe_000<br>030|已订阅区块block，取消订阅交易tx|**预置条件**`已订阅区块`<br><br>**输入内容**`取消订阅交易，订阅内容为tx，无订阅参数`<br><br>**预期结果**`取消失败，继续推送区块信息`|
|<a name="FCJT_unsubscribe_000040"></a>FCJT_unsubscribe_000<br>040|已订阅交易tx，取消订阅区块block|**预置条件**`已订阅交易`<br><br>**输入内容**`取消订阅区块，订阅内容为block，无订阅参数`<br><br>**预期结果**`取消失败，继续推送交易信息`|
|<a name="FCJT_unsubscribe_000050"></a>FCJT_unsubscribe_000<br>050|取消订阅-无效的订阅内容|**预置条件**`已订阅区块或交易`<br><br>**输入内容**`取消订阅时提供无效的订阅内容，比如非block/tx/token/account、超长字符串数字等，一些特殊字符等`<br><br>**预期结果**`取消失败，继续推送订阅的信息`|
|<a name="FCJT_unsubscribe_000060"></a>FCJT_unsubscribe_000<br>060|取消订阅-订阅内容为空|**预置条件**`已订阅区块或交易`<br><br>**输入内容**`取消订阅时订阅内容为空`<br><br>**预期结果**`取消失败，继续推送订阅的信息`|
|<a name="FCJT_unsubscribe_000070"></a>FCJT_unsubscribe_000<br>070|取消订阅token，不带参数|**预置条件**`无`<br><br>**输入内容**`取消订阅内容为token，但不带参数`<br><br>**预期结果**`取消订阅失败，返回相应的提示信息`|
|<a name="FCJT_unsubscribe_000080"></a>FCJT_unsubscribe_000<br>080|取消订阅token，参数为空|**预置条件**`无`<br><br>**输入内容**`取消订阅内容为token，但参数为空`<br><br>**预期结果**`取消订阅失败，返回相应的提示信息`|
|<a name="FCJT_unsubscribe_000090"></a>FCJT_unsubscribe_000<br>090|取消订阅不存在的token|**预置条件**`无`<br><br>**输入内容**`取消订阅内容为token，但参数是不存在的token名字`<br><br>**预期结果**`取消订阅失败，返回相应的提示信息`|
|<a name="FCJT_unsubscribe_000100"></a>FCJT_unsubscribe_000<br>100|取消订阅全局token|**预置条件**`有订阅的全局token`<br><br>**输入内容**`取消订阅内容为token，参数是某全局token名字`<br><br>**预期结果**`取消订阅成功，停止推送相关信息`|
|<a name="FCJT_unsubscribe_000110"></a>FCJT_unsubscribe_000<br>110|取消订阅带issuer的token_01|**预置条件**`有订阅的带issuer的token`<br><br>**输入内容**`取消订阅内容为token，参数是token名字/正确的issuer地址`<br><br>**预期结果**`取消订阅成功，停止推送相关信息`|
|<a name="FCJT_unsubscribe_000120"></a>FCJT_unsubscribe_000<br>120|取消订阅带issuer的token_02|**预置条件**`有订阅的带issuer的token`<br><br>**输入内容**`取消订阅内容为token，参数是token名字/错误的issuer地址`<br><br>**预期结果**`取消订阅失败，返回相应的提示信息`|
|<a name="FCJT_unsubscribe_000130"></a>FCJT_unsubscribe_000<br>130|取消订阅account，不带参数|**预置条件**`无`<br><br>**输入内容**`取消订阅内容为account，但不带参数`<br><br>**预期结果**`取消订阅失败，返回相应的提示信息`|
|<a name="FCJT_unsubscribe_000140"></a>FCJT_unsubscribe_000<br>140|取消订阅account，参数为空|**预置条件**`无`<br><br>**输入内容**`取消订阅内容为account，但参数为空`<br><br>**预期结果**`取消订阅失败，返回相应的提示信息`|
|<a name="FCJT_unsubscribe_000150"></a>FCJT_unsubscribe_000<br>150|取消订阅非法的account地址|**预置条件**`无`<br><br>**输入内容**`取消订阅内容为account，但参数是非法的地址`<br><br>**预期结果**`取消订阅失败，返回相应的提示信息`|
|<a name="FCJT_unsubscribe_00"></a>FCJT_unsubscribe_00|取消订阅无效的account地址|**预置条件**`无`<br><br>**输入内容**`取消订阅内容为account，参数是合法的地址，但是该地址没被订阅过`<br><br>**预期结果**`取消订阅失败，返回相应的提示信息`|
|<a name="FCJT_unsubscribe_000160"></a>FCJT_unsubscribe_000<br>160|取消订阅有效的account地址|**预置条件**`client有订阅的account`<br><br>**输入内容**`取消订阅内容为account，参数是合法的地址，且该地址也被订阅过`<br><br>**预期结果**`取消订阅成功，停止推送相关信息`|
|<a name="FCJT_unsubscribe_000170"></a>FCJT_unsubscribe_000<br>170|取消所有订阅_01|**预置条件**`client订阅了block、tx、多个token（全局和带issuer的都有）、多个account`<br><br>**输入内容**`取消订阅内容为all，不带参数`<br><br>**预期结果**`取消订阅成功，停止推送相关信息`|
|<a name="FCJT_unsubscribe_000180"></a>FCJT_unsubscribe_000<br>180|取消所有订阅_02|**预置条件**`client订阅了block、tx、多个token（全局和带issuer的都有）、多个account`<br><br>**输入内容**`取消订阅内容为all，带参数，参数内容为任意值`<br><br>**预期结果**`取消订阅失败，返回相应的提示信息`|
|<a name="FCJT_unsubscribe_000190"></a>FCJT_unsubscribe_000<br>190|取消所有订阅_03|**预置条件**`client没有订阅任何信息`<br><br>**输入内容**`取消订阅内容为all，不带参数`<br><br>**预期结果**`取消订阅失败，返回相应的提示信息`|
