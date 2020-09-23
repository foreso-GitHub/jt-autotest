tc qdisc del dev eth0 root netem 
tc qdisc add dev eth0 root netem duplicate 100%
tc qdisc show
