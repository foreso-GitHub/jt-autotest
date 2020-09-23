tc qdisc del dev eth0 root netem 
tc qdisc add dev eth0 root netem delay 24000ms
tc qdisc show
