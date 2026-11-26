import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['reddit'] };

export const redditOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Get Subreddit Posts',
				value: 'getSubredditPosts',
				description: 'Get posts in a subreddit by hot, new, top or rising',
				action: 'Get subreddit posts',
			},
			{
				name: 'Search Posts',
				value: 'searchPosts',
				description: 'Search posts across Reddit or in one subreddit',
				action: 'Search posts',
			},
		],
		default: 'searchPosts',
	},
];

export const redditFields: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { ...show, operation: ['searchPosts'] } },
		description: 'Search words',
	},
	{
		displayName: 'Subreddit',
		name: 'subreddit',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. n8n',
		displayOptions: { show: { ...show, operation: ['getSubredditPosts'] } },
		description: 'Subreddit name without r/',
	},
	{
		displayName: 'Sort',
		name: 'sort',
		type: 'options',
		options: [
			{ name: 'Controversial', value: 'controversial' },
			{ name: 'Hot', value: 'hot' },
			{ name: 'New', value: 'new' },
			{ name: 'Rising', value: 'rising' },
			{ name: 'Top', value: 'top' },
		],
		default: 'hot',
		displayOptions: { show: { ...show, operation: ['getSubredditPosts'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 50,
		displayOptions: { show },
		description: 'Max number of results to return',
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: true,
		displayOptions: { show },
		description: 'Whether to return one item per post instead of the raw Reddit Listing',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: { show: { ...show, operation: ['searchPosts'] } },
		options: [
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'options',
				options: [
					{ name: 'Comments', value: 'comments' },
					{ name: 'Hot', value: 'hot' },
					{ name: 'New', value: 'new' },
					{ name: 'Relevance', value: 'relevance' },
					{ name: 'Top', value: 'top' },
				],
				default: 'relevance',
			},
			{
				displayName: 'Subreddit',
				name: 'subreddit',
				type: 'string',
				default: '',
				description: 'Search only this subreddit',
			},
			{
				displayName: 'Time',
				name: 't',
				type: 'options',
				options: [
					{ name: 'All Time', value: 'all' },
					{ name: 'Past Day', value: 'day' },
					{ name: 'Past Hour', value: 'hour' },
					{ name: 'Past Month', value: 'month' },
					{ name: 'Past Week', value: 'week' },
					{ name: 'Past Year', value: 'year' },
				],
				default: 'week',
			},
		],
	},
];
