import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['x'] };

export const xOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Get User',
				value: 'getUser',
				description: 'Get a public X profile',
				action: 'Get a user',
			},
		],
		default: 'getUser',
	},
];

export const xFields: INodeProperties[] = [
	{
		displayName: 'Username',
		name: 'username',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. n8n_io',
		displayOptions: { show },
	},
];
