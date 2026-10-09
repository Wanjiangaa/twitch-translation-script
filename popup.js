const DEFAULTS = {
  enabled: true,
  targetLanguage: 'zh-cn',
  translationColor: '#bf94ff'
};

const enabled = document.querySelector('#enabled');
const targetLanguage = document.querySelector('#targetLanguage');
const translationColor = document.querySelector('#translationColor');
const status = document.querySelector('#status');
let saveTimer;

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    await chrome.storage.local.set({
      enabled: enabled.checked,
      targetLanguage: targetLanguage.value,
      translationColor: translationColor.value
    });
    status.textContent = '设置已保存';
    setTimeout(() => { status.textContent = ''; }, 1500);
  }, 150);
}

async function initialize() {
  const settings = await chrome.storage.local.get(DEFAULTS);
  enabled.checked = settings.enabled;
  targetLanguage.value = settings.targetLanguage;
  translationColor.value = settings.translationColor;
  enabled.addEventListener('input', scheduleSave);
  targetLanguage.addEventListener('input', scheduleSave);
  translationColor.addEventListener('input', scheduleSave);
}

initialize().catch(error => {
  status.textContent = `设置加载失败：${error.message}`;
});
