node-multipass
==============

Multiple identity management server using Node.js and MongoDB.

## What Is It?
Multipass is a RESTful web service that authenticates users with various accounts (Facebook, Twitter, Aol, etc), and associates the credentials obtained with one user account.
The REST API provides access to the credentials, and ability to delete existing profiles and users.

This app requires Node.js and MongoDB. It uses `node-passport` to handle authentication, and `mongoose` for database access.

### What Isn't It?
* It is not a multi-auth identity system for maintaining login sessions for users. 
* It is not a magical portal into a parallel universe.

### Why Would I Use It?
Multipass has a fairly narrow focus, it simply provides a simple, flexible, programmtic way of obtaining and storing auth credentials, and accessing them, for use by other apps to do interesting things. 

Examples of what you could do, building on top of Multipass:
* Create an app for scheduling Tweets on behalf of users
* Create an app for collecting social stats for users by pulling lists of friends, tweets, likes, etc.

### How The Auth Flow Works
Multipass authenticates users by exposing a pair of API routes to the client:
<pre>
/api/auth/:provider
/api/auth/:provider/callback
</pre>

It starts by initiating the login route in the client (`/api/auth/:provider`), which simply redirects to a third-party auth page. This route can be called any way you'd like -- in the browser's tab, or pop-up window -- depending on the desired experience.

Once the third-party auth flow has succeeded, it will automatically redirect back to the Multipass callback route (`/api/auth/:provider/callback`), also exposed to the client, which is when it receives and stores the auth credentials.

Upon the successful callback, Multipass then redirects back to an auth-receiver file (`auth.html`), if provided with the initial login request. This file handles finalization tasks, like closing the pop-up window, and executing a JS function in the parent/opener window.

<table>
<tr><td>1) Site</td>			<td>foo.com</td></tr>
<tr><td>2) Multipass-login</td>		<td>foo.com/api/auth/twitter?r=foo.com/auth.html</td></tr>
<tr><td>3) Third-party-login-flow</td>	<td>api.twitter.com/...</td></tr>
<tr><td>4) Multipass-callback</td>	<td>foo.com/api/auth/twitter/callback?code={CODE}</td></tr>
<tr><td>5) Auth-receiver</td>		<td>foo.com/auth.html</td></tr>
</table>

#### A Note About Proxies
It should be noted that for the above auth flow to work, the Multipass API client-side auth routes should ideally be exposed through a proxy within the host site domain.

Advantages:
* Solve cross-domain restrictions, so the routes can be called from the client-side code within the host domain.
* The server-side proxy can inject the appId, appSecret, and userId, without revealing this sensitive data with the request.

Other options:
* Use an IFRAME in the Multipass API domain, to host Javscript that launches the Multipass login route


## REST API
<table>
  <tr>
    <th>Method</th>
    <th>Path</th>
    <th>Parameters</th>
    <th>UserId Req.</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>GET</td>
    <td>/api/auth/:provider</td>
    <td width="150">
		[r] - redirect URL<br>
		[scope] - oauth scope<br>
		[state] - oauth state<br>
		[force_login=true] - force user to re-auth service
		</td>
    <td>Y</td>
    <td>Authentication path for each provider. Available values for :provider can be retreived via /auth/providers.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/api/auth/:provider/callback</td>
    <td>N/A</td>
    <td>Y</td>
    <td>Authentication callback path for each provider. This is the endpoint automatically passed to auth strategies as the redirect URL, and processes the result of the auth call. Used internally, do not use this path directly.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/api/auth/providers</td>
    <td>N/A</td>
    <td>N</td>
    <td>Returns a list of all available auth providers and their login URLs.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/api/user</td>
    <td>N/A</td>
    <td>Y</td>
    <td>Returns complete user object for the currently-authenticated user.</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>/api/user</td>
    <td>N/A</td>
    <td>Y</td>
    <td>Deletes the entire user object for the currently-authenticated user.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/api/user/:provider/:providerId</td>
    <td>N/A</td>
    <td>Y</td>
    <td>Returns a particular auth profile for the currently-authenticated user, based the given 'provider' and 'providerId' values.
    <br>For example, `/user/twitter/987654321`</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>/api/user/:provider/:providerId</td>
    <td>N/A</td>
    <td>Y</td>
    <td>Deletes a particular auth profile for the currently-authenticated user, based the given 'provider' and 'providerId' values.</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/api/users</td>
    <td>
    [aggregate=true] - combine all user profiles into one list, versus list of complete separate user objects (default)<br>
    </td>
    <td>Y</td>
    <td>Returns an array of all user objects, for the userIds provided with the request as comma-delimted list in the header.<br>
    Example: X-Multipass-User: user1,user2</td>
  </tr>
  <tr>
    <td>*</td>
    <td>/api[/:projection]/user*</td>
    <td>inherited</td>
    <td>Y</td>
    <td>Execute /user* routes within a given projection, which determine what fields are returned in the response. Possible values for projection:
    <ul>
    <li>private: show all fields, including sensitive data</li>
    <li>(empty): default, show only basic fields, no sensitive data</li>
    </ul></td>
  </tr>
