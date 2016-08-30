#!/bin/sh
# generate some basic datastream to test the web page
KEY=$1
MQHOST=192.168.255.74  # <<< probably want to change this!
while true; do for x in $(seq 10); do
	mosquitto_pub -h $MQHOST -t mqsvg/json/hoho -m "{\"name\": \"$1\", \"value\": $x}";
sleep 1;
done done
