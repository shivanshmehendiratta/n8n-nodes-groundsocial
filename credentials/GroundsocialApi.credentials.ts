import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class GroundsocialApi implements ICredentialType {
	name = 'groundsocialApi';

	displayName = 'Groundsocial API';

	icon: Icon = {
		light: 'file:../icons/groundsocial.svg',
		dark: 'file:../icons/groundsocial.dark.svg',
	};

	documentationUrl = 'https://groundsocial.dev/docs/authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Your Groundsocial API key (starts with gs_live_). Create one at https://groundsocial.dev/app.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// Reads one Hacker News story (1 credit) to check the key.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.groundsocial.dev',
			url: '/v1/hackernews/stories',
			qs: { limit: 1 },
			method: 'GET',
		},
	};
}
