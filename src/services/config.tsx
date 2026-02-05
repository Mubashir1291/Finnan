import { store } from '../redux/store';
import { setIsLogin } from '../redux/Reducers/userReducer';
import { endPoints } from './endPoints';

// const BASE_URL = 'http://192.168.18.228:8081'; // change if needed
// const BASE_URL = 'https://unvaleted-postnephritic-lucien.ngrok-free.dev'; // change if needed
// const BASE_URL = 'https://api.interaia.com'; // change if needed
const BASE_URL = 'https://sse-feedalabs.webevis.com';

function getAuthToken() {
  const state = store.getState();
  // console.log(state?.user?.accessToken, 'this is my token');
  return state?.user?.accessToken || null;
}

async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text(); // for plain text responses
  }

  if (response.status === 401) {
    store.dispatch(setIsLogin(false));
    throw new Error(
      typeof data === 'string' ? data : data?.message || 'Unauthorized',
    );
  }

  if (!response.ok) {
    throw new Error(
      typeof data === 'string' ? data : data?.message || 'Something went wrong',
    );
  }

  return data;
}

function buildHeaders(isMultipart = false) {
  const headers: any = {};

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/* =======================
   BASIC HTTP METHODS
======================= */

async function get(url: string) {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  return handleResponse(response);
}

async function post(url: string, body: any, isMultipart = false) {
  const fullUrl = `${BASE_URL}${url}`;
  const headers = buildHeaders(isMultipart);

  console.log('📤 API REQUEST');
  console.log('➡️ URL:', fullUrl);
  console.log('➡️ METHOD: POST');
  console.log('➡️ HEADERS:', headers);
  console.log('➡️ BODY:', isMultipart ? body : JSON.stringify(body));

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: headers,
    body: isMultipart ? body : JSON.stringify(body),
  });

  console.log('⬅️ STATUS:', response.status);

  return handleResponse(response);
}

async function put(url: string, body: any, isMultipart = false) {
  const fullUrl = `${BASE_URL}${url}`;
  const headers = buildHeaders(isMultipart);

  console.log('📤 API REQUEST');
  console.log('➡️ URL:', fullUrl);

  console.log('➡️ HEADERS:', headers);
  console.log('➡️ BODY:', isMultipart ? body : JSON.stringify(body));
  const response = await fetch(`${BASE_URL}${url}`, {
    method: 'PUT',
    headers: headers,
    body: isMultipart ? body : JSON.stringify(body),
  });

  return handleResponse(response);
}

async function patch(url: string, body: any) {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: 'PATCH',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });

  return handleResponse(response);
}

async function _delete(url: string) {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });

  return handleResponse(response);
}
async function upload(url: string, formData: FormData) {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: formData,
  });

  return handleResponse(response);
}

export const Fetch = {
  get,
  post,
  put,
  patch,
  delete: _delete,
  upload,
};

const BASE_AI_URL = 'https://sse-feedalabs.webevis.com';
 
