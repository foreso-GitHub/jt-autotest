tc qdisc del dev eth0 root netem 
tc qdisc add dev eth0 root netem delay 1000ms 3000ms 20%
tc qdisc show
