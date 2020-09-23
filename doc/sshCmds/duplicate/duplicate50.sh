tc qdisc del dev eth0 root netem 
tc qdisc add dev eth0 root netem duplicate 50%
tc qdisc show
