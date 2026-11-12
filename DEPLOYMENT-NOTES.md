# HUMANITY ONE deployment notes

The AI chat API reads provider configuration from these Vercel environment variables:

- `AI_API_KEY` — provider API key (secret; never store it in this repository)
- `AI_BASE_URL` — OpenAI-compatible API base URL
- `AI_MODEL` — model identifier

For Gemini OpenAI-compatible API, configure the values in Vercel Production environment variables. A new deployment is required after changing environment variables.
