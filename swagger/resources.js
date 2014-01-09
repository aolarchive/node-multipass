var config = require('../conf/config'),
	providers = [];


// Get list of available provider names
if (config && config.providers) {
	providers = Object.keys(config.providers);
}

module.exports = {
	
	getUser: {
		spec: {
			description: 'Operations for user objects',
			path: '/api/user',
			method: 'GET',
			summary: 'Get a user',
			notes: 'Returns the user object from context, and all its profiles',
			type: 'User',
			nickname: 'getUser',
			produces: ['application/json'],
			parameters: [],
			responseMessages: [
				{
					code: 200,
					message: 'Ok',
					responseModel: 'User'
				},
				{
					code: 401,
					message: 'Unauthorized'
				},
				{
					code: 404,
					message: 'The user cannot be found',
					responseModel: 'User'
				}
			]
		},
		action: function (req, res, next) {
			next();
		}
	},
	
	deleteUser: {
		spec: {
			path: '/api/user',
			method: 'DELETE',
			summary: 'Delete a user',
			notes: 'Deletes the user object from context, and all its profiles',
			type: 'User',
			nickname: 'deleteUser',
			produces: ['application/json'],
			parameters: [],
			responseMessages: [
				{
					code: 200,
					message: 'The user was deleted',
					responseModel: 'User'
				},
				{
					code: 401,
					message: 'Unauthorized'
				},
				{
					code: 404,
					message: 'The user cannot be found',
					responseModel: 'User'
				}
			]
		},
		action: function (req, res, next) {
			next();
		}
	},
	
	getUsers: {
		spec: {
			path: '/api/users',
			method: 'GET',
			summary: 'Get list of users',
			notes: 'Get all users and their profiles, that match the list of userIds in the context. Specify userIds to query as a comma-delimited list in the X-Multipass-User header.<br><br>By default returns a list of separate User objects. Specify the aggregate=true query param to return a single merged User object.',
			type: 'User',
			nickname: 'getUsers',
			produces: ['application/json'],
			parameters: [
				{
					paramType: 'query',
					name: 'aggregate',
					description: 'Whether to combine the profiles into one list',
					dataType: 'boolean',
					required: false
					//'enum': ['true', 'false']
				}
			],
			responseMessages: []
		},
		action: function (req, res, next) {
			next();
		}
	},
	
	getUserProfile: {
		spec: {
			description: 'Operations for user profiles',
			path: '/api/user/{provider}/{providerId}',
			method: 'GET',
			summary: 'Get a user profile',
			notes: 'Returns the user profile object for a particular provider and providerId',
			type: 'UserProfile',
			nickname: 'getUserProfile',
			produces: ['application/json'],
			parameters: [
				{
					paramType: 'path',
					name: 'providerId',
					description: 'The providerId for the provider type',
					dataType: 'string',
					required: 'true'
				},
				{
					paramType: 'path',
					name: 'provider',
					description: 'The provider name',
					dataType: 'string',
					required: 'true',
					enum: providers
				}
			],
			responseMessages: []
		},
		action: function (req, res, next) {
			next();
		}
	},

	deleteUserProfile: {
		spec: {
			path: '/api/user/{provider}/{providerId}',
			method: 'DELETE',
			summary: 'Delete a user profile',
			notes: 'Deletes the user profile object for a particular provider and providerId',
			type: 'UserProfile',
			nickname: 'deleteUserProfile',
			produces: ['application/json'],
			parameters: [
				{
					paramType: 'path',
					name: 'providerId',
					description: 'The providerId for the provider type',
					dataType: 'string',
					required: 'true'
				},
				{
					paramType: 'path',
					name: 'provider',
					description: 'The provider name',
					dataType: 'string',
					required: 'true',
					enum: providers
				}
			],
			responseMessages: []
		},
		action: function (req, res, next) {
			next();
		}
	},
	
	getProviders: {
		spec: {
			path: '/api/auth/providers',
			method: 'GET',
			summary: 'Get list of auth providers',
			notes: 'Get list of all available auth providers, including their loginUrl',
			type: 'AuthProvider',
			nickname: 'getProviders',
			produces: ['application/json'],
			parameters: [],
			responseMessages: []
		},
		action: function (req, res, next) {
			next();
		}
	},
	
	authProvider: {
		spec: {
			path: '/api/auth/{provider}',
			method: 'GET',
			summary: 'Authenticate a provider',
			notes: 'Launch the auth flow for a provider to associate it with the current User',
			type: '',
			nickname: 'authProvider',
			produces: ['text/html'],
			parameters: [
				{
					paramType: 'path',
					name: 'provider',
					description: 'The provider name',
					dataType: 'string',
					required: true,
					enum: providers
				},
				{
					paramType: 'query',
					name: 'r',
					description: 'The redirect URL, i.e. the destination after the account has been associated',
					dataType: 'string'
				},
				{
					paramType: 'query',
					name: 'scope',
					description: 'The OAuth scope to pass through',
					dataType: 'string'
				},
				{
					paramType: 'query',
					name: 'state',
					description: 'The OAuth state to pass through',
					dataType: 'string'
				},
				{
					paramType: 'query',
					name: 'force_login',
					description: 'Whether to force the user to re-authenticate',
					dataType: 'boolean',
					required: false
				}
			],
			responseMessages: []
		},
		action: function (req, res, next) {
			next();
		}
	},
	
	authProviderCallback: {
		spec: {
			path: '/api/auth/{provider}/callback',
			method: 'GET',
			summary: 'Authentication callback',
			notes: 'The route that is automatically called after an auth flow has succeeded - never need to call this manually',
			type: '',
			nickname: 'authProviderCallback',
			produces: ['application/json'],
			parameters: [
				{
					paramType: 'path',
					name: 'provider',
					description: 'The provider name',
					dataType: 'string',
					required: true,
					enum: providers
				}
			],
			responseMessages: []
		},
		action: function (req, res, next) {
			next();
		}
	}
	
};