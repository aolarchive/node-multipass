module.exports = {
	
	getApps: {
		spec: {
			description: 'Operations for application objects',
			path: '/api/app',
			method: 'GET',
			summary: 'Get apps for a user',
			notes: 'Returns a list of all application object associated with a userId. Requires ELS auth session for userId.',
			type: 'array[App]',
			nickname: 'getAppsByUserId',
			produces: ['application/json'],
			parameters: [],
			responseMessages: []
		},
		action: function (req, res, next) {
			next();
		}
	},
	
	addApp: {
		spec: {
			path: '/api/app',
			method: 'POST',
			summary: 'Add an app',
			notes: 'Adds a new app with given data',
			type: 'App',
			nickname: 'addApp',
			produces: ['application/json'],
			parameters: [
				{
					paramType: 'body',
					name: 'app',
					description: 'The application object',
					dataType: 'App',
					required: true,
					allowMultiple: false
				}
			],
			responseMessages: []
		},
		action: function (req, res, next) {
			next();
		}
	},
	
	updateApp: {
		spec: {
			path: '/api/app',
			method: 'PUT',
			summary: 'Update an app',
			notes: 'Updates a new app with given data',
			type: 'App',
			nickname: 'updateApp',
			produces: ['application/json'],
			parameters: [
				{
					paramType: 'body',
					name: 'app',
					description: 'The application object',
					dataType: 'App',
					required: true,
					allowMultiple: false
				}
			],
			responseMessages: []
		},
		action: function (req, res, next) {
			next();
		}
	},
	
	deleteApp: {
		spec: {
			path: '/api/app',
			method: 'DELETE',
			summary: 'Delete an app',
			notes: 'Deletes an app by appId',
			type: 'App',
			nickname: 'deleteApp',
			produces: ['application/json'],
			parameters: [
				{
					paramType: 'body',
					name: 'appId',
					description: 'The application appId',
					dataType: 'string',
					required: true
				}
			],
			responseMessages: []
		},
		action: function (req, res, next) {
			next();
		}
	},
	
	refreshSecret: {
		spec: {
			path: '/api/app/secret',
			method: 'POST',
			summary: 'Refresh secret',
			notes: 'Generates a new secret for the App object',
			type: 'App',
			nickname: 'refreshSecret',
			produces: ['application/json'],
			parameters: [
				{
					paramType: 'body',
					name: 'appId',
					description: 'The application appId',
					dataType: 'string',
					required: true
				}
			],
			responseMessages: []
		},
		action: function (req, res, next) {
			next();
		}
	}
	
};