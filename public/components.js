'use strict';
(function () {
  const node = (tag, text, attrs = {}) => {
    const element = document.createElement(tag);
    if (text !== undefined && text !== null) element.textContent = String(text);
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
    return element;
  };
  const style = root => {
    root.append(node('link', null, {rel: 'stylesheet', href: '/public/center.css'}));
    root.append(node('link', null, {rel: 'stylesheet', href: '/public/components.css'}));
    root.append(node('link', null, {rel: 'stylesheet', href: '/public/mobile-tables.css'}));
  };
  async function request(path, options = {}) {
    let response = await fetch(path, {credentials: 'same-origin', ...options});
    if (response.status === 401) {
      const refresh = await fetch('/api/session/refresh', {method: 'POST', credentials: 'same-origin'});
      if (refresh.ok) response = await fetch(path, {credentials: 'same-origin', ...options});
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed. Use Refresh to retry.');
    return result;
  }
  function shell(root) {
    style(root);
    const container = node('section', null, {class: 'tools'});
    // This template is static. Record/provider content is inserted only as text.
    container.innerHTML = '<header><div><h2 id="title">Record tools</h2><p id="subtitle"></p></div><button id="refresh" class="secondary" type="button">Refresh tools</button></header><nav id="tabs" aria-label="Record tools"></nav><div id="notice" role="status" aria-live="polite"></div><main id="content" tabindex="-1"><p>Loading…</p></main>';
    root.append(container);
  }
  class Workspace extends HTMLElement {
    constructor() { super(); this.attachShadow({mode: 'open'}); }
    connectedCallback() {
      shell(this.shadowRoot);
      this.stop = window.mountWorkspaceTools(this.shadowRoot);
    }
    disconnectedCallback() { this.stop?.(); this.shadowRoot.replaceChildren(); }
  }
  class RecordTools extends HTMLElement {
    static get observedAttributes() { return ['entity', 'record-id']; }
    constructor() { super(); this.attachShadow({mode: 'open'}); this.generation = 0; }
    connectedCallback() { this.mount(); }
    attributeChangedCallback() { if (this.isConnected) this.mount(); }
    disconnectedCallback() { this.generation++; this.stop?.(); }
    async mount() {
      const generation = ++this.generation;
      this.stop?.(); this.shadowRoot.replaceChildren(); shell(this.shadowRoot);
      const entity = this.getAttribute('entity'), id = this.getAttribute('record-id');
      const main = this.shadowRoot.querySelector('#content');
      try {
        const detail = await request('/api/records/' + encodeURIComponent(entity) + '/' + encodeURIComponent(id));
        if (!this.isConnected || generation !== this.generation) return;
        const tabs = {contacts: 'email', cases: 'documents', students: 'workflows', deals: 'workflows', leads: 'workflows', schools: 'workflows', agents: 'workflows', partners: 'workflows', invoices: 'workflows'};
        this.stop = window.mountWorkspaceTools(this.shadowRoot, {entity, id, editable: detail.editable, tab: tabs[entity]});
      } catch (error) {
        if (generation === this.generation) main.replaceChildren(node('p', error.message));
      }
    }
  }
  class RecordPhoto extends HTMLElement {
    static get observedAttributes() { return ['entity', 'record-id', 'initials', 'person-name', 'editable']; }
    attributeChangedCallback() {
      if (!this.isConnected || !this.dataset.ready || this.refreshQueued) return;
      this.refreshQueued = true;
      queueMicrotask(() => {
        if (!this.isConnected) return;
        this.refreshQueued = false; this.dataset.ready = ''; this.replaceChildren(); this.connectedCallback();
      });
    }
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = 'true';
      const entity = this.getAttribute('entity'), id = this.getAttribute('record-id');
      this.setAttribute('role', 'img');
      this.setAttribute('aria-label', this.getAttribute('person-name') ? 'Photo of ' + this.getAttribute('person-name') : 'Record photo');
      const fallback = node('span', this.getAttribute('initials') || '?', {class: 'record-photo__fallback', 'aria-hidden': 'true'});
      const image = node('img', null, {class: 'record-photo__image', alt: '', loading: 'lazy'});
      let removeButton = null;
      image.onload = () => { image.hidden = false; fallback.hidden = true; if (removeButton) removeButton.hidden = false; };
      image.onerror = () => { image.hidden = true; fallback.hidden = false; };
      this.append(fallback, image);
      const refresh = () => { image.src = '/api/records/' + encodeURIComponent(entity) + '/' + encodeURIComponent(id) + '/photo?v=' + Date.now(); };
      refresh();
      if (this.getAttribute('editable') !== 'true') return;
      const picker = node('input', null, {type: 'file', accept: 'image/png,image/jpeg', capture: 'environment', class: 'record-photo__input', 'aria-label': 'Choose a record photo'});
      const button = node('button', 'Add photo', {type: 'button', class: 'record-photo__button'});
      const notice = node('span', '', {class: 'record-photo__notice', role: 'status', 'aria-live': 'polite'});
      removeButton = node('button', 'Remove photo', {type: 'button', class: 'record-photo__remove', hidden: ''});
      button.onclick = () => picker.click();
      removeButton.onclick = async () => {
        if (!window.confirm('Remove this profile photo?')) return;
        removeButton.disabled = true;
        try {
          const response = await fetch('/api/records/' + encodeURIComponent(entity) + '/' + encodeURIComponent(id) + '/photo', {method: 'DELETE', credentials: 'same-origin'});
          if (!response.ok) throw new Error('Could not remove photo.');
          notice.textContent = 'Photo removed.'; image.hidden = true; fallback.hidden = false; removeButton.hidden = true;
        } catch (error) { notice.textContent = error.message; }
        finally { removeButton.disabled = false; }
      };
      picker.onchange = async () => {
        const photo = picker.files?.[0]; if (!photo) return;
        if (!['image/png', 'image/jpeg'].includes(photo.type) || photo.size > 5 * 1024 * 1024) { notice.textContent = 'Choose a PNG or JPEG smaller than 5 MB.'; return; }
        const data = new FormData(); data.append('photo', photo, photo.name);
        button.disabled = true; notice.textContent = 'Uploading…';
        try {
          const response = await fetch('/api/records/' + encodeURIComponent(entity) + '/' + encodeURIComponent(id) + '/photo', {method: 'PUT', body: data, credentials: 'same-origin'});
          if (!response.ok) { const result = await response.json().catch(() => ({})); throw new Error(result.message || result.error || 'Could not upload photo.'); }
          notice.textContent = 'Photo saved.'; refresh();
        } catch (error) { notice.textContent = error.message; }
        finally { button.disabled = false; picker.value = ''; }
      };
      this.append(button, removeButton, picker, notice);
    }
  }
  function table(title, rows, columns) {
    const card = node('section', null, {class: 'card'}); card.append(node('h3', title));
    if (!rows.length) { card.append(node('p', 'No matching records.')); return card; }
    const wrap = node('div', null, {class: 'table-wrap'}), table = node('table'), head = node('thead'), tr = node('tr');
    for (const [, label] of columns) tr.append(node('th', label, {scope: 'col'}));
    head.append(tr); table.append(head); const body = node('tbody');
    for (const record of rows) {
      const row = node('tr');
      for (const [key] of columns) {
        const cell = node('td');
        if (key === 'record' && record.url) cell.append(node('a', record[key], {href: record.url}));
        else cell.textContent = String(record[key] ?? '');
        row.append(cell);
      }
      body.append(row);
    }
    table.append(body); wrap.append(table); card.append(wrap); return card;
  }
  class AIProductivity extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); this.generation=0; }
    connectedCallback() { this.render(); }
    disconnectedCallback() { this.generation++; }
    render() {
      this.shadowRoot.replaceChildren(); style(this.shadowRoot);
      const root=node('section',null,{class:'tools'}), card=node('section',null,{class:'card'}), result=node('div',null,{'aria-live':'polite'});
      card.append(node('h3','AI work brief'),node('p','Get a prioritized view of your open tasks, near-term application deadlines, missing required documents, and lead follow-ups. AI receives work-item names, type, priority, deadlines, reasons, and action text from records you can access; names may identify people. Email addresses, phone numbers, and internal record IDs are excluded. AI does not send messages or change records.'),result);
      const button=node('button','Plan my day',{type:'button'});card.append(button);root.append(card);this.shadowRoot.append(root);
      button.onclick=async()=>{
        const generation=++this.generation;button.disabled=true;result.replaceChildren(node('p','Checking your accessible work…'));
        try {
          const queued=await request('/api/assistant/productivity',{method:'POST'});
          if(!this.isConnected||generation!==this.generation)return;
          if(queued.status==='empty'){result.replaceChildren(node('p',queued.message));return;}
          const rows=(queued.items||[]).map(item=>({priority:item.priority,record:item.name,reason:item.reason,action:item.action,deadline:item.deadline,url:item.route}));
          result.replaceChildren(node('p',`Work items selected: ${rows.length}. Review the source records before acting.`),table('Priority worklist',rows,[['priority','Priority'],['record','Record'],['reason','Why now'],['action','Suggested action'],['deadline','Due']]));
          const brief=node('p','Preparing your AI work brief…',{class:'result'});result.prepend(brief);
          let job;
          for(let attempt=0;attempt<40;attempt++){if(!this.isConnected||generation!==this.generation)return;await new Promise(resolve=>setTimeout(resolve,1500));job=await request('/api/assistant/jobs/'+queued.id);if(['completed','failed'].includes(job.status))break;}
          if(job?.status==='failed')throw new Error(job.error||'AI brief could not be generated.');
          if(job?.status!=='completed')throw new Error('The brief is still processing. Try again shortly.');
          if(!this.isConnected||generation!==this.generation)return;
          brief.textContent=job.result;
        } catch(error){if(generation===this.generation)result.replaceChildren(node('p',error.message))}
        finally{if(generation===this.generation)button.disabled=false;}
      };
    }
  }
  class Insights extends HTMLElement {
    constructor() { super(); this.attachShadow({mode: 'open'}); this.generation = 0; }
    connectedCallback() { this.render(); }
    disconnectedCallback() { this.generation++; }
    render() {
      this.shadowRoot.replaceChildren(); style(this.shadowRoot);
      const root = node('section', null, {class: 'tools'}), result = node('div', null, {'aria-live': 'polite'});
      root.append(node('h2', this.getAttribute('mode') === 'dashboard' ? 'Action queue · all accessible records' : 'Performance reports'));
      this.shadowRoot.append(root);
      const form = node('form', null, {class: 'toolbar'});
      if (this.getAttribute('mode') !== 'dashboard') {
        for (const [key, label] of [['from', 'Created from'], ['to', 'Created through']]) {
          const field = node('label', label), input = node('input', null, {type: 'date', name: key}); field.append(input); form.append(field);
        }
      }
      const submit = node('button', 'Refresh', {type: 'submit', class: 'secondary'}); form.append(submit); root.append(form, result);
      const load = async () => {
        const generation = ++this.generation; submit.disabled = true; result.replaceChildren(node('p', 'Loading all accessible records…'));
        try {
          const query = new URLSearchParams(new FormData(form)); const out = await request('/api/insights?' + query);
          if (!this.isConnected || generation !== this.generation) return;
          result.replaceChildren();
          if (this.getAttribute('mode') !== 'dashboard') {
            result.append(node('p', out.cohort));
            result.append(table('Lead conversion by source', out.sources, [['source','Source'],['leads','Leads'],['converted','Converted'],['rate','Conversion %']]));
            result.append(table('Enrolments by school and intake', out.enrollment, [['school','School'],['intake','Intake'],['students','Students'],['enrolled','Enrolled']]));
            result.append(table('Agent performance', out.agents, [['agent','Agent'],['students','Students'],['enrolled','Enrolled']]));
            result.append(table('Recorded case stage duration', out.stages, [['stage','Stage'],['visits','Visits'],['averageHours','Average hours'],['hours','Total hours']]));
          }
          result.append(table('Due and overdue actions', out.nextActions, [['record','Record'],['action','Next action'],['deadline','Deadline']]));
        } catch (error) { if (generation === this.generation) result.replaceChildren(node('p', error.message)); }
        finally { if (generation === this.generation) submit.disabled = false; }
      };
      form.onsubmit = event => { event.preventDefault(); load(); }; load();
    }
  }
  customElements.define('crm-workspace', Workspace);
  customElements.define('crm-record-tools', RecordTools);
  customElements.define('crm-record-photo', RecordPhoto);
  customElements.define('crm-insights', Insights);
  customElements.define('crm-ai-productivity', AIProductivity);
  const updateTheme = () => {
    const theme=localStorage.getItem('theme') || 'light';
    for (const element of document.querySelectorAll('crm-workspace,crm-record-tools,crm-insights,crm-ai-productivity,crm-ai-chat,crm-administration')) { if(element.dataset.theme!==theme)element.dataset.theme=theme; }
  };
  new MutationObserver(updateTheme).observe(document.getElementById('app'), {childList:true, subtree:true});
  window.addEventListener('crm:theme-changed', updateTheme);
  document.addEventListener('click', event => {
    const link=event.target.closest('a[href^="#record-tools?"]');
    if(!link)return;
    const host=document.querySelector('crm-record-tools');if(!host)return;
    event.preventDefault();event.stopPropagation();
    const params=new URLSearchParams(link.getAttribute('href').split('?')[1]);
    const tab=params.get('tab');
    host.dispatchEvent(new CustomEvent('crm:select-tab',{detail:{tab,document:params.get('document')}}));
    host.scrollIntoView({block:'start',behavior:'smooth'});
  },true);
})();
