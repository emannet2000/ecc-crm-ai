#!/usr/bin/env bash
# Schedule this script from cron/systemd to back up the Compose data volume.
set -euo pipefail
cd "$(dirname "$0")/.."
backup_directory="${1:?Usage: scripts/backup-compose.sh /absolute/private/backup-directory}"
mkdir -p "$backup_directory"
backup_directory="$(realpath "$backup_directory")"
chmod 700 "$backup_directory"
backup_filename="crm-$(date -u +%Y%m%dT%H%M%SZ).tar.gz"
# Resume the service even when backup fails. Only the short backup window stops it.
trap 'docker compose up -d crm' EXIT
docker compose stop crm
docker compose run --rm --no-deps --user 0:0 -v "$backup_directory:/backups" crm python3 scripts/backup.py /app/data/crm.sqlite3 "/backups/$backup_filename"
printf 'Backup created: %s/%s\n' "$backup_directory" "$backup_filename"
