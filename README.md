# Aevon — Odoo 19 Community

Odoo 19 Community Edition setup for **Aevon Clothing**, with custom and third-party add-ons.
Maintained by **Softycus Labs** — <https://softycus.com>

---

## Project structure

```
odoo-19/
├── README.md              ← this file
├── odoo.conf              ← server configuration (ports, database, addons path, limits)
├── requirement.txt        ← extra Python packages needed by the custom add-ons
├── .env-3-14-3/           ← Python 3.14 virtual environment (not committed)
├── .claude/
│   └── launch.json        ← dev-server preset used by Claude Code
├── source/                ← Odoo 19 Community core — do not edit
│   ├── odoo-bin           ← server entry point
│   ├── odoo/              ← framework + 699 standard add-ons (odoo/addons)
│   ├── requirements.txt   ← Odoo's own Python dependencies
│   └── setup/, doc/, ...
└── custom_addons/         ← our modules and third-party modules
    ├── sl_aevon/                  Aevon Home Menu (Softycus Labs)
    ├── sl_disable_odoo_tracking/  Stops the weekly report to Odoo S.A. (Softycus Labs)
    ├── base_accounting_kit/       Accounting kit (Cybrosys)
    ├── base_account_budget/       Budget management (Cybrosys)
    └── cybrosys_support_client/   Support helper required by the Cybrosys modules
```

**Rule of thumb:** never change files in `source/`. Everything specific to Aevon lives in
`custom_addons/` and `odoo.conf`, so the core can be replaced with a newer 19.0 build at any time.

---

## Custom add-ons

| Module | Author | Purpose | Depends on |
|---|---|---|---|
| `sl_aevon` | Softycus Labs | Enterprise-style full-screen app home screen | `web` |
| `sl_disable_odoo_tracking` | Softycus Labs | Stops the weekly database report to services.odoo.com (auto-installs) | `mail` |
| `base_accounting_kit` | Cybrosys | Financial reports, PDC, assets, bank reconciliation, lock dates | `account`, `sale`, `account_check_printing`, `analytic`, … |
| `base_account_budget` | Cybrosys | Budgets | `account`, `cybrosys_support_client` |
| `cybrosys_support_client` | Cybrosys | Support assistant used by the Cybrosys modules | `web` |

### `sl_aevon` — Aevon Home Menu

Replaces the Community apps dropdown with a full-screen grid of app icons, like Odoo Enterprise.

- Opens after login instead of jumping into the first app.
- Apps button in the navbar (or **Alt+H**) toggles it over the current app; **Esc** goes back.
- Type anywhere to search apps **and** menu items (e.g. `quot` → *Sales / Orders / Quotations*).
- Arrow keys + **Enter** to open; Ctrl/Cmd-click opens in a new tab.
- Works on mobile (3 columns; "All Apps" in the side menu opens it).

```
sl_aevon/static/src/
├── home_menu/
│   ├── home_menu.js           Owl component: grid, search, keyboard navigation
│   ├── home_menu.xml          template
│   ├── home_menu.scss         styling (change the background gradient here)
│   └── home_menu_service.js   shared open/closed state
├── navbar/
│   ├── navbar.xml             replaces the apps dropdown with a toggle button
│   └── navbar_patch.js
└── webclient/
    └── webclient_patch.js     shows the home screen when no app is open
```

### `sl_disable_odoo_tracking` — no weekly report to Odoo

Odoo Community has a hidden scheduled action, *Publisher: Update Notification* (in `mail`),
that once a week posts to `services.odoo.com`: the database UUID and name, user counts,
installed apps, the server URL (`web.base.url`), and the company name, email and phone.

This module switches that job off and replaces its code so nothing is sent, even if it is
run by hand. It has `auto_install` on, so every new database that has Discuss/mail gets it
automatically. Uninstalling it switches Odoo's job back on.

As a second layer, `odoo.conf` sets `publisher_warranty_url = http://127.0.0.1:9/`, so a
database without the module can't reach Odoo either.

Features you choose to use (SMS, IAP credits, partner autocomplete, stock images, Peppol,
bank sync, …) still talk to Odoo's servers — that is how those features work.

---

## Requirements

- macOS (paths in `odoo.conf` are macOS paths)
- Python **3.10 – 3.14** (this project uses 3.14.3)
- PostgreSQL **13+**, with a role that can create databases
- `wkhtmltopdf` 0.12.6 (with patched Qt) for PDF reports

---

## First-time setup

1. **Create the virtual environment and install dependencies**

   ```bash
   python3.14 -m venv .env-3-14-3
   ```

   ```bash
   .env-3-14-3/bin/pip install -r source/requirements.txt -r requirement.txt
   ```

2. **Create the PostgreSQL role** (once)

   ```bash
   createuser --createdb --pwprompt odoo19
   ```

   Use the same user and password as `db_user` / `db_password` in `odoo.conf`.

3. **Check `odoo.conf`** — at minimum `addons_path`, `db_user`, `db_password` and the SMTP settings.

---

## Running Odoo

All commands are run from the project root (`odoo-19/`).

Start the server:

```bash
.env-3-14-3/bin/python source/odoo-bin -c odoo.conf
```

Then open <http://localhost:8069>.

Start with developer reload (Python, XML and QWeb changes apply without a restart):

```bash
.env-3-14-3/bin/python source/odoo-bin -c odoo.conf --dev=reload,qweb,xml
```

Install a module into a database:

```bash
.env-3-14-3/bin/python source/odoo-bin -c odoo.conf -d odoo19 -i sl_aevon --stop-after-init
```

Upgrade a module after changing it:

```bash
.env-3-14-3/bin/python source/odoo-bin -c odoo.conf -d odoo19 -u sl_aevon --stop-after-init
```

Create a throwaway test database with a module installed:

```bash
.env-3-14-3/bin/python source/odoo-bin -c odoo.conf -d sl_aevon_test -i sl_aevon --stop-after-init
```

### Databases

| Database | Use |
|---|---|
| `odoo19` | main development database |
| `hexon` | separate database |
| `sl_aevon_test` | throwaway test database for `sl_aevon` — safe to drop |

---

## Adding a new module

1. Put it in `custom_addons/<module_name>/` with a `__manifest__.py` whose version starts with `19.0.`.
2. Prefix our own modules with `sl_` and set `'author': 'Softycus Labs'`, `'website': 'https://softycus.com'`.
3. Add any extra Python packages it needs to `requirement.txt`.
4. Restart Odoo, then **Apps → Update Apps List** (developer mode) and install it — or use `-i` as above.

---

## Configuration notes

Odoo 19 prints warnings for a few lines in the current `odoo.conf`. They are harmless but worth cleaning up:

| Line | Fix |
|---|---|
| `longpolling_port = 8072` | renamed — use `gevent_port = 8072` |
| `logrotate`, `session_timeout`, `limit_file_upload` | not Odoo options — remove |
| `db_name = False`, `log_db = False` | remove the line instead of setting `False` |
| `smtp_user` / `email_from` | still placeholders — set real values (Gmail needs an app password) |

`odoo.conf` holds the database password: keep it out of version control or share a copy without secrets.

---

## Credits

- Odoo Community Edition — © Odoo S.A., LGPL-3 (`source/LICENSE`)
- `base_accounting_kit`, `base_account_budget`, `cybrosys_support_client` — Cybrosys Technologies
- `sl_aevon` and project setup — Softycus Labs, <https://softycus.com>
