'use strict';
// Elm's HTTP requests use XHR. Capture record versions and freeze them while a
// modal is open so a background refresh cannot authorize a stale form save.
(function () {
  const revisions = new Map(); let frozen = null;
  function observe(value) {
    if (!value || typeof value !== 'object') return;
    if (value.id && value._revision) revisions.set(value.id, value._revision);
    for (const child of Object.values(value)) observe(child);
  }
  const originalOpen = XMLHttpRequest.prototype.open, originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this.crmMethod = method; this.crmURL = new URL(url, location.href);
    return originalOpen.call(this, method, url, ...args);
  };
  XMLHttpRequest.prototype.send = function(body) {
    if (this.crmURL?.origin === location.origin && this.crmURL.pathname.startsWith('/api/')) {
      const match = this.crmURL.pathname.match(/^\/api\/(contacts|deals|tasks|schools|students|agents|leads|cases|documents|invoices|payments|partners|activities)\/([^/]+)(?:\/|$)/);
      if (match && ['PUT','PATCH','DELETE'].includes(this.crmMethod)) {
        const revision = (frozen || revisions).get(decodeURIComponent(match[2]));
        if (revision) this.setRequestHeader('If-Match', revision);
      }
      this.addEventListener('load', () => { if (this.status >= 200 && this.status < 300) { try { observe(JSON.parse(this.responseText)); } catch {} } });
    }
    return originalSend.call(this, body);
  };
  const refresh = () => {
    const modal = document.querySelector('[role=dialog], .modal, .ecc-modal, .modal-panel');
    if (modal && !frozen) frozen = new Map(revisions);
    if (!modal) frozen = null;
  };
  new MutationObserver(refresh).observe(document.body, {childList:true, subtree:true});
})();
