/* 檢查網站版本；不清除 Cookie，也不在挑戰進行中重新載入。 */
(() => {
  'use strict';
  const meta = document.querySelector('meta[name="site-version"]');
  const current = meta?.content;
  if (!current || !/^https?:$/.test(location.protocol)) return;
  const root = new URL('./', document.currentScript.src);
  let pendingVersion = null;
  let checking = false;
  let attempted = false;
  window.SiteVersion = {
    url(path) {
      const url = new URL(path, document.baseURI);
      if (url.origin === root.origin && url.pathname.startsWith(root.pathname)) url.searchParams.set('v', current);
      return url.href;
    }
  };
  function refreshWhenReady() {
    if (!pendingVersion || attempted || document.hidden) return;
    const landing = document.getElementById('landing');
    if (landing && landing.hidden) return;
    if (Array.from(document.querySelectorAll('video')).some(video => !video.paused && !video.ended)) return;
    const key = `earth-guardians:refresh:${location.pathname}`;
    try {
      // 部署尚未同步到 CDN 時，每個分頁對同一版本只嘗試一次。
      if (sessionStorage.getItem(key) === pendingVersion) return;
      sessionStorage.setItem(key, pendingVersion);
    } catch (_) {
      if (new URL(location.href).searchParams.get('v') === pendingVersion) return;
    }
    attempted = true;
    const next = new URL(location.href);
    next.searchParams.set('v', pendingVersion);
    next.searchParams.set('_refresh', String(Date.now()));
    location.replace(next.href);
  }
  async function checkVersion() {
    if (checking || attempted || document.hidden) return;
    checking = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const manifest = new URL('site-version.json', root);
      manifest.searchParams.set('_check', String(Date.now()));
      const response = await fetch(manifest, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) return;
      const data = await response.json();
      if (typeof data.version !== 'string' || !/^[a-f0-9]{16}$/.test(data.version)) return;
      if (data.version !== current) pendingVersion = data.version;
      else pendingVersion = null;
      refreshWhenReady();
    } catch (_) {
      // 離線、網路不穩或版本檔尚未部署時，保持現有頁面可使用。
    } finally {
      clearTimeout(timeout);
      checking = false;
    }
  }
  function start() {
    checkVersion();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) checkVersion(); });
    setInterval(() => { refreshWhenReady(); checkVersion(); }, 60000);
    const landing = document.getElementById('landing');
    if (landing) new MutationObserver(refreshWhenReady).observe(landing, { attributes: true, attributeFilter: ['hidden'] });
    document.querySelectorAll('video').forEach(video => video.addEventListener('ended', refreshWhenReady));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
