tc qdisc del dev eth0 root netem 
tc qdisc add dev eth0 root netem delay 2000ms reorder 70%
tc qdisc show
