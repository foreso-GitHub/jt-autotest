***
共识状态格式说明
===
## network - 5 5 - consensus init - true true true true - 5 5 5 4
1. network
2. 5 5
* 第1个5：discover的节点个数（已废弃）
* 第2个5：peer的节点个数（已废弃）
3. consensus init
* consensus init：处于共识
* select init：选择leader
* idle init：
4. true true true true
* true true true true和5 5 5 4对应
* 节点数够就是true，比如5节点时有3节点共识，则最后状态位就是true
5. 5 5 5 4
* 在网络中的节点数
* 已经链接（peer）的节点数
* 已经交换信息的节点数
* 处于共识的节点数

## 例子
* 共识的状态
> I0914 10:33:27.500994   25563 network.go:850] network - 5 5 - consensus init - true true true true - 5 5 5 4
>
> I0914 10:33:27.501017   25563 network.go:899] --- peers connected --- true 4 consensus init - true true true true - 5 5 5 4

* 退出共识的状态
> I0914 10:33:27.504815   19786 network.go:850] network - 5 5 - select init - true true true false - 5 5 5 1
>
> I0914 10:33:27.504893   19786 network.go:899] --- peers connected --- false 1 select init - true true true false - 5 5 5 1


