import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['youtube'] };

export const youtubeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Get Transcript',
				value: 'getTranscript',
				description: 'Get the transcript of a video',
				action: 'Get a video transcript',
			},
		],
		default: 'getTranscript',
	},
];

export const youtubeFields: INodeProperties[] = [
	{
		displayName: 'Video ID or URL',
		name: 'videoId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. dQw4w9WgXcQ',
		displayOptions: { show },
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		default: '',
		placeholder: 'e.g. en',
		displayOptions: { show },
		description: 'Language code. Leave empty for the original language.',
	},
];
