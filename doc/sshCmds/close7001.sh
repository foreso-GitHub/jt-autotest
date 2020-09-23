iptables -F
iptables -t filter -A INPUT -p udp --dport 7001 -j DROP
iptables -nL
