tc qdisc del dev eth0 root netem 
tc qdisc add dev eth0 root netem duplicate 30%
tc qdisc show
