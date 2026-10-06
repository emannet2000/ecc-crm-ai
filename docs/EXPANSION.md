# Daily workflows, client portal, reporting and operations

The maintained application now has additions for all eight review priorities.
These are implementation additions, not a claim of production acceptance: live
provider tests and browser acceptance in an environment that permits Chromium remain required.

## Record tools

Record detail pages contain native web components for the relevant existing tools:
contact email/conversation, case uploads and versions, student preparation, school
programs, lead conversion, deal terms, invoice terms and refunds, and agent/partner
commissions. Workspace administration is also a native component; the iframe has
been removed. Components use shadow DOM to keep their styles and controls separate
from Elm, while a port refreshes the Elm record after an action succeeds.

Forms select the current record and hydrate existing values. Related actions still
use the existing server role and visibility checks. A read-only role cannot bypass
the backend by enabling a browser button. Configure AI activation under Workspace
→ Integrations. Portal invitations, recovery and unmatched messages are workspace
tabs. Advanced workflows remain available globally as well as on records.

## Client portal

Managers invite a student or contact from its record's **Client portal** tab.
Student invitations require a case explicitly linked to that student and a single
client identity across its cases. Contact invitations cover that contact's cases.
The recipient receives a private URL containing a token in its fragment. The
browser removes that fragment before exchanging it for a separate HttpOnly cookie.
The invitation is single-use and expires after 72 hours; an activated session
expires after seven days. Staff can revoke access at any time. Portal cookies do
not authorize staff API routes. Deleting the parent contact or student revokes
existing grants; restoring records does not reactivate those credentials.

At `/portal`, clients can see selected application status and requested next steps,
upload document versions, download their documents and invoice PDFs, and send a
response for a linked case. Students see invoices tied to their own cases; contact
invitations also include invoices without a case. Staff notes and unrelated records
are excluded from portal responses and invoice PDFs. Uploads reuse the existing
file signature checks and private storage. Staff must review documents; upload does
not mark them verified. Advisers see responses in the client's activity/conversation.

Invitation links are returned for staff to share. This implementation does not
send those links automatically or add a separate student password account.

## Reporting

`GET /api/insights?from=YYYY-MM-DD&to=YYYY-MM-DD` provides:

- Lead counts and conversion percentage by source.
- Student/enrolment counts by school and explicit intake.
- Agent referral and enrolment counts.
- Recorded time spent in case stages, with visit count and mean hours.
- A full-dataset action queue for due and overdue cases/tasks.

Creation-date filters select lead/student/case cohorts. Stage durations use recorded
transitions and include elapsed time in current visits. Tracking starts with this
upgrade; historical stage transitions are not invented. Intake is an explicit text
field in the student workflow; missing intakes are shown as **Unspecified**.
Dashboard totals, status counts, pipeline value, USD stage values and its creation heatmap now come from
server aggregates rather than the 200-deal board or loaded 25-record pages. The
existing activity/alert preview is labelled as a preview of loaded records. The new
action queue uses all accessible records. Deadlines are evaluated using the organization's configured timezone.

## Two-way communication

### Inbound email adapter

`POST /api/inbound/email` accepts a normalized provider/forwarder payload:

```json
{"id":"provider-message-id","orgId":"org_default","from":"client@example.com","subject":"Reply","body":"Message text","caseNumber":"ECC-001"}
```

Send `X-ECC-Timestamp` as Unix seconds and `X-ECC-Signature` as a hexadecimal
HMAC-SHA256 of `timestamp + "." + raw_body`, keyed by `INBOUND_EMAIL_SECRET`.
The receiver rejects invalid signatures and timestamps older than five minutes or
more than a minute in the future. Provider message IDs deduplicate retries within
the organization/channel. A unique sender-email match attaches the reply to that
contact. A matching case reference also attaches the case. Unknown/ambiguous senders
remain in **Unmatched inbox**, where managers explicitly choose a contact.

This normalized contract requires a provider adapter; it is not a Gmail webhook
subscription or an IMAP server. Inbound attachments are not imported automatically.

### Microsoft inbox sync

Set `GRAPH_ORG_ID` and delegated `GRAPH_ACCESS_TOKEN`, or configure the tenant,
client, secret and refresh-token settings for delegated OAuth renewal. Grant the
connected account Microsoft Graph `Mail.Read`. The worker follows Inbox delta
pages once a minute and stores the cursor only after committing the messages. A
stale cursor starts a deduplicated resync. Initial sync imports the existing Inbox,
so validate the mailbox choice before connecting. Deletions in the mailbox do not
remove CRM history. Sync status appears in **Unmatched inbox**. One Microsoft mailbox
and organization are configured per backend process in this first implementation.
Refresh tokens are supplied through deployment configuration; if Microsoft requires
reconnection or rotates a token that expires, update that configuration. The app does
not include an OAuth consent/connection UI.

This follows Microsoft's [message delta API](https://learn.microsoft.com/en-us/graph/api/message-delta?view=graph-rest-1.0).

### WhatsApp

Configure the `WHATSAPP_*` settings and bind the deployment to the correct workspace
and Meta phone-number ID. Register `/api/inbound/whatsapp` for verification and signed
message/status callbacks. Incoming text messages attach by a unique normalized phone
match; unknown senders remain unmatched. The contact **Conversation** tab queues
free-form replies only after an inbound message within 24 hours. API acceptance is
shown as **accepted**; delivered/read states require signed callbacks. Network
ambiguity becomes **uncertain** and is not automatically retried, to avoid duplicate
messages. Message templates and non-text media handling are not included. Provider
and account setup must be validated against your actual Meta configuration.

The signature/verification flow follows the [Meta WhatsApp webhook documentation](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/webhooks/start/).

