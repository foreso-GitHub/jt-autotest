tc qdisc del dev eth0 root netem 
tc qdisc add dev eth0 root netem corrupt 80%
tc qdisc show
