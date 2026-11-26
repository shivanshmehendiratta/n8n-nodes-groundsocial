# n8n-nodes-groundsocial

An [n8n](https://n8n.io) community node for [Groundsocial](https://groundsocial.dev). It reads public posts,
comments, profiles, transcripts and search results from 80+ platforms (Reddit, X, TikTok, Instagram, YouTube,
LinkedIn, Hacker News, GitHub, Google, Amazon and more) and returns each platform's own JSON.

The node can also be used as a tool by n8n's AI Agent node.

[Installation](#installation) · [Operations](#operations) · [Credentials](#credentials) · [Usage](#usage) ·
[Resources](#resources)

## Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) and
install `n8n-nodes-groundsocial`.

## Operations

| Resource | Operation | Credits |
|---|---|---|
| Any Endpoint | **Call**: pick any of the ~590 endpoints from a searchable list (or type its id) and pass its parameters as JSON | per endpoint |
| Any Endpoint | **Find Endpoints**: describe a task in plain words, get the matching endpoints and their inputs | free |
| Reddit | Search Posts, Get Subreddit Posts (one item per post, or the raw Listing) | 2 / 1 |
| YouTube | Get Transcript | 2 |
| X | Get User | 1 |
| Web | Scrape Page (clean Markdown), Google Search | 1 |

Call works for every platform. Path inputs are filled in for you, other inputs go in the query string for GET
endpoints and in the JSON body for POST endpoints. Each endpoint's inputs are listed at
`https://groundsocial.dev/docs/api/<endpoint-id>`, for example
[reddit-search-posts](https://groundsocial.dev/docs/api/reddit-search-posts).

## Credentials

1. Sign up at [groundsocial.dev](https://groundsocial.dev/app/sign-in?new=1). New accounts get 100 free credits,
   no card.
2. Create an API key in the dashboard. It starts with `gs_live_`.
3. In n8n, create a **Groundsocial API** credential and paste the key. The credential test reads one Hacker News
   story (1 credit).

## Usage

- **Brand monitoring:** Schedule Trigger → Groundsocial (Reddit, Search Posts, sorted by new) → filter → Slack.
- **Video notes:** Webhook with a YouTube link → Groundsocial (YouTube, Get Transcript) → an LLM node → Notion.
- **Agent tool:** add Groundsocial as a tool on the AI Agent node and use **Any Endpoint → Call** with
  `{{ $fromAI('parameters') }}` so the agent picks what to read.

Failed calls are refunded. Errors carry the API's message and hint; turn on "Continue On Fail" to get them as items.

## Compatibility

Built with `@n8n/node-cli` 0.58 (n8n nodes API version 1). No runtime dependencies, as n8n requires for verified nodes.

## Resources

- [Groundsocial docs](https://groundsocial.dev/docs)
- [Endpoint reference](https://groundsocial.dev/docs/api)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## License

MIT