function getAiToken() {
  const state = store.getState();
  return state?.user?.accessToken || null;
}
export const AI_CHATTING = async (payload: any) => {
  const aiToken = getAiToken();
  const headers: any = {
    'Content-Type': 'application/json',
  };
  if (aiToken) headers.Authorization = `Bearer ${aiToken}`;
  if (aiToken) headers.AI_SESSION = aiToken;
  const bodyStr =
    typeof payload === 'string' ? payload : JSON.stringify(payload);
  console.log('AI chatting request body:', bodyStr);
 
  const response = await fetch(`${BASE_AI_URL}${endPoints.CHAT}`, {
    method: 'POST',
    headers: { ...headers, Accept: 'application/json' },
    body: bodyStr,
  });
 
  // Read raw text first and try to parse as JSON. Many AI endpoints stream
  // incremental JSON objects (concatenated JSON chunks or SSE). Try several
  // strategies to assemble a useful value for the caller:
  // 1) parse as a single JSON object
  // 2) if response contains multiple JSON objects concatenated (}{), convert
  //    into an array and parse
  // 3) if SSE-style `data: {...}` lines are present, extract and parse them
  // 4) fallback to raw text
  const text = await response.text();
  let data: any = null;
 
  const tryParse = (str: string) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  };
 
  // 1) try single JSON
  data = tryParse(text);
 
  // 2) try concatenated JSON objects -> convert `}{` to `},{` and wrap in []
  if (data === null && text && /}\s*{/.test(text)) {
    const normalized = text.replace(/}\s*{/g, '},{');
    const maybeArray = `[${normalized}]`;
    data = tryParse(maybeArray);
    if (Array.isArray(data)) {
      // Log first few items to debug streaming structure
      console.log('=== STREAMING DEBUG ===');
      console.log('Total chunks:', data.length);
      if (data.length > 0) {
        console.log('First chunk sample:', JSON.stringify(data[0], null, 2));
        if (data.length > 1) {
          console.log('Second chunk sample:', JSON.stringify(data[1], null, 2));
        }
      }
      console.log('=== END STREAMING DEBUG ===');
 
      // Helper to safely convert a value to string
      const stringify = (val: any): string => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'object') {
          // Check if it's a URL object and convert appropriately
          // Look for common URL patterns
          const urlKeys = ['image', 'img', 'src', 'url', 'image_url', 'imageUrl', 'thumbnail', 'photo', 'link', 'href'];
          for (const key of urlKeys) {
            if (val[key] && typeof val[key] === 'string') {
              const urlValue = val[key];
              // Make sure it's a valid full URL
              if (urlValue.startsWith('http://') || urlValue.startsWith('https://')) {
                // Check if it's an actual image URL (by extension or known image hosts)
                const isImageUrl = (url: string): boolean => {
                  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
                  const lowerUrl = url.toLowerCase();
                  // Check file extensions
                  if (imageExtensions.some(ext => lowerUrl.includes(ext))) return true;
                  // Check known image hosting patterns
                  if (lowerUrl.includes('/images/') || lowerUrl.includes('/img/')) return true;
                  if (lowerUrl.includes('ytimg.com') || lowerUrl.includes('espncdn.com')) return true;
                  return false;
                };
 
                if (isImageUrl(urlValue)) {
                  // It's an image - render as img tag with class for horizontal layout
                  console.log('Rendering as image:', urlValue.substring(0, 80));
                  return `<img src="${urlValue}" alt="${val.alt || val.title || 'Image'}" class="chat-image" />`;
                } else {
                  // It's a web page link - render as clickable link
                  const title = val.title || val.name || val.alt || urlValue.split('/').pop() || 'Link';
                  console.log('Rendering as link:', urlValue.substring(0, 80));
                  return `<a href="${urlValue}" style="color: #4da6ff; text-decoration: underline;">${title}</a>`;
                }
              }
            }
          }
          // If it has text/content fields, extract those
          if (val.text) return stringify(val.text);
          if (val.content) return stringify(val.content);
          if (val.html) return stringify(val.html);
          if (val.message) return stringify(val.message);
          // For arrays, join the stringified elements
          if (Array.isArray(val)) {
            return val.map(v => stringify(v)).join('');
          }
          // Skip empty objects
          if (Object.keys(val).length === 0) return '';
          // Try to extract useful content from object - but skip known non-text fields
          const skipKeys = ['type', 'role', 'id', 'timestamp', 'created_at', 'updated_at'];
          let result = '';
          for (const key of Object.keys(val)) {
            if (skipKeys.includes(key)) continue;
            const extracted = stringify(val[key]);
            if (extracted) result += extracted;
          }
          return result;
        }
        return String(val);
      };
 
      // if items contain `data` fields, join them into a single string
      const allHaveData = data.every(
        (it: any) => it && (it.data !== undefined || it.output !== undefined),
      );
      if (allHaveData) {
        data = data.map((it: any) => stringify(it.data ?? it.output ?? '')).join('');
      }
    }
  }
 
  // 3) SSE-style lines: look for `data: { ... }` occurrences
  if (data === null && text && /data:\s*\{/.test(text)) {
    const matches = [
      ...text.matchAll(/data:\s*(\{[\s\S]*?\})(?:\r?\n\r?\n|\r?\n|$)/g),
    ];
    if (matches.length) {
      const objs: any[] = [];
      for (const m of matches) {
        const parsed = tryParse(m[1]);
        if (parsed) objs.push(parsed);
      }
      if (objs.length) {
        // Reuse the stringify helper for proper object handling
        const stringify = (val: any): string => {
          if (val === null || val === undefined) return '';
          if (typeof val === 'string') return val;
          if (typeof val === 'object') {
            // Check if it's an image object and convert to img tag
            if (val.image || val.img || val.src || val.url) {
              const imgSrc = val.image || val.img || val.src || val.url;
              if (typeof imgSrc === 'string' && (imgSrc.startsWith('http') || imgSrc.startsWith('data:'))) {
                return `<img src="${imgSrc}" alt="${val.alt || 'Image'}" style="max-width: 100%; border-radius: 8px; margin: 8px 0;" />`;
              }
            }
            if (val.text) return stringify(val.text);
            if (val.content) return stringify(val.content);
            if (val.html) return stringify(val.html);
            if (Array.isArray(val)) {
              return val.map(v => stringify(v)).join('');
            }
            if (Object.keys(val).length === 0) return '';
            let result = '';
            for (const key of Object.keys(val)) {
              const extracted = stringify(val[key]);
              if (extracted) result += extracted;
            }
            return result;
          }
          return String(val);
        };
        data = objs.map(o => stringify(o.data ?? o.output ?? '')).join('');
      }
    }
  }
 
  // 4) fallback to raw text
  if (data === null) {
    console.warn(
      'AI_CHATTING: response is not valid JSON, returning raw text',
      text,
    );
    data = text;
  }
 
  if (!response.ok) {
    throw (
      data || { message: 'AI chat request failed', status: response.status }
    );
  }
 
  // Clean up internal tool names from the response
  if (typeof data === 'string') {
    // Remove perplexity_search and similar tool call patterns
    data = data
      .replace(/perplexity_search[^\s<]*/gi, '')  // Remove perplexity_search followed by any text
      .replace(/\s{2,}/g, ' ')  // Clean up extra spaces
      .trim();
  }
 
  return data;
};
 
