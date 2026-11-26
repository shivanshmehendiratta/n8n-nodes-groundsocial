import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['endpoint'] };

export const endpointOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Call',
				value: 'call',
				description: 'Call any Groundsocial endpoint with its parameters',
				action: 'Call an endpoint',
			},
			{
				name: 'Find Endpoints',
				value: 'find',
				description: 'Find the endpoints that fit a task (free)',
				action: 'Find endpoints for a task',
			},
		],
		default: 'call',
	},
];

export const endpointFields: INodeProperties[] = [
	{
		displayName: 'Endpoint',
		name: 'endpoint',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		displayOptions: { show: { ...show, operation: ['call'] } },
		description: 'The endpoint to call, for example reddit.search.posts',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: { searchListMethod: 'searchEndpoints', searchable: true },
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'e.g. reddit.search.posts',
			},
		],
	},
	{
		displayName: 'Parameters',
		name: 'parameters',
		type: 'json',
		default: '{}',
		displayOptions: { show: { ...show, operation: ['call'] } },
		description:
			'The endpoint\'s inputs as JSON, for example {"q": "n8n", "sort": "top"}. See each endpoint\'s inputs with Find Endpoints or at https://groundsocial.dev/docs.',
	},
	{
		displayName: 'Task',
		name: 'task',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. comments on a TikTok video',
		displayOptions: { show: { ...show, operation: ['find'] } },
		description: 'What you want to do, in plain words',
	},
	{
		displayName: 'Platform',
		name: 'platform',
		type: 'string',
		default: '',
		placeholder: 'e.g. reddit',
		displayOptions: { show: { ...show, operation: ['find'] } },
		description: 'Only return endpoints for this platform',
	},
];
