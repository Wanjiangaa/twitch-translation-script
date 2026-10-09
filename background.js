const DEFAULTS = { enabled: true, targetLanguage: 'zh-cn' };

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await chrome.storage.local.get(DEFAULTS);
  await chrome.storage.local.set(settings);
});

function normalizeLanguage(code) {
  return String(code || '').toLowerCase().replace('_', '-');
}

async function translateWithGoogle(text, targetLanguage) {
  const params = new URLSearchParams({
    client: 'gtx',
    sl: 'auto',
    tl: targetLanguage,
    dt: 't',
    q: text
  });
  const response = await fetch(
    `https://translate.googleapis.com/translate_a/single?${params}`,
    { credentials: 'omit', cache: 'no-store' }
  );
  if (!response.ok) throw new Error(`Google Translate HTTP ${response.status}`);

  const data = await response.json();
  return {
    translation: Array.isArray(data?.[0])
      ? data[0].map(part => part?.[0] || '').join('').trim()
      : '',
    detectedLanguage: normalizeLanguage(data?.[2])
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id || message?.type !== 'translate') return;

  (async () => {
    const text = String(message.text || '').trim().slice(0, 1000);
    if (!text) return { ok: false, error: '消息为空' };

    const settings = await chrome.storage.local.get(DEFAULTS);
    if (!settings.enabled) return { ok: true, skipped: true };

    const result = await translateWithGoogle(text, settings.targetLanguage);
    const target = normalizeLanguage(settings.targetLanguage);
    const detected = normalizeLanguage(result.detectedLanguage);
    if (detected === target || (target === 'zh-cn' && detected === 'zh')) {
      return { ok: true, skipped: true, detectedLanguage: detected };
    }
    if (!result.translation) throw new Error('Google 没有返回译文');

    return { ok: true, ...result };
  })()
    .then(sendResponse)
    .catch(error => sendResponse({ ok: false, error: error.message || String(error) }));

  return true;
});
