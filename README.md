node-multipass
==============

Multiauth identity server using Node.js and MongoDB.

## Overview
node-multipass is a RESTful web service that authenticates users with various accounts (Facebook, Twitter, Aol, etc), and associates the credentials obtained within a session with one user account.
The REST API provides access to the credentials, and ability to delete existing profiles and users.

This app requires Node.js and MongoDB. It uses `node-passport` to handle authentication, and `mongoose` for database access.

### Setup
* Install Node.js
* Install MongoDB
* Install project node dependencies - in project folder type `npm install`, and npm will pull down all required node modules
* Run MongoDB - type `mongod`
* Run app - type `node app`

### Configuration
Most configuration takes place in the `conf/` folder. There are separate config files for different server enviroments (`dev.js`, `prod.js`, etc.), that are chosen based on the `NODE_ENV` environment variable, all managed by the special `conf/config.js` file. The default environment is "development".

### Auth Providers
The included set of auth providers are:
* Facebook
* Twitter
* AOL
* LinkedIn
* Google
* Windows Live

To setup a new auth provider, add it under the 'providers' object in the config file, with appropriate auth ids and secret info. 
```javascript
providers: {
  facebook: {
    appId: "123-456-789",
    appSecret: "abcd-efgh-ijkl-mnop-qrst-uvwx-yz"
  }
}
```
The app automatically configures itself for a particular provider based on what you add in the config file. Then using the provider name you used in the providers object, like `'facebook'`, it then tries to load a corresponding provider strategy module with the same name from the `auth/providers/` folder, such as `facebook.js`. You can also add additional auth strategies by including them or writing your own. Each one just needs its own unique provider name.

## REST API
<table>
  <tr>
    <th>Method</th>
    <th>Path</th>
    <th>Parameters</th>
    <th>Response</th>
    <th>Auth Req.</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>GET</td>
    <td>/api/auth/:provider</td>
    <td>[r] - optional redirect URL</td>
    <td></td>
    <td>N</td>
    <td>Authentication path for each provider. Available values for :provider can be retreived via /auth/providers.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/api/auth/providers</td>
    <td>N/A</td>
    <td></td>
    <td>N</td>
    <td>Returns a list of all available auth providers and their login URLs.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/api/logout</td>
    <td>N/A</td>
    <td></td>
    <td>N</td>
    <td>Logout of the current session.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/api/user</td>
    <td>N/A</td>
    <td></td>
    <td>Y</td>
    <td>Returns complete user object for the currently-authenticated user.</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>/api/user</td>
    <td>N/A</td>
    <td></td>
    <td>Y</td>
    <td>Deletes the entire user object for the currently-authenticated user.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/api/user/:userId</td>
    <td>N/A</td>
    <td></td>
    <td>Y</td>
    <td>Returns complete user object for the given userId.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/api/user/:provider/:providerId</td>
    <td>N/A</td>
    <td></td>
    <td>Y</td>
    <td>Returns a particular auth profile for the currently-authenticated user, based the given 'provider' and 'providerId' values.
    <br>For example, `/user/twitter/987654321`</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>/api/user/:provider/:providerId</td>
    <td>N/A</td>
    <td></td>
    <td>Y</td>
    <td>Deletes a particular auth profile for the currently-authenticated user, based the given 'provider' and 'providerId' values.</td>
  </tr>
</table>

### Method Override
The API allows method override with POST, so for instance to perform a DELETE, you can perform a POST and include `_method="delete"` in the post body.

### JSONP
JSONP support is enabled for all API methods, using the `callback` query param. Ex: `/api/user?callback=foo`

### Success Response
To check of the response was successful, first a successful HTTP status code will be returned, such as 200 or 201.

And the response body will indicate a status of "Ok":
```Javascript
{
  data: { ... },
  status: "Ok"
}
```

### Error Response
When an error has occurred, the appropriate error HTTP status code will be returned, such as 400, 401, 404, or 500.

Also the response body will indicate a status of "Error", and include a status text and status code:
```Javascript
{
  data: null,
  status: "Error",
  statusText: "Invalid request",
  statusCode: 1
}
```

## Credits
* [Jeremy Jannotta](https://github.com/jeremyjannotta)
* [Stash server](https://github.com/aol/Stash) - Much of the multiauth code is copied/derived from the AOL Stash project, so many thanks goes to them for the inspiration and examples for this project.

## License
Copyright (c) 2012 AOL, Inc.
All rights reserved.
https://github.com/aol/node-multipass/blob/master/LICENSE-BSD