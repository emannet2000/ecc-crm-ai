{-# LANGUAGE OverloadedStrings #-}

module Main where

import qualified Data.Text as T
import           Web.Scotty

import qualified DB
import           Auth
import           Contacts

main :: IO ()
main = do
  conn <- DB.initDB "northwind.db"
  DB.seedIfEmpty conn

  putStrLn "Haskell server listening on http://localhost:4000"
  putStrLn "Static files served from: .."

  scotty 4000 $ do
    -- ---------- API ----------
    post "/api/login"    $ handleLogin conn
    post "/api/register" $ handleRegister conn
    get  "/api/me"       $ handleMe conn

    get    "/api/contacts"     $ handleListContacts conn
    post   "/api/contacts"     $ handleCreateContact conn
    get    "/api/contacts/:id" $ handleGetContact conn
    put    "/api/contacts/:id" $ handleUpdateContact conn
    delete "/api/contacts/:id" $ handleDeleteContact conn

    -- ---------- Static files ----------
    get "/" $ file "../index.html"
    get "/elm.js" $ file "../elm.js"
    get "/styles.css" $ file "../styles.css"
    get "/public/:filename" $ do
      fn <- captureParam "filename"
      file ("../public/" <> T.unpack fn)
    get "/:filename" $ do
      fn <- captureParam "filename"
      file ("../" <> T.unpack fn)
