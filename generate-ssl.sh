#!/bin/bash

# Create SSL directory
mkdir -p ssl

# Generate private key
openssl genrsa -out ssl/localhost-key.pem 2048

# Generate certificate signing request
openssl req -new -key ssl/localhost-key.pem -out ssl/localhost.csr -subj "/C=US/ST=CA/L=Local/O=Dev/CN=localhost"

# Generate self-signed certificate
openssl x509 -req -in ssl/localhost.csr -signkey ssl/localhost-key.pem -out ssl/localhost-cert.pem -days 365 -extensions v3_req -extfile <(
cat <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req

[req_distinguished_name]

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
EOF
)

echo "SSL certificates generated in ssl/ directory"
echo "Key: ssl/localhost-key.pem"
echo "Cert: ssl/localhost-cert.pem"
