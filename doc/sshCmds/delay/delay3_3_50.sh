tc qdisc del dev eth0 root netem 
tc qdisc add dev eth0 root netem delay 3000ms 3000ms 50%
tc qdisc show
