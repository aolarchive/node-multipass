module.exports = {
	
	'App': {
		id: 'App',
		description: 'An application object containing auth details to the API for a particular app',
		required: ['_id', 'appId', 'secret', 'userId', 'hosts'],
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
	}
	
};
