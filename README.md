# Web Authentication - OTP/Biometric

This project is intended to showcase the web capabilities of password-less authentication with either an OTP sent by an SMS or with biometric authentication using the web authentication api (Webauthn).

## OTP With SMS Authentication

### Twilio

For this part of the project, I was advised to use [Twilio](https://www.twilio.com/en-us) to handle the SMS sending.
After setting up the server with help of the [Twilio Verify Docs](https://www.twilio.com/docs/verify/api) I look further for existing Web technologies for SMS code retrieving.

### WebOTP API

WebOTP API is an API inspired by [Android SMS Retriever API](https://developers.google.com/identity/sms-retriever/overview) and [IOS one-time-code'S API](https://developer.apple.com/documentation/security/password_autofill/enabling_password_autofill_on_an_html_input_element) that brings SMS retrieving and auto filling functionality to JS and the browser.

To use this technology, you need to provide an autoComplete attribute to the code input tag and set it to 'one-time-code' as I've done below, other wise autofill will not work:

```
<input
    type='text'
    name='verificationCode'
    inputMode='numeric'
    required
    autoComplete='one-time-code' <------ important!
    id='one-time-code'
    value={otp}
    onChange={(e) => setOtp(e.target.value)}
/>
```

After the user provides their phone number and the app sends an SMS, you can start the code retrieval. Here I do it on component mount:

```
useEffect(() => {
    if ('OTPCredential' in window) { // Check for support
        const form = formRef.current;
        const ac = new AbortController();
        const handler = () => {
            ac.abort();
        };
        form.addEventListener('submit', handler);
        navigator.credentials
            .get({
                otp: { transport: ['sms'] },
                signal: ac.signal,
            })
            .then((otp) => {
                setOtp(otp.code);
                form.submit();
            })
            .catch((err) => {
                console.log(err);
            });
    }
    return () => {
        form.removeEventListener('submit', handler);
    };
}, []);
```

It's important to note that this technology is relatively new and is not supported on every browser.

For further documentation/info, go to either [MDN's Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebOTP_API) or to [this developer's blog post](https://developer.chrome.com/articles/web-otp/)

## Biometric Authentication (fingerprint)

### Webauthn API

Searching through google this API quickly came up. It uses the same credentials management API I mentioned in the section above to create and get credentials of the user which are authenticated by an authenticator (which will mostly be the device that is used). This basically means that if your phone has the capabilities of fingerprint/face-scanning, through the Webauthn API you can use it in your web application.

Setting up your app to use the Webauthn API requires quite a bit of setup and coding, and since this project is done for testing purposes, I will be using a library which simplifies the integration.

If you want a more deep look into the integration, you can look into this sources:

-   [Google's build your first WebAuthn App](https://developers.google.com/codelabs/webauthn-reauth#03)

-   [MDN'S WebAuthentication docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)

-   [W3's WebAuthentication docs](https://www.w3.org/TR/webauthn-2/)

-   [Webauthn.guide](https://webauthn.guide/)

### SimpleWebAuthn

SimpleWebAuthn is a library for simple Webauthn integration. This library was incredibly useful for this project as it minimized the amount of work required to implement the API while still showcasing the steps that are being taken to achieve the functionality.

This library essentially consists of 6 different functions (4 server functions, 2 client functions) that each represents a step in the authentication process:

-   `GenerateRegistrationOptions()` : The first step is for the server to generate and provide options for the credential creation, those contain information about the user that is being registered and the website itself.

-   `StartRegistration()` : The second step is for the client to receive the credential creation options and send them to the authenticator to create the credential.

-   `VerifyRegistration()` : The third step is for the server to verify the credential validity. If it is valid, it is responsible for storing the credential for future authentication.

After registering, we can go through a similar process, but now instead of creating a new credential we instead get one from the authenticator.

-   `GenerateAuthenticationOptions()` : The fourth step is for the server to generate options for the type of credential we want and which credential to allow.

-   `startAuthentication()` : The fifth step is for the authenticator to give us the credential that we asked for.

-   `verifyAuthentication()` : The sixth and final step is for the server to receive the credential and try to match it with one of the existing credentials that are stored in the db.

[SimpleWebAuthn Docs](https://simplewebauthn.dev/docs/), [SimpleWebSAuth Github](https://github.com/MasterKale/SimpleWebAuthn) for sources.

## Usage

After pulling the repo:

```
npm install
```

setup environment variables by creating a .env file:

```
├─ otp-react
│ ├── src
│ │ ├── client
│ │ ├── server
| .env <-----
```

setup the following variables:

```
TWILIO_ACCOUNT_SID='<Your Twilio account SID>'
TWILIO_AUTH_TOKEN='<Your Twilio AuthToken>'
TWILIO_SERVICE_SID='<Your Twilio service SID>'
RP_ID='<Your domain, for example: otp-react.com>'
PORT='<Desired Port here>' (optional)
```

scripts:
```
npm run dev
npm run build
```