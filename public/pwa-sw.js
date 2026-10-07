'use strict';

const CACHE_NAME = 'ecc-crm-shell-v1';
const APP_SHELL = [
  '/',
  '/elm.js',
  '/manifest.webmanifest',
  '/public/styles.css',
  '/public/workspace.css',
  '/public/mobile-tables.css',
  '/public/mobile.css',
  '/public/record-versions.js',
  '/public/center.js',
  '/public/components.js',
  '/public/administration.js',
  '/public/mobile.js',
  '/public/bootstrap.js',
  '/public/icons/ecc-192.png',
  '/public/icons/ecc-512.png',
  '/public/icons/ecc.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(names.filter(name => name.startsWith('ecc-crm-shell-') && name !== CACHE_NAME).map(name => caches.delete(name)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    // Only cache the public CRM shell. Never cache portal pages or authenticated data.
    const crmPath = url.pathname === '/' || /^\/(contacts|students|deals|tasks|reports|workspace|administration|settings|schools|agents|leads|cases|invoices|partners)(\/[^/]+)?\/?$/.test(url.pathname);
    if (!crmPath) return;
    event.respondWith(fetch(request).then(response => {
      if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
        const shell = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put('/', shell));
      }
      return response;
    }).catch(async () => (await caches.match('/')) || Response.error()));
    return;
  }

  if (!APP_SHELL.includes(url.pathname) || url.pathname === '/') return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok && response.type === 'basic') {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(url.pathname, copy));
    }
    return response;
  }).catch(async () => (await caches.match(url.pathname)) || Response.error()));
});
