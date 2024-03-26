Installing apache to serve the tasmota binary

```
sudo apt install apache2 -y
sudo wget https://ota.tasmota.com/tasmota/release/tasmota.bin -O /var/www/html/tasmota.bin
```

this seems to work at
curl http://localhost/tasmota.bin --output send.bin

Then to make the device update:

```
curl -X POST "http://192.168.86.83:8081/zeroconf/upgrade" \
     -H "Content-Type: application/json" \
     -d '{
            "deviceid": "100177bb31",
            "data": {
                "binList": [
                    {
                        "downloadUrl": "http://192.168.86.84/tasmota.bin",
                        "digest": "84eb7452394f10b2bbce87f3a9b1046b7f47455321547e6fdc5727a637ae7c6d",
                        "name": "tasmota.bin"
                    }
                ]
            }
        }'
```

Time is not working in the sonoff. Commands below.

```
curl -X POST "http://192.168.86.83:8081/zeroconf/historicalData" \
     -H "Content-Type: application/json" \
     -d '{
           "deviceid": "100177bb31",
           "data": {
             "subDevId": "8e15474c3831311947313130",
             "outlet": 0,
             "dateStart": "2024-03-25 17:00",
             "dateEnd": "2024-03-25 22:00"
           }
         }'
```

```
curl -X POST "http://192.168.86.83:8081/zeroconf/time" \
 -H "Content-Type: application/json" \
 -d '{
"deviceid":"100177bb31",
"data": {
"timeZone":11,
"date":"2024-03-26T16:28:36.722Z"
}
}'
```
