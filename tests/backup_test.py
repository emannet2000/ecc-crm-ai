import importlib.util
import io
from pathlib import Path
import sqlite3
import tarfile
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


def module(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / (name + '.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


class BackupTest(unittest.TestCase):
    def test_roundtrip_preserves_wal_uploads_secret_and_relocates_files(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            data = directory / 'original'
            data.mkdir()
            database = data / 'crm.sqlite3'
            file = data / 'uploads' / 'org' / 'document' / 'private-file'
            file.parent.mkdir(parents=True)
            file.write_text('Confidential document')
            (data / 'auth-secret').write_text('private encryption secret')
            connection = sqlite3.connect(database)
            connection.execute('PRAGMA journal_mode=WAL')
            connection.execute('CREATE TABLE file_versions(id TEXT,org_id TEXT,document_id TEXT,storage_path TEXT)')
            connection.execute('INSERT INTO file_versions VALUES(?,?,?,?)', ('version', 'org', 'document', str(file)))
            connection.commit()
            archive = directory / 'backup.tar.gz'
            module('backup').backup(database, archive)
            connection.close()
            self.assertEqual(archive.stat().st_mode & 0o777, 0o600)
            restored = directory / 'restored'
            module('restore').restore(archive, restored)
            self.assertEqual((restored / 'auth-secret').read_text(), 'private encryption secret')
            with sqlite3.connect(restored / 'crm.sqlite3') as db:
                new = Path(db.execute('SELECT storage_path FROM file_versions').fetchone()[0])
            self.assertEqual(new.read_text(), 'Confidential document')
            self.assertTrue(new.is_relative_to(restored))
            self.assertEqual(new.stat().st_mode & 0o777, 0o600)
            with self.assertRaises(ValueError):
                module('restore').restore(archive, restored)

    def test_archive_traversal_and_symlinks_are_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            for name, kind in [('../escape', tarfile.REGTYPE), ('uploads/link', tarfile.SYMTYPE)]:
                archive = directory / 'unsafe.tar.gz'
                with tarfile.open(archive, 'w:gz') as tar:
                    info = tarfile.TarInfo(name)
                    info.type = kind
                    info.linkname = '../../escape'
                    tar.addfile(info, io.BytesIO())
                with self.assertRaises(ValueError):
                    module('restore').restore(archive, directory / 'restored')
                self.assertFalse((directory / 'restored').exists())
                self.assertFalse((directory / 'escape').exists())

    def test_backup_refuses_overwrite_and_missing_database(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            with self.assertRaises(ValueError):
                module('backup').backup(directory / 'missing', directory / 'backup')
            database = directory / 'crm.sqlite3'
            with sqlite3.connect(database) as db:
                db.execute('CREATE TABLE test(id INTEGER)')
            archive = directory / 'backup.tar.gz'
            module('backup').backup(database, archive)
            original = archive.read_bytes()
            with self.assertRaises(ValueError):
                module('backup').backup(database, archive)
            self.assertEqual(archive.read_bytes(), original)


if __name__ == '__main__':
    unittest.main()
