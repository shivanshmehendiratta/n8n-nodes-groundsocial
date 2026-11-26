import {
	NodeApiError,
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type IHttpRequestMethods,
	type IHttpRequestOptions,
	type INode,
	type ILoadOptionsFunctions,
	type INodeExecutionData,
	type INodeListSearchResult,
	type INodeType,
	type INodeTypeDescription,
	type JsonObject,
} from 'n8n-workflow';

import { endpointFields, endpointOperations } from './descriptions/EndpointDescription';
import { redditFields, redditOperations } from './descriptions/RedditDescription';
import { webFields, webOperations } from './descriptions/WebDescription';
import { xFields, xOperations } from './descriptions/XDescription';
import { youtubeFields, youtubeOperations } from './descriptions/YoutubeDescription';

const BASE_URL = 'https://api.groundsocial.dev';

interface EndpointSummary {
	id: string;
	tool: string;
	platform: string;
	method: string;
	path: string;
	title: string;
	summary: string;
	credits: number | null;
}

interface PreparedRequest {
	method: IHttpRequestMethods;
	path: string;
	qs: IDataObject;
	body?: IDataObject;
}

async function listEndpoints(
	ctx: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<EndpointSummary[]> {
	const response = (await ctx.helpers.httpRequest({
		method: 'GET',
		url: `${BASE_URL}/v1/utility/endpoints`,
		json: true,
	})) as { endpoints: EndpointSummary[] };
	return response.endpoints;
}

function prepare(node: INode, endpoint: EndpointSummary, input: IDataObject): PreparedRequest {
	const params: IDataObject = { ...input };
	let path = endpoint.path;
	for (const match of endpoint.path.matchAll(/\{([^}]+)\}/g)) {
		const name = match[1];
		const value = params[name];
		if (value === undefined || value === null || value === '') {
			throw new NodeOperationError(
				node,
				`The endpoint ${endpoint.id} needs the "${name}" parameter`,
			);
		}
		path = path.replace(match[0], encodeURIComponent(String(value)));
		delete params[name];
	}
	for (const key of Object.keys(params)) {
		if (params[key] === undefined || params[key] === null || params[key] === '') delete params[key];
	}
	if (endpoint.method.toUpperCase() === 'GET') {
		for (const key of Object.keys(params)) {
			const value = params[key];
			if (Array.isArray(value)) params[key] = value.join(',');
			else if (typeof value === 'object') params[key] = JSON.stringify(value);
		}
		return { method: 'GET', path, qs: params };
	}
	return {
		method: endpoint.method.toUpperCase() as IHttpRequestMethods,
		path,
		qs: {},
		body: params,
	};
}

function toItems(data: unknown, itemIndex: number): INodeExecutionData[] {
	if (Array.isArray(data)) {
		return data.map((entry) => ({
			json: (typeof entry === 'object' && entry !== null ? entry : { value: entry }) as IDataObject,
			pairedItem: { item: itemIndex },
		}));
	}
	return [{ json: (data ?? {}) as IDataObject, pairedItem: { item: itemIndex } }];
}

