#!/bin/bash

# Default values for BLOCK_PROXIES and BLOCK_VPNS if not set
: ${BLOCK_PROXIES:=false}
: ${BLOCK_VPNS:=false}
: ${TEST_LOCALHOST:=false}
: ${RESOLVER:=1.1.1.1}
: ${CHECK_XFORWARDED_FOR:=false}
: ${VERIFIED_HEADER_VALUE:=True}

# Export the variables so they can be used with envsubst
export BLOCK_PROXIES
export BLOCK_VPNS
export TEST_LOCALHOST
export RESOLVER
export CHECK_XFORWARDED_FOR
export VERIFIED_HEADER_VALUE

sed "s/{SITE_TOKEN}/$SITE_TOKEN/g" /templates/captcha_page.html > /local-content/captcha_page.html
export COOKIE_SECRET=$(uuidgen)

# Check for the presence of SSL certificate and key
if [ -f /etc/ssl/certs/nginx.crt ] && [ -f /etc/ssl/private/nginx.key ]; then
    # HTTPS certificates are available
    export SSL_CERT="ssl_certificate /etc/ssl/certs/nginx.crt;"
    export SSL_KEY="ssl_certificate_key /etc/ssl/private/nginx.key;"
    export LISTEN_CFG="listen 443 ssl;"
else
    # HTTPS certificates are not available, disable HTTPS configuration
    export SSL_CERT=""
    export SSL_KEY=""
    export LISTEN_CFG="listen 80;"
fi

# Use environment variables to substitute placeholders in the NGINX config template
envsubst '${VERIFIED_HEADER_VALUE} ${CHECK_XFORWARDED_FOR} ${RESOLVER} ${TEST_LOCALHOST} ${LISTEN_CFG} ${VERIFY_TOKEN} ${COOKIE_SECRET} ${PROXY_PASS} ${BLOCK_PROXIES} ${BLOCK_VPNS} ${SSL_CERT} ${SSL_KEY}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf

nginx -g "daemon off;"
