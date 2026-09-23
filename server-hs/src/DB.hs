module DB
  ( initDB
  , seedIfEmpty
  , findUserByEmail
  , insertUser
  , listContacts
  , getContactById
  , insertContact
  , updateContactRow
  , deleteContactById
  , contactEmailExists
  , contactEmailExistsOther
  ) where

import           Control.Monad            (when)
import           Data.String              (fromString)
import           Data.Text                (Text)
import qualified Data.Text                as T
import           Database.SQLite.Simple
import qualified Password
import           Types

initDB :: FilePath -> IO Connection
initDB path = do
  conn <- open path
  execute_ conn "PRAGMA foreign_keys = ON"
  execute_ conn "PRAGMA journal_mode = WAL"
  execute_ conn
    "CREATE TABLE IF NOT EXISTS users (\
    \  id       TEXT PRIMARY KEY,\
    \  name     TEXT NOT NULL,\
    \  email    TEXT NOT NULL UNIQUE,\
    \  password TEXT NOT NULL\
    \)"
  execute_ conn
    "CREATE TABLE IF NOT EXISTS contacts (\
    \  id           TEXT PRIMARY KEY,\
    \  name         TEXT NOT NULL,\
    \  email        TEXT NOT NULL UNIQUE,\
    \  company      TEXT NOT NULL DEFAULT '',\
    \  stage        TEXT NOT NULL DEFAULT 'Lead',\
    \  last_contact TEXT NOT NULL\
    \)"
  execute_ conn "CREATE INDEX IF NOT EXISTS idx_contacts_email   ON contacts(email)"
  execute_ conn "CREATE INDEX IF NOT EXISTS idx_contacts_name    ON contacts(name)"
  execute_ conn "CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company)"
  execute_ conn "CREATE INDEX IF NOT EXISTS idx_users_email      ON users(email)"
  return conn

instance FromRow User where
  fromRow = User <$> field <*> field <*> field <*> field

instance FromRow Contact where
  fromRow = Contact <$> field <*> field <*> field <*> field <*> field <*> field

seedIfEmpty :: Connection -> IO ()
seedIfEmpty conn = do
  n1 <- countRows conn "users"
  when (n1 == 0) $ do
    hash <- Password.hashPassword "Demo1234"
    insertUser conn $
      User "u_1" "Demo User" "demo@northwind.dev" hash
    putStrLn "Seeded demo user: demo@northwind.dev / Demo1234"
  n2 <- countRows conn "contacts"
  when (n2 == 0) $ do
    mapM_ (insertContact conn) seedContactsList
    putStrLn "Seeded 8 contacts"

countRows :: Connection -> String -> IO Int
countRows conn table = do
  rows <- query_ conn $ fromString $
    "SELECT COUNT(*) FROM " ++ table
  return $ case rows of
    [Only n] -> n
    _        -> 0

findUserByEmail :: Connection -> Text -> IO (Maybe User)
findUserByEmail conn email = do
  rows <- query conn
    "SELECT id, name, email, password FROM users WHERE email = ?"
    (Only email)
  return $ case rows of
    [u] -> Just u
    _   -> Nothing

insertUser :: Connection -> User -> IO ()
insertUser conn u =
  execute conn
    "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)"
    (userId u, userName u, userEmail u, userPassword u)

listContacts :: Connection -> Maybe Text -> IO [Contact]
listContacts conn mq = case mq of
  Nothing ->
    query_ conn
      "SELECT id, name, email, company, stage, last_contact \
      \FROM contacts ORDER BY name COLLATE NOCASE"
  Just q  ->
    let like = "%" <> T.toLower q <> "%"
    in query conn
         "SELECT id, name, email, company, stage, last_contact \
         \FROM contacts \
         \WHERE LOWER(name) LIKE ? \
         \   OR LOWER(email) LIKE ? \
         \   OR LOWER(company) LIKE ? \
         \ORDER BY name COLLATE NOCASE"
         (like, like, like)

getContactById :: Connection -> Text -> IO (Maybe Contact)
getContactById conn cid = do
  rows <- query conn
    "SELECT id, name, email, company, stage, last_contact \
    \FROM contacts WHERE id = ?"
    (Only cid)
  return $ case rows of
    [c] -> Just c
    _   -> Nothing

insertContact :: Connection -> Contact -> IO ()
insertContact conn c =
  execute conn
    "INSERT INTO contacts (id, name, email, company, stage, last_contact) \
    \VALUES (?, ?, ?, ?, ?, ?)"
    ( contactId c
    , contactName c
    , contactEmail c
    , contactCompany c
    , contactStage c
    , contactLastContact c
    )

updateContactRow :: Connection -> Contact -> IO ()
updateContactRow conn c =
  execute conn
    "UPDATE contacts SET name = ?, email = ?, company = ?, stage = ? WHERE id = ?"
    ( contactName c
    , contactEmail c
    , contactCompany c
    , contactStage c
    , contactId c
    )

deleteContactById :: Connection -> Text -> IO Int
deleteContactById conn cid = do
  execute conn "DELETE FROM contacts WHERE id = ?" (Only cid)
  changes conn

contactEmailExists :: Connection -> Text -> IO Bool
contactEmailExists conn email = do
  rows <- query conn
    "SELECT id FROM contacts WHERE LOWER(email) = LOWER(?)"
    (Only email) :: IO [Only Text]
  return $ not (null rows)

contactEmailExistsOther :: Connection -> Text -> Text -> IO Bool
contactEmailExistsOther conn email cid = do
  rows <- query conn
    "SELECT id FROM contacts WHERE LOWER(email) = LOWER(?) AND id != ?"
    (email, cid) :: IO [Only Text]
  return $ not (null rows)

seedContactsList :: [Contact]
seedContactsList =
  [ Contact "c_1" "Ada Lovelace"       "ada@analytical.io"  "Analytical Engines" "Customer"  "2026-09-08"
  , Contact "c_2" "Grace Hopper"       "grace@navy.mil"     "US Navy"            "Customer"  "2026-09-05"
  , Contact "c_3" "Alan Turing"        "alan@bletchley.uk"  "Bletchley Park"     "Qualified" "2026-09-01"
  , Contact "c_4" "Katherine Johnson"  "kj@nasa.gov"        "NASA"               "Proposal"  "2026-08-28"
  , Contact "c_5" "Linus Torvalds"     "linus@kernel.org"   "Linux Foundation"   "Lead"      "2026-08-22"
  , Contact "c_6" "Margaret Hamilton"  "mh@mit.edu"         "MIT"                "Customer"  "2026-09-09"
  , Contact "c_7" "Donald Knuth"       "knuth@stanford.edu" "Stanford"           "Qualified" "2026-08-30"
  , Contact "c_8" "Barbara Liskov"     "liskov@mit.edu"     "MIT"                "Proposal"  "2026-08-25"
  ]
