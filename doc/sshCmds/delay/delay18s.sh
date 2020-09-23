tc qdisc del dev eth0 root netem 
tc qdisc add dev eth0 root netem delay 18000ms
tc qdisc show
