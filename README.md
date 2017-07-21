# nodejs_webrtc

generate private.key
openssl req -new -newkey rsa:2048 -nodes -out mydomain.csr -keyout private.key

generate srt
openssl x509 -req -in mydomain.csr -signkey private.key -out server.crt
