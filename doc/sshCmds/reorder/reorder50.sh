tc qdisc del dev eth0 root netem 
tc qdisc add dev eth0 root netem delay 2000ms reorder 50%
tc qdisc show
