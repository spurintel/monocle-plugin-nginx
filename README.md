# monocle-nginx-plugin

docker build -t spurflare .

docker run -it --rm --name spurflare -e PROXY_PASS=https://spur.us -e SITE_TOKEN={set site token} -e VERIFY_TOKEN={set verify token} -p 8080:80 spurflare:latest