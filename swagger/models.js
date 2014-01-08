module.exports = {
	
	'User': {
		id: 'User',
		description: 'A user object containing all associated profiles',
		required: ['_id', 'profiles'],
		properties: {
			_id: {
				type: 'string'
			},
			appId: {
				type: 'string'
			},
			userId: {
				type: 'string'
			},
			profiles: {
				type: 'array',
				items: {
					'$ref': 'UserProfile'
				}
			},
			creationDate: {
				type: 'dateTime'
			},
			modifiedDate: {
				type: 'dateTime'
			}
		}
	},
	
	'UserProfile': {
		id: 'UserProfile',
		description: 'A social account for the User containing auth details, and some basic normalized profile data',
		required: ['_id', 'provider', 'providerId'],
		properties: {
			_id: {
				type: 'string'
			},
			provider: {
				type: 'string'
			},
			providerId: {
				type: 'string'
			},
			username: {
				type: 'string'
			},
			displayName: {
				type: 'string'
			},
			familyName: {
				type: 'string'
			},
			givenName: {
				type: 'string'
			},
			gender: {
				type: 'string'
			},
			profileUrl: {
				type: 'string'
			},
			authToken: {
				type: 'string'
			},
			authTokenSecret: {
				type: 'string'
			},
			emails: {
				type: 'array',
				items: {
					'type': 'string'
				}
			},
			metaData: {
				type: 'object'
			},
			creationDate: {
				type: 'dateTime'
			},
			modifiedDate: {
				type: 'dateTime'
			}
		}
	},
	
	'App': {
		id: 'App',
		description: 'API auth permissions for an application',
		required: ['_id', 'appId', 'userId', 'secret'],
		properties: {
			_id: {
				type: 'string'
			},
			appId: {
				type: 'string'
			},
			secret: {
				type: 'string'
			},
			hosts: {
				type: 'array',
				items: {
					'type': 'string'
				}
			},
			userId: {
				type: 'string'
			},
			name: {
				type: 'string'
			}, 
			description: {
				type: 'string'
			},
			creationDate: {
				type: 'dateTime'
			},
			modifiedDate: {
				type: 'dateTime'
			}
		}
	},
	
	'AuthProvider': {
		id: 'AuthProvider',
		description: 'Details for adding an auth provider',
		required: ['provider', 'loginUrl'],
		properties: {
			provider: {
				type: 'string'
			},
			loginUrl: {
				type: 'string'
			}
		}
	}
	
};
