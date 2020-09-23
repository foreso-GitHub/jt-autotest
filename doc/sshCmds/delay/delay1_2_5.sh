tc qdisc del dev eth0 root netem 
tc qdisc add dev eth0 root netem delay 1000ms 2000ms 5%
tc qdisc show