## AI assistance

Set `OPENAI_API_KEY` and a supported `OPENAI_MODEL`, then explicitly enable AI for
the organization under Workspace → Integrations. It is disabled by default. Staff
can request summaries, follow-up drafts, and extraction from an uploaded case
document. Extraction supports PDF, PNG, JPEG, TXT and CSV, up to 8 MB. PDF/image
support also depends on the chosen model. Missing credentials and disabled settings
return setup errors, rather than fabricated AI output.

Jobs run outside the serialized CRM request handler. Only visible selected record
content and relevant visible document status are supplied. The request uses OpenAI
Responses with `store: false`; input is removed from the local job after completion.
A maximum of ten queued/processing jobs per organization limits backlog. Provider
results are displayed for staff to review, edit and copy. AI never sends a message,
marks a document verified or changes a CRM record. Drafts can be inaccurate and must
be checked against the source document. This is not a legal decision engine.

The input format follows OpenAI's [Responses text guide](https://developers.openai.com/api/docs/guides/text)
and [file inputs guide](https://developers.openai.com/api/docs/guides/file-inputs).

## Record conflicts and trash

API record responses include `_revision`, a content fingerprint. Browser edits and
deletions send it using `If-Match`; an outdated version returns HTTP 409. Versions
are frozen while an Elm edit modal is open, preventing a background refresh from
silently authorizing stale values. Workflow forms submit their hydrated record
version. Integrations should also pass `If-Match`; requests without it retain backward
compatibility. Bulk actions currently retain their existing semantics and do not
provide per-record version guards.

Successful deletions archive a batch of deleted records and related changes inside
the same transaction. Managers restore through **Trash**. Restoration is atomic:
changed related records, missing parents, cross-workspace scopes and repeated restores
are rejected. A failed persistence transaction does not create a successful archive.
Archives remain in the private database and backup until a future retention/purge
policy is implemented. Uploaded file versions remain privately stored for recovery.

## Deployment and recovery

`docker compose up --build -d` builds the Elm frontend and Go backend. The service
binds to localhost and stores private data in the `crm-data` volume. Configure an
HTTPS reverse proxy, `APP_URL` and secure cookies for external access. The demo admin
account still exists in a fresh database: change its password before use. Compose
passes the new AI/mail/WhatsApp settings; existing payment/SSO/push settings can be
added to the service environment as needed.

The Docker runtime includes the backup tools. Stop the service during a complete
backup so the database, uploaded files and encryption secret are mutually consistent:

```bash
python3 scripts/backup.py data/crm.sqlite3 /private/backups/crm-2026-10-06.tar.gz
python3 scripts/restore.py /private/backups/crm-2026-10-06.tar.gz /private/restored-data
```

Backup uses SQLite's online backup API and produces a mode-0600 archive. Restore
requires a new destination, rejects archive traversal/symlinks, checks SQLite
integrity and rewrites absolute document paths when relocating the data directory.
Preserve the configured `JWT_SECRET` separately when used; otherwise the generated
`auth-secret` is included. Schedule the backup command with your deployment scheduler
and periodically rehearse restoration. Retention/off-site storage are deployment
choices, not configured automatically.

Request logs contain route patterns, status and duration, without query strings,
request bodies or credentials. `/api/admin/metrics` requires an administrator and
reports process totals, errors, average latency, uptime and database pool statistics.
Shutdown stops accepting requests, drains in-flight requests and cancels workers
before closing the database.

## Verification and scaling limits

CI builds the maintained app, runs Go race tests and vet, exercises backup/restore,
runs DOM component checks, browser fixtures and a live login/reporting/mobile smoke
check. Local commands:

```bash
npm install
npm test
npm run test:browser
./build.sh
npm run test:live
python3 -m unittest discover -s tests -p '*_test.py'
(cd golang-backend && go test -race ./... && go vet ./...)
```

The new `/api/records/{entity}/{id}` and `/api/insights` GET handlers query committed
SQL with explicit organization/visibility scope and avoid mutating the global cache.
Scope indexes support that path. Existing handlers still rely on the serialized
projection/cache. The SQLite connection pool remains one connection, so transaction
ordering stays safe with legacy workers. This is a migration path, not completed
multi-process scaling. A `BenchmarkRecordReads` benchmark compares the SQL and legacy paths against
5,000 additional contacts (`go test -run '^$' -bench BenchmarkRecordReads -benchmem`).
No throughput claim is made until that benchmark is run in the deployment environment.
Moving the remaining handlers to SQL repositories, adding
SQL aggregate queries for large datasets, load tests, and a database/server migration
remain necessary for larger deployments. Provider credentials and external provider
acceptance tests are required before live integration use.

For Compose deployments, `scripts/backup-compose.sh /private/backups` automates
stopping the service, archiving the data volume, and restarting it even if backup
fails. Schedule it with cron or a systemd timer (for example daily at 02:00 UTC).
The backup container reads the private volume as root, so the host archive is owned
by root. Keep the destination private and use an appropriate operator account to
manage retention. The script is supplied but no scheduler is installed on this host.

## Local verification result

The optimized Elm build, Go build, full `go test -race ./...`, and `go vet ./...`
passed. Five DOM checks and three backup/restore tests passed. A short local benchmark
with 5,000 additional contacts measured about 0.52 ms and 39.5 KB per SQL record read,
versus 195 ms and 33 MB on the legacy path. The legacy sample had only one iteration,
so these figures demonstrate reduced copying overhead, not a production capacity
promise. Chromium launches and live HTTP smoke checks were blocked by sandbox socket
restrictions. Docker is unavailable in this environment, so the container build has
not been run. No live AI, Microsoft Graph, SMTP or WhatsApp credentials were used.
