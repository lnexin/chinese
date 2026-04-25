export const AI_CONFIG = {
  host: process.env.OPENAI_API_HOST || 'http://127.0.0.1:23333',
  path: process.env.OPENAI_API_PATH || '/v1/chat/completions',
  secretKey: process.env.OPENAI_API_KEY || 'cs-sk-86050fdd-ced6-470c-9cd5-aa1b9a65165c',
  model: process.env.OPENAI_MODEL || 'gpt-5.4',
};

export const getAiEndpoint = () => `${AI_CONFIG.host.replace(/\/$/, '')}${AI_CONFIG.path}`;
export const getModelsEndpoint = () => `${AI_CONFIG.host.replace(/\/$/, '')}/v1/models`;
