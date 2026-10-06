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
  customElements.define('crm-insights', Insights);
  const updateTheme = () => {
    const theme=localStorage.getItem('theme') || 'light';
    for (const element of document.querySelectorAll('crm-workspace,crm-record-tools,crm-insights,crm-administration')) { if(element.dataset.theme!==theme)element.dataset.theme=theme; }
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
