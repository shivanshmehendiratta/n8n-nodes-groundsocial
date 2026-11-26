import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['web'] };

export const webOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Google Search',
				value: 'googleSearch',
				description: 'Get Google web search results',
				action: 'Search google',
			},
			{
				name: 'Scrape Page',
				value: 'scrape',
				description: 'Fetch a web page as clean Markdown',
				action: 'Scrape a page',
			},
		],
		default: 'scrape',
	},
];

export const webFields: INodeProperties[] = [
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://example.com',
		displayOptions: { show: { ...show, operation: ['scrape'] } },
	},
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { ...show, operation: ['googleSearch'] } },
	},
	{
		displayName: 'Country',
		name: 'country',
		type: 'string',
		default: '',
		placeholder: 'e.g. us',
		displayOptions: { show: { ...show, operation: ['googleSearch'] } },
		description: 'Two-letter country code',
	},
];
