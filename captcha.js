function checkCookieAndCaptcha(r) {
    var cookie = r.headersIn.Cookie;
    // Check if the secure cookie is present and valid
    if (cookie && cookie.includes("MCLVALID")) {
        // Implement your logic to validate the cookie value
        // For simplicity, let's assume a function validateCookie exists
        if (validateCookie(r)) {
            // Perform an internal subrequest to proxy the request
            r.internalRedirect('/internal_proxy');
            return
        }
    }
    // If no valid cookie, redirect to the captcha page
    var host = r.headersIn['Host']; // Host header contains the hostname and port (if specified)
    var protocol = r.variables.scheme; // The scheme (http or https)
    var redirectUrl = protocol + '://' + host + `/captcha_page.html?uri=${r.uri}`;

    r.return(302, redirectUrl);

}



function validateCaptcha(r) {
    // Define the URL of the third-party API
    let thirdPartyApiUrl = 'https://decrypt.mcl.spur.us/api/v1/assessment';
    // Prepare the request to the third-party API
    let data = JSON.parse(r.requestText)
    ngx.fetch(thirdPartyApiUrl, {
        method: 'POST',
        body: data.captchaData,
        headers: {
            'Content-Type': 'text/plain',
            'Token': r.variables.mclVerifyToken,
        },
    }).then(response => {
        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }
        return response.json();
    }).then(data => {
        let clientIpAddress = r.remoteAddress;

        // Parse the timestamp from the response
        let responseTime = new Date(data.ts);

        // Get the current time
        let currentTime = new Date();

        // Calculate the difference in seconds
        let timeDifference = Math.abs(currentTime - responseTime) / 1000;

        // Check if the time difference is within 5 seconds
        if (timeDifference > 5) {
            r.return(403, JSON.stringify(data));
            return;
            // The time is within 5 seconds, proceed with further logic
        }
        if (r.variables.blockVPNs !== "false" && data.anon && data.vpn) {
            r.return(403, JSON.stringify(data));
            return
        }
        if (r.variables.blockProxies !== "false" && data.anon && data.proxied) {
            r.return(403, JSON.stringify(data));
            return
        }
        if (r.variables.testLocalhost !== "false" || data.ip == clientIpAddress) {
            setSecureCookie(r);
            r.return(200);
        } else {
            r.return(403, JSON.stringify(data));
        }
    }).catch(error => {
        ngx.log(1, `Error calling third-party API: ${error.message}`);
        r.return(500, "Internal Server Error");
    });
}


function setSecureCookie(r) {
    var cookieValue = r.remoteAddress;
    var expiryTime = Math.floor(Date.now() / 1000) + 3600; // Current time in seconds since the epoch plus 3600 seconds (1 hour)
    var cookiePayload = `${cookieValue}|${expiryTime}`;

    var secretKey = r.variables.cookieSecret; // Keep this secret and secure
    var hmac = require('crypto').createHmac('sha256', secretKey);

    hmac.update(cookiePayload);
    var signature = hmac.digest('hex');

    // Combine the value, expiry, and the signature
    var signedValue = `${cookiePayload}:${signature}`;

    // Set the cookie in the response header
    r.headersOut['Set-Cookie'] = `MCLVALID=${signedValue}; Secure; HttpOnly; Path=/; SameSite=Strict`;
}

function validateCookie(r) {
    var cookies = r.headersIn.Cookie;
    if (!cookies) {
        return false;
    }
    // Extracting the specific cookie
    var cookieName = "MCLVALID=";
    var start = cookies.indexOf(cookieName);
    if (start === -1) {
        return false;
    }

    start += cookieName.length;
    var end = cookies.indexOf(';', start);
    if (end === -1) {
        end = cookies.length;
    }

    var receivedCookie = cookies.substring(start, end);
    receivedCookie = receivedCookie.replace('MCLVALID=', '');
    var parts = receivedCookie.split(':');
    if (parts.length !== 2) {
        return false;
    }
    var payloadParts = parts[0].split('|');
    if (payloadParts.length !== 2) {
        return false;
    }
    var cookieValue = payloadParts[0];
    if (cookieValue != r.remoteAddress) {
        ngx.log(1, `Does not match remote address ${cookieValue} ${r.remoteAddress}`);
        return false;
    }
    var expiryTime = parseInt(payloadParts[1], 10);
    var receivedSignature = parts[1];

    // Check if the cookie is expired
    if (Math.floor(Date.now() / 1000) >= expiryTime) {
        return false;
    }

    // Validate the signature
    var hmac = require('crypto').createHmac('sha256', r.variables.cookieSecret);
    hmac.update(parts[0]); // parts[0] is the cookieValue|expiryTime
    var validSignature = hmac.digest('hex');
    return receivedSignature === validSignature;
}


export default { checkCookieAndCaptcha, validateCaptcha };