export class Groundsocial implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Groundsocial',
		name: 'groundsocial',
		icon: {
			light: 'file:../../icons/groundsocial.svg',
			dark: 'file:../../icons/groundsocial.dark.svg',
		},
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Read public posts, comments, profiles, transcripts and search results from 80+ platforms',
		defaults: {
			name: 'Groundsocial',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'groundsocialApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Any Endpoint', value: 'endpoint' },
					{ name: 'Reddit', value: 'reddit' },
					{ name: 'Web', value: 'web' },
					{ name: 'X', value: 'x' },
					{ name: 'YouTube', value: 'youtube' },
				],
				default: 'endpoint',
			},
			...endpointOperations,
			...endpointFields,
			...redditOperations,
			...redditFields,
			...webOperations,
			...webFields,
			...xOperations,
			...xFields,
			...youtubeOperations,
			...youtubeFields,
		],
	};

	methods = {
		listSearch: {
			async searchEndpoints(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const endpoints = await listEndpoints(this);
				const words = (filter ?? '').toLowerCase().split(/\s+/).filter(Boolean);
				const results = endpoints
					.filter((endpoint) => {
						const haystack =
							`${endpoint.id} ${endpoint.platform} ${endpoint.title} ${endpoint.summary}`.toLowerCase();
						return words.every((word) => haystack.includes(word));
					})
					.map((endpoint) => ({
						name: `${endpoint.id}: ${endpoint.title}${
							endpoint.credits !== null && endpoint.credits !== undefined
								? ` (${endpoint.credits} cr)`
								: ''
						}`,
						value: endpoint.id,
						url: `https://groundsocial.dev/docs/api/${endpoint.id.replace(/[._]/g, "-")}`,
					}));
				return { results };
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Programmatic style: "Any Endpoint" resolves the endpoint's method and path at run time
		// (path inputs filled in, GET inputs as query, POST inputs as body), which declarative
		// routing can't express for ~590 endpoints.
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		let catalog: Map<string, EndpointSummary> | undefined;

		const getEndpoint = async (id: string): Promise<EndpointSummary> => {
			if (!catalog) {
				catalog = new Map();
				for (const endpoint of await listEndpoints(this)) {
					catalog.set(endpoint.id, endpoint);
					catalog.set(endpoint.tool, endpoint);
				}
			}
			const endpoint = catalog.get(id) ?? catalog.get(id.replace(/\./g, '_'));
			if (!endpoint) {
				throw new NodeOperationError(
					this.getNode(),
					`Unknown endpoint "${id}". Use the Find Endpoints operation.`,
				);
			}
			return endpoint;
		};

		const callEndpoint = async (id: string, input: IDataObject): Promise<unknown> => {
			const request = prepare(this.getNode(), await getEndpoint(id), input);
			const options: IHttpRequestOptions = {
				method: request.method,
				url: `${BASE_URL}${request.path}`,
				qs: request.qs,
				json: true,
			};
			if (request.body) options.body = request.body;
			return await this.helpers.httpRequestWithAuthentication.call(
				this,
				'groundsocialApi',
				options,
			);
		};

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;
			try {
				let data: unknown;

				if (resource === 'endpoint' && operation === 'call') {
					const endpointId = this.getNodeParameter('endpoint', i, '', {
						extractValue: true,
					}) as string;
					const raw = this.getNodeParameter('parameters', i, {}) as string | IDataObject;
					let input: IDataObject;
					try {
						input = (typeof raw === 'string' ? JSON.parse(raw || '{}') : raw) as IDataObject;
					} catch {
						throw new NodeOperationError(this.getNode(), 'Parameters must be valid JSON', {
							itemIndex: i,
						});
					}
					data = await callEndpoint(endpointId, input);
				} else if (resource === 'endpoint' && operation === 'find') {
					const task = this.getNodeParameter('task', i) as string;
					const platform = this.getNodeParameter('platform', i, '') as string;
					const response = (await this.helpers.httpRequest({
						method: 'GET',
						url: `${BASE_URL}/v1/utility/find`,
						qs: platform ? { task, platform } : { task },
						json: true,
					})) as { results: IDataObject[] };
					data = response.results;
				} else if (resource === 'reddit' && operation === 'searchPosts') {
					const options = this.getNodeParameter('options', i, {}) as IDataObject;
					const response = (await callEndpoint('reddit.search.posts', {
						q: this.getNodeParameter('query', i) as string,
						limit: this.getNodeParameter('limit', i, 50) as number,
						...options,
					})) as { data?: { children?: Array<{ data: IDataObject }> } };
					data = this.getNodeParameter('simplify', i, true)
						? (response.data?.children ?? []).map((child) => child.data)
						: response;
				} else if (resource === 'reddit' && operation === 'getSubredditPosts') {
					const response = (await callEndpoint('reddit.subreddit.posts', {
						name: this.getNodeParameter('subreddit', i) as string,
						sort: this.getNodeParameter('sort', i, 'hot') as string,
						limit: this.getNodeParameter('limit', i, 50) as number,
					})) as { data?: { children?: Array<{ data: IDataObject }> } };
					data = this.getNodeParameter('simplify', i, true)
						? (response.data?.children ?? []).map((child) => child.data)
						: response;
				} else if (resource === 'youtube' && operation === 'getTranscript') {
					const language = this.getNodeParameter('language', i, '') as string;
					data = await callEndpoint('youtube.video.transcript', {
						id: this.getNodeParameter('videoId', i) as string,
						...(language ? { language } : {}),
					});
				} else if (resource === 'x' && operation === 'getUser') {
					data = await callEndpoint('x.user.get', {
						username: (this.getNodeParameter('username', i) as string).replace(/^@/, ''),
					});
				} else if (resource === 'web' && operation === 'scrape') {
					data = await callEndpoint('web.scrape.get', {
						url: this.getNodeParameter('url', i) as string,
					});
				} else if (resource === 'web' && operation === 'googleSearch') {
					const country = this.getNodeParameter('country', i, '') as string;
					data = await callEndpoint('google.search.web', {
						q: this.getNodeParameter('query', i) as string,
						...(country ? { gl: country } : {}),
					});
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`The operation "${operation}" is not supported for "${resource}"`,
						{ itemIndex: i },
					);
				}

				returnData.push(...toItems(data, i));
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				if (error instanceof NodeOperationError) {
					throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
