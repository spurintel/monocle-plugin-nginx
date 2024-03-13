#!/bin/bash

sed "s/{SITE_TOKEN}/$SITE_TOKEN/g" /templates/captcha_page.html > /local-content/captcha_page.html
export COOKIE_SECRET=$(uuidgen)

envsubst '${VERIFY_TOKEN} ${COOKIE_SECRET} ${PROXY_PASS}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf

nginx -g "daemon off;"