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
Most configuration takes place in the `conf/config.js` file. 

To setup a new auth provider, add it under the 'providers' object, with appropriate auth ids and secret info. 
```javascript
providers: {
  facebook: {
    appId: "123-456-789",
    appSecret: "abcd-efgh-ijkl-mnop-qrst-uvwx-yz"
  }
}
```
The app automatically configures itself for a particular provider based on what you add in the config file. It then tries to laod a corresponding provider strategy module from the `auth/providers/` folder. You can also add additional auth strategies by including them or writing your own. Each one just needs its own unique provider name.

## REST API

## License
Copyright (c) 2012 AOL, Inc.
All rights reserved.
https://github.com/aol/node-multipass/blob/master/LICENSE-BSD