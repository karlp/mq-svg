while true; do for x in $(seq 10); do mosquitto_pub -h 192.168.255.74 -t mqsvg/json/hoho -m "{'name': 'nomdenom', 'value': $x}"; sleep 1; done done
