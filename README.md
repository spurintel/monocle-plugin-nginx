# Monocle by Spur
Easily deploy a reverse NGINX proxy that applies Monocle automatically to protect your site from residential proxies, malware proxies, or other commerical anonymity services.

## Description

Monocle can detect a user session coming from a residential proxy, malware proxy, or other endpoint based proxy network. By detecting this at the session level, you can take action on abusive users without impacting legitimate ones.

[Monocle](https://spur.us/monocle)  
[Docs](https://docs.spur.us/#/monocle)  
[FAQ](https://spur.us/monocle/#faqs)  
[Demo](https://spur.us/app/demos/monocle/form)  
[Blog](https://spur.us/announcing-monocle-community-edition) 

This NGINX container will automatically force a Monocle render on new users before allowing them access to your site. Authentic users will not be negatively impacted. The cookie that this plugin sets for the user is good for an hour or whenever the user changes IP addresses.

## Help and Support

support@spur.us

### Installation

```
> docker pull spurintelligence/mclproxy:latest

> docker run -d --name mclproxy -e PROXY_PASS={proxy pass location} -e SITE_TOKEN={site token from spur} -e VERIFY_TOKEN={verify token from Spur} -e BLOCK_VPNS=true -e BLOCK_PROXIES=true -v {path to fullchain.pem}/etc/ssl/certs/nginx.crt -v {path to privatekey.pem}:/etc/ssl/private/nginx.key -p 0.0.0.0:443:443 spurintelligence/mclproxy:latest
```

Variables to set:

1. PROXY_PASS
    * Location that should be set for the NGINX proxy_pass variable
    * Example: https://spur.us
2. SITE_TOKEN
    * The site token provided to you when you create a new Monocle deployment within the Spur dashboard
3. VERIFY_TOKEN
    * This is the verification token provided by Spur. It is required that you select Spur managed encryption when creating the deployment
4. BLOCK_VPNS
    * By default, we do not block anything. Set this to block VPN services such as Mullvad, NordVPN, etc.
5. BLOCK_PROXIES
    * By default, we do not block anything. Set this to block all proxies whether they are datacenter, residential, mobile, or malware.

Specifying certificates is completely optional. If you do not specify certificates, NGINX will start on port 80 and serve insecure traffic. Adjust the port you use accordingly.

There is one optional parameter for testing locally.

1. TEST_LOCALHOST
    * Setting this value to `true` will allow localhost connections that might mismatch the IP address in the bundle. This should absolutely not be set in a production environment.

### Frequently Asked Questions

This section will be expanded after release and we receive more questions.

1. What are the different cases that get blocked by Spur?
    * This depends on the two block settings from the environment variables. `BLOCK_VPNS` and `BLOCK_PROXIES` does control this behavior. Additionally, a new Monocle evaluation will take place if the client IP address changes. This can be an issue in some legitimate environments. Depending on CGNAT or corporate gateways that may have external IP address rotation.

### How to get a monocle site token and verify token?

Follow the next steps in order to get and enable monocle protection:
1. Create an account at spur.us
2. Navigate to the dashboard.
3. Click the monocle tab at the top.
4. Click the create deployment button.
5. You will see your site and verify tokens. Copy them and apply them to the appropriate environment variables in the installation section.
6. Run the container.

### How to deploy for testing and development?

Testing locally is as simple as building the container and running locally. 

```
> docker build -t mclproxy .

> docker run -d --name mclproxy -e PROXY_PASS={proxy pass location} -e SITE_TOKEN={site token from spur} -e VERIFY_TOKEN={verify token from Spur} -e BLOCK_VPNS=true -e BLOCK_PROXIES=true -e TEST_LOCALHOST=true -p 80:80 mclproxy

```
