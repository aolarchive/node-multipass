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
* Run app - type `node app`

### Configuration
Most configuration takes place in the `conf/` folder. There are separate config files for different server enviroments (`dev.js`, `prod.js`, etc.), that are chosen based on the `NODE_ENV` environment variable, all managed by the special `conf/config.js` file. The default environment is "development".

To setup a new auth provider, add it under the 'providers' object, with appropriate auth ids and secret info. 
```javascript
providers: {
  facebook: {
    appId: "123-456-789",
    appSecret: "abcd-efgh-ijkl-mnop-qrst-uvwx-yz"
  }
}
```
The app automatically configures itself for a particular provider based on what you add in the config file. It then tries to load a corresponding provider strategy module from the `auth/providers/` folder. You can also add additional auth strategies by including them or writing your own. Each one just needs its own unique provider name.

## REST API
The API allows method override, so for instance to perform a DELETE, you can use a POST and include `_method="delete"` in the post body.

<table>
  <tr>
    <th>Method</th>
    <th>Path</th>
    <th>Parameters</th>
    <th>Response</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>GET</td>
    <td>/auth/:provider</td>
    <td>N/A</td>
    <td></td>
    <td>Authentication path for each provider. Available values for :provider can be retreived via /auth/providers.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/auth/providers</td>
    <td>N/A</td>
    <td></td>
    <td>Returns a list of all available auth providers and their login URLs.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/logout</td>
    <td>N/A</td>
    <td></td>
    <td>Logout of the current session.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/user</td>
    <td>N/A</td>
    <td></td>
    <td>Returns complete user object for the currently-authenticated user.</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>/user</td>
    <td>N/A</td>
    <td></td>
    <td>Deletes the entire user object for the currently-authenticated user.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/user/:provider/:providerId</td>
    <td>N/A</td>
    <td></td>
    <td>Returns a particular auth profile for the currently-authenticated user, based the given 'provider' and 'providerId' values.
    <br>For example, `/user/twitter/987654321`</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>/user/:provider/:providerId</td>
    <td>N/A</td>
    <td></td>
    <td>Deletes a particular auth profile for the currently-authenticated user, based the given 'provider' and 'providerId' values.</td>
  </tr>
</table>

## License
Copyright (c) 2012 AOL, Inc.
All rights reserved.
https://github.com/aol/node-multipass/blob/master/LICENSE-BSD