#!/usr/bin/env python3
"""SQLite online backup plus uploads and encryption secret in a private archive.
For a mutually consistent backup, stop the service while this command runs.
"""
import argparse
import os
from pathlib import Path
import sqlite3
import tarfile
import tempfile


def backup(database, destination, secret=None):
    database = Path(database).resolve()
    destination = Path(destination).resolve()
    if not database.is_file():
        raise ValueError('Database does not exist')
    secret = Path(secret).resolve() if secret else database.parent / 'auth-secret'
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        raise ValueError('Destination already exists; choose a new backup name')
    fd = os.open(destination, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with tempfile.TemporaryDirectory() as directory:
            snapshot = Path(directory) / 'crm.sqlite3'
            with sqlite3.connect(f'file:{database}?mode=ro', uri=True) as source, sqlite3.connect(snapshot) as target:
                source.backup(target)
                if target.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
                    raise ValueError('Database integrity check failed')
            with os.fdopen(fd, 'wb') as file, tarfile.open(fileobj=file, mode='w:gz') as archive:
                fd = None
                archive.add(snapshot, arcname='crm.sqlite3')
                uploads = database.parent / 'uploads'
                if uploads.exists():
                    archive.add(uploads, arcname='uploads')
                if secret.exists():
                    archive.add(secret, arcname='auth-secret')
    except BaseException:
        if fd is not None:
            os.close(fd)
        destination.unlink(missing_ok=True)
        raise


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('database')
    parser.add_argument('destination')
    parser.add_argument('--secret', help='Generated auth-secret path; preserve JWT_SECRET separately when configured')
    args = parser.parse_args()
    backup(args.database, args.destination, args.secret)
    print(f'Backup created: {args.destination}')
