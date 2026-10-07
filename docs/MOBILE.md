# Mobile web version

Open the same CRM address in your phone or tablet browser and sign in with your
existing account. User roles, private records and administration permissions apply
on every screen size. The client portal and invitation/password-recovery pages
also adapt to phones.

On screens up to 900 pixels wide, bottom navigation provides **Home**, **Clients**,
**Cases**, **Tasks**, and **More**. More opens the full module menu, including
System administration for Administrators. Close the menu with its close button,
the backdrop or Escape. Focus stays inside the open menu and returns when it
closes; background content cannot receive accidental taps while it is open.

At phone widths up to 600 pixels, ordinary record and administration tables become
labelled cards. Record links, action buttons, sorting controls and pagination keep
their existing behavior. Tables with grouped or spanning cells retain their table
layout and scroll within their container. Larger screens retain the desktop tables.

Controls have larger touch targets and form fields use a 16-pixel font. Phone edit
forms use the available screen height; confirmation dialogs open as bottom sheets.
Layouts allow space for display cutouts and the home indicator. Deal boards scroll
horizontally between stages. On supported browsers, install ECC CRM from the
in-app **Install ECC CRM** button or the browser menu. On iPhone/iPad, open the app
in Safari, use **Share**, then **Add to Home Screen**. Installation requires HTTPS
in production; localhost is supported for development.

The service worker keeps only the public app shell and static files available
offline. It never caches API responses, uploaded photos, documents or client data.
The offline notice appears when the browser reports a lost connection. Sign-in,
record data, uploads and edits still need a connection; offline edits and background
synchronization are not implemented.

## Open it on a phone

Use the reachable address of your CRM deployment. `localhost:7000` on your phone
refers to the phone itself, not the computer running ECC CRM. For testing on the
same local network, open `http://<computer-LAN-IP>:7000`, provided the host's
network/firewall permits it. Configure `APP_URL` to the same reachable address so
invitation links work on the phone too. Production access should use the deployment's
HTTPS address and existing secure-cookie configuration.

This is a responsive web version. It uses the existing frontend and backend and
does not require a separate mobile account, App Store package or Play Store package.

## Verification

`npm test` includes checks for mobile table updates, retained record actions and
sorting, shadow-DOM tables, drawer focus and inert state, desktop resizing, dialog
scroll locking, and online/offline status. Browser smoke coverage checks 320-, 390-
and 768-pixel viewports, mobile navigation, form sizing and administration access.
Browser execution requires an environment where Chromium can launch; local DOM
checks do not verify final visual layout or a physical phone's keyboard behavior.
