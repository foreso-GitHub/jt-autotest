tc qdisc del dev eth0 root netem 
tc qdisc add dev eth0 root netem delay 1ms 500ms 1%
tc qdisc show
