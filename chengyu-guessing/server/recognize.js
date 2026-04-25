import { AI_CONFIG, getAiEndpoint, getModelsEndpoint } from './ai-config.js';

const SLOT_COUNT = 4;
let resolvedModelCache = null;

const SYSTEM_PROMPT = `
你是一个成语猜谜截图识别器。请从图片中提取对筛选四字成语有用的条件，只输出 JSON，不要输出 Markdown。

游戏规则按常见猜词反馈理解：
- 绿色/青绿色整格表示该位置汉字正确，写入 fixedChars。
- 灰色整格汉字表示该汉字不在答案中，写入 globalExcludeChars。
- 黄色/橙色汉字表示该汉字在答案中但不在当前位置，写入 globalChars，并在对应位置写入 excludeChars。
- 拼音字母、声母、韵母或声调若显示为绿色/黄色/橙色，表示它在答案中有用；若它出现在错误位置，则写入对应位置的 excludeParts 或 excludeTones，同时也写入 globalParts。
- 已经由 fixedChars 确定的位置，不需要再给该位置填声调、声韵或排除条件。

返回格式必须完全符合：
{
  "globalChars": [],
  "globalParts": [],
  "globalExcludeChars": [],
  "fixedChars": ["", "", "", ""],
  "tones": ["", "", "", ""],
  "positionParts": [[], [], [], []],
  "excludeTones": ["", "", "", ""],
  "excludeParts": [[], [], [], []],
  "excludeChars": ["", "", "", ""],
  "notes": ""
}

不要使用代码块包裹 JSON。不要输出解释文字。不要输出额外字段。
`.trim();

function extractJson(text) {
  const content = String(text || '').trim();
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : content;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('接口没有返回可解析的 JSON');
  }

  return JSON.parse(candidate.slice(start, end + 1));
}

function extractResponseText(payload) {
  return payload?.choices?.[0]?.message?.content || payload?.output_text || '';
}

function extractStreamText(rawText) {
  let content = '';

  rawText.split(/\r?\n/).forEach((line) => {
    if (!line.startsWith('data:')) {
      return;
    }

    const data = line.slice(5).trim();
    if (!data || data === '[DONE]') {
      return;
    }

    try {
      const chunk = JSON.parse(data);
      content += chunk.choices?.[0]?.delta?.content || '';
    } catch (error) {
      console.warn('[openai] skip invalid stream chunk', data.slice(0, 160));
    }
  });

  return content;
}

async function readCompletionContent(response) {
  const rawText = await response.text();

  if (rawText.trimStart().startsWith('data:')) {
    return {
      content: extractStreamText(rawText),
      rawText,
    };
  }

  const payload = JSON.parse(rawText);
  return {
    content: extractResponseText(payload),
    rawText,
  };
}

async function resolveCherryStudioModel() {
  if (AI_CONFIG.model.includes(':')) {
    return AI_CONFIG.model;
  }

  if (resolvedModelCache) {
    return resolvedModelCache;
  }

  const response = await fetch(getModelsEndpoint(), {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${AI_CONFIG.secretKey}`,
    },
  });

  if (!response.ok) {
    console.warn(`[openai] failed to resolve Cherry Studio model, use configured model directly: HTTP ${response.status}`);
    return AI_CONFIG.model;
  }

  const payload = await response.json();
  const model = payload?.data?.find((item) => item.id === AI_CONFIG.model || item.name === AI_CONFIG.model || item.provider_model_id === AI_CONFIG.model);

  resolvedModelCache = model?.id || AI_CONFIG.model;
  if (resolvedModelCache !== AI_CONFIG.model) {
    console.log(`[openai] resolved Cherry Studio model ${AI_CONFIG.model} -> ${resolvedModelCache}`);
  }

  return resolvedModelCache;
}

function maskSecret(secret) {
  const value = String(secret || '');
  if (value.length <= 8) {
    return value ? '***' : '';
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function getDataUrlInfo(imageDataUrl) {
  const value = String(imageDataUrl || '');
  const match = value.match(/^data:(image\/[a-z0-9.+-]+);base64,(.*)$/i);
  const base64 = match?.[2] || '';

  return {
    mimeType: match?.[1] || 'unknown',
    dataUrlLength: value.length,
    approxBytes: Math.floor((base64.length * 3) / 4),
  };
}

function summarizeRequest(requestBody, imageDataUrl) {
  const imageInfo = getDataUrlInfo(imageDataUrl);
  return {
    endpoint: getAiEndpoint(),
    model: requestBody.model,
    auth: maskSecret(AI_CONFIG.secretKey),
    stream: requestBody.stream,
    maxTokens: requestBody.max_tokens,
    image: imageInfo,
    messages: requestBody.messages.map((message) => ({
      role: message.role,
      content: Array.isArray(message.content)
        ? message.content.map((item) => ({
            type: item.type,
            textLength: item.text?.length,
            imageDetail: item.image_url?.detail,
            imageUrl: item.image_url ? `[${imageInfo.mimeType}, ${imageInfo.approxBytes} bytes]` : undefined,
          }))
        : `[text, ${String(message.content || '').length} chars]`,
    })),
  };
}

function buildRecognitionRequest(imageDataUrl, model) {
  return {
    model,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: '识别这张成语猜谜截图，返回可直接回填筛选表单的 JSON。必须只返回 JSON 字符串。',
          },
          {
            type: 'image_url',
            image_url: {
              url: imageDataUrl,
              detail: 'high',
            },
          },
        ],
      },
    ],
    temperature: 0,
    max_tokens: 1200,
    stream: true,
  };
}

export async function recognizeImageFilters(imageDataUrl) {
  if (!/^data:image\/[a-z0-9.+-]+;base64,/i.test(String(imageDataUrl || ''))) {
    const error = new Error('请上传 base64 data URL 格式的图片');
    error.statusCode = 400;
    throw error;
  }

  const model = await resolveCherryStudioModel();
  const requestBody = buildRecognitionRequest(imageDataUrl, model);
  const startedAt = Date.now();

  console.log('[openai] request stack');
  console.trace('[openai] call trace');
  console.dir(summarizeRequest(requestBody, imageDataUrl), { depth: null });

  let response;
  try {
    response = await fetch(getAiEndpoint(), {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${AI_CONFIG.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  } catch (error) {
    console.error('[openai] fetch failed');
    console.error(error.stack || error);
    throw error;
  }

  console.log(`[openai] response ${response.status} ${response.statusText} in ${Date.now() - startedAt}ms`);

  if (!response.ok) {
    const detail = await response.text();
    console.error('[openai] error response body');
    console.error(detail);
    const error = new Error(`识别接口请求失败：HTTP ${response.status} ${detail.slice(0, 240)}`);
    error.statusCode = response.status;
    console.error(error.stack);
    throw error;
  }

  const { content, rawText } = await readCompletionContent(response);
  console.log(`[openai] response text length ${content.length}`);

  try {
    return extractJson(content);
  } catch (error) {
    console.error('[openai] parse failed');
    console.error(error.stack || error);
    console.error(content || rawText);
    throw error;
  }
}
