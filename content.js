(() => {
  'use strict';

  const DEFAULTS = { enabled: true, translationColor: '#bf94ff' };
  const LINE_SELECTOR = [
    '[data-a-target="chat-line-message-body"]',
    '.seventv-chat-message-body',
    '.video-chat__message'
  ].join(',');
  const TEXT_SELECTOR = [
    '[data-a-target="chat-message-text"]',
    '.text-fragment',
    '.text-token'
  ].join(',');

  const processed = new WeakSet();
  const cache = new Map();
  const queue = [];
  let active = 0;
  let settings = { ...DEFAULTS };

  function cleanText(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.!?;:])/g, '$1')
      .trim();
  }

  function extractText(line) {
    const nodes = [...line.querySelectorAll(TEXT_SELECTOR)].filter(node => {
      const parent = node.parentElement?.closest(TEXT_SELECTOR);
      return !parent || !line.contains(parent);
    });
    if (nodes.length) return cleanText(nodes.map(node => node.textContent).join(' '));

    const clone = line.cloneNode(true);
    clone.querySelectorAll('.tt-edge-translation,button,img,svg').forEach(node => node.remove());
    return cleanText(clone.textContent);
  }

  function appendTranslation(line, result) {
    if (!result?.translation || line.querySelector('.tt-edge-translation')) return;
    const element = document.createElement('span');
    element.className = 'tt-edge-translation';
    element.style.setProperty('--tt-edge-color', settings.translationColor);
    element.textContent = `（${result.translation}）`;
    element.title = result.detectedLanguage
      ? `Google 翻译 · 检测语言：${result.detectedLanguage}`
      : 'Google 翻译';
    line.appendChild(element);
  }

  async function translate(line, text) {
    if (cache.has(text)) {
      appendTranslation(line, cache.get(text));
      return;
    }
    const result = await chrome.runtime.sendMessage({ type: 'translate', text });
    if (!result?.ok || result.skipped || !result.translation) {
      if (result?.error) console.warn('[TwitchTranslate]', result.error);
      return;
    }
    cache.set(text, result);
    if (cache.size > 500) cache.delete(cache.keys().next().value);
    appendTranslation(line, result);
  }

  function pumpQueue() {
    while (active < 2 && queue.length) {
      const task = queue.shift();
      active += 1;
      translate(task.line, task.text)
        .catch(error => console.warn('[TwitchTranslate]', error))
        .finally(() => {
          active -= 1;
          setTimeout(pumpQueue, 120);
        });
    }
  }

  function processLine(line) {
    if (!settings.enabled || processed.has(line)) return;
    const text = extractText(line);
    if (text.length < 4) return;
    processed.add(line);
    queue.push({ line, text });
    pumpQueue();
  }

  function scan(root) {
    if (!(root instanceof Element)) return;
    if (root.matches(LINE_SELECTOR)) processLine(root);
    root.querySelectorAll(LINE_SELECTOR).forEach(processLine);
  }

  async function initialize() {
    settings = await chrome.storage.local.get(DEFAULTS);
    document.querySelectorAll(LINE_SELECTOR).forEach(processLine);

    new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) scan(node);
      }
    }).observe(document.documentElement, { childList: true, subtree: true });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      for (const [key, change] of Object.entries(changes)) {
        settings[key] = change.newValue;
      }
      if (changes.enabled?.newValue) {
        document.querySelectorAll(LINE_SELECTOR).forEach(processLine);
      }
    });
  }

  initialize().catch(error => console.error('[TwitchTranslate] 初始化失败', error));
})();
