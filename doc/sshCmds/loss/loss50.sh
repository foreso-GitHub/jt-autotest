tc qdisc del dev eth0 root netem 
tc qdisc add dev eth0 root netem loss 50%
tc qdisc show
