# ECC-CRM

Polished contacts + deals + tasks CRM (Elm frontend, Go backend).

## Layout

```
ecc-crm/
  server-go/     Go API (auth, contacts, deals, activities, tasks)
  src/           Elm sources (Main, Types, Api, Views)
  public/        styles.css
  index.html
```

## Run backend

```bash
cd server-go
go test ./...
go run .
# listens on :4000, serves parent dir as static root
```

Demo user: `demo@northwind.dev` / `Demo1234`

## Build frontend

```bash
# from ecc-crm/
elm make src/Main.elm --output=elm.js
# open http://localhost:4000
```

## What’s included

- JWT auth (login / register / me)
- Contacts CRUD + detail + activities
- Deals kanban + stage moves
- **Tasks** list (status filters, cycle status, contact links)
- **URL routing** (`/contacts`, `/deals/:id`, `/tasks`, …) via `Browser.application`
- **Server-side search** with **350ms debounce**
- **Pagination** on contacts (API + UI)
- Loading skeletons
