FROM nginx:latest

# Install the nginx njs module
RUN apt-get update && \
    apt-get install -y nginx-module-njs uuid-runtime && \
    rm -rf /var/lib/apt/lists/*

ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx

RUN mkdir /nginx-scripts/
RUN mkdir /local-content/
RUN mkdir /templates/
COPY entrypoint.sh /sbin/entrypoint.sh
COPY nginx.conf /etc/nginx/templates/nginx.conf.template
COPY captcha.js /nginx-scripts/captcha.js
COPY template_captcha_page.html /templates/captcha_page.html
RUN chmod a+rx /sbin/entrypoint.sh

EXPOSE 80
EXPOSE 443

CMD ["/sbin/entrypoint.sh"]