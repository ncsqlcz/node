##生成crt文件
openssl x509 -req -days 3650 -in server.csr -signkey server.key -out server.crt