</table>

### Authentication
#### API Authentication
All requests to the API require authentication via an appId and appSecret. These are included in the request with a standard HTTP basic Authorization header. 
The appId and appSecret are managed by a separate app included with Multipass.

Ex: `Authorization: basic {base64(appId:appSecret)}`

The appId defines the scope of the data available from the API, usually associated with a certain application, and no request can access data outside their appId.

#### UserId
Most requests also require a userId (unless noted otherwise) which can be any string provided by the end user. It is included in the request with a custom header, `X-Multipass-User`.

Ex: `X-Multipass-User: KorbenDallas`

The userId defines a container of user data, and must be unique within a given appId.

#### User Context
The user context is simply the combination of an appId and userId, i.e. `{ appId:'', userId:'' }`, and used to identify a single unique user object.

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

## Setup
* Install Node.js
* Install MongoDB
* Install project node dependencies - in project folder type `npm install`, and npm will pull down all required node modules
* Run MongoDB - type `mongod`
* Run app - type `node app`

### Configuration
Most configuration takes place in the `conf/` folder, managed by the special `conf/config.js` file. 

#### Environment ####
The server environment is determined by the `NODE_ENV` environment variable, one of ('development', 'stage', 'production'), and defaults to 'development'.
```
NODE_ENV=stage
```

#### Custom Config File ####
By default, the system looks under `conf/` for the config file, with a name corresponding to the server environment (`dev.js`, `stage.js`, `prod.js`). 

To get started on the config file, look at `conf/conf.sample.js`, which has a basic skeleton in place.

If you don't want to place the config files under `conf/`, you may specify a path to your own file by setting its filepath to the `MULTIPASS_CONF` environment variable.
```
MULTIPASS_CONF=/etc/multipass/config.js
```

### Auth Providers
The included set of auth providers are:
* Facebook
* Twitter
* AOL
* LinkedIn
* Google
* Windows Live
* DropBox
* GitHub
* Tumblr
* Yahoo

To setup a new auth provider, add it under the 'providers' object in the config file, with appropriate auth ids and secret info. 
```javascript
providers: {
  facebook: {
    appId: "123-456-789",
    appSecret: "abcd-efgh-ijkl-mnop-qrst-uvwx-yz"
  }
}
```
NOTE: The provider config properties are unique to the corresponding auth strategy ('appId' vs. 'consumerKey', etc.), so you must use those properties to set up providers. See https://github.com/jaredhanson/passport#strategies-1 for documentation on available strategies.

The app automatically configures itself for a particular provider based on what you add in the config file. Then using the provider name you used in the providers object, like `'facebook'`, it then tries to load a corresponding provider strategy module with the same name from the `auth/providers/` folder, such as `facebook.js`. You can also add additional auth strategies by including them or writing your own. Each one just needs its own unique provider name.


## Plugins
Multipass has a plugin system for extending it's functionality, and providing additional behavior. For a peek at what plugins are already available, check out the `plugins/` folder.

Included plugins:
* Demo (`plugins/demo/`) - provides a simple interface for trying out user auth flows, and viewing the data
* Application management (`plugins/app/`) - app for managing the appIds for this service

## Examples

* Launch client-side auth flow to login into Twitter
<pre>
GET /api/auth/twitter?r=auth.html&force_login=true
Authorization: Basic {BASE64-HASH}
X-Multipass-User: demo_user
</pre>
<pre>
Redirects to the Twitter client login screen, and once complete, redirects back to auth.html.
</pre>

* Get collection of all private auth data for a user
<pre>
GET /api/private/user
Authorization: Basic {BASE64-HASH}
X-Multipass-User: demo_user
</pre>
<pre>
Returns JSON with complete user object, including sensitive fields.
{
  "data": {
    "userId": "demo_user",
    "profiles": [
      {
        "provider": "twitter",
        "providerId": 123456789,
        "username": "TwitterUser",
        "authToken": "{TOKEN}"
      }
    ]
  },
  "status": "Ok"
}
</pre>


## Credits
* [Jeremy Jannotta](https://github.com/jeremyjannotta)
* [Stash server](https://github.com/aol/Stash) - Much of the multiauth code is copied/derived from the AOL Stash project, so many thanks goes to them for the inspiration and examples for this project.
* [Jeff Rodenburg](https://github.com/jrodenburg) - Borrowed his work on Stash Server and am using his passport-aol-oauth module.

## License
Copyright (c) 2013 AOL, Inc.
All rights reserved.
https://github.com/aol/node-multipass/blob/master/LICENSE-BSD
