module Contacts
  ( handleListContacts
  , handleCreateContact
  , handleGetContact
  , handleUpdateContact
  , handleDeleteContact
  ) where

import           Control.Monad.IO.Class   (liftIO)
import           Data.Map                 (Map)
import qualified Data.Map                 as M
import           Data.Text                (Text)
import qualified Data.Text                as T
import           Data.Time.Clock.POSIX    (getPOSIXTime, posixSecondsToUTCTime)
import           Data.Time.Format         (defaultTimeLocale, formatTime)
import           Database.SQLite.Simple   (Connection)
import           Network.HTTP.Types.Status
                                          (status201, status400, status404)
import           Web.Scotty

import           Auth (requireAuth)
import qualified DB
import           Types

validStages :: [Text]
validStages = ["Lead", "Qualified", "Proposal", "Customer"]

handleListContacts :: Connection -> ActionM ()
handleListContacts conn = do
  _  <- requireAuth
  mq <- queryParamMaybe "q"
  let q = T.strip (maybe "" id mq)
  cs <- liftIO $ DB.listContacts conn (if T.null q then Nothing else Just q)
  json $ ContactsResponse cs (length cs)

handleCreateContact :: Connection -> ActionM ()
handleCreateContact conn = do
  _   <- requireAuth
  req <- jsonData :: ActionM ContactRequest
  let name    = T.strip (reqName req)
      email   = T.strip (reqEmail req)
      company = T.strip (reqCompany req)
      stage   = let s = T.strip (reqStage req) in if T.null s then "Lead" else s
  fields <- validateContact conn name email stage ""
  if not (M.null fields)
    then do
      status status400
      json $ FieldErrorResponse "Validation failed" fields
    else do
      now <- liftIO getPOSIXTime
      let cid   = "c_" <> T.pack (show (round now :: Integer))
          today = T.pack $
                    formatTime defaultTimeLocale "%Y-%m-%d"
                      (posixSecondsToUTCTime now)
          c     = Contact cid name email company stage today
      liftIO $ DB.insertContact conn c
      status status201
      json $ ContactResponse c

handleGetContact :: Connection -> ActionM ()
handleGetContact conn = do
  _   <- requireAuth
  cid <- captureParam "id"
  mc  <- liftIO $ DB.getContactById conn cid
  case mc of
    Nothing -> do
      status status404
      json $ ErrorResponse "Contact not found"
    Just c  -> json $ ContactResponse c

handleUpdateContact :: Connection -> ActionM ()
handleUpdateContact conn = do
  _   <- requireAuth
  cid <- captureParam "id"
  mc  <- liftIO $ DB.getContactById conn cid
  case mc of
    Nothing -> do
      status status404
      json $ ErrorResponse "Contact not found"
    Just original -> do
      req <- jsonData :: ActionM ContactRequest
      let name    = T.strip (reqName req)
          email   = T.strip (reqEmail req)
          company = T.strip (reqCompany req)
          stage   = let s = T.strip (reqStage req)
                    in if T.null s then "Lead" else s
      fields <- validateContact conn name email stage cid
      if not (M.null fields)
        then do
          status status400
          json $ FieldErrorResponse "Validation failed" fields
        else do
          let updated = original
                { contactName    = name
                , contactEmail   = email
                , contactCompany = company
                , contactStage   = stage
                }
          liftIO $ DB.updateContactRow conn updated
          json $ ContactResponse updated

handleDeleteContact :: Connection -> ActionM ()
handleDeleteContact conn = do
  _   <- requireAuth
  cid <- captureParam "id"
  n   <- liftIO $ DB.deleteContactById conn cid
  if n == 0
    then do
      status status404
      json $ ErrorResponse "Contact not found"
    else json $ DeletedResponse cid

validateContact
  :: Connection
  -> Text
  -> Text
  -> Text
  -> Text
  -> ActionM (Map Text Text)
validateContact conn name email stage excludeId = do
  let nameErr
        | T.null name         = Just "Name is required"
        | T.length name > 100 = Just "Name must be 100 characters or fewer"
        | otherwise           = Nothing

  emailErr <-
    if T.null email
      then return $ Just "Email is required"
      else if not ("@" `T.isInfixOf` email) || not ("." `T.isInfixOf` email)
        then return $ Just "Please enter a valid email"
        else do
          exists <- liftIO $
            if T.null excludeId
              then DB.contactEmailExists conn email
              else DB.contactEmailExistsOther conn email excludeId
          return $ if exists
            then Just "A contact with this email already exists"
            else Nothing

  let stageErr
        | T.null stage             = Nothing
        | stage `elem` validStages = Nothing
        | otherwise                = Just "Invalid stage"

  return $ M.fromList $
       [ ("name",  e) | Just e <- [nameErr]  ]
    ++ [ ("email", e) | Just e <- [emailErr] ]
    ++ [ ("stage", e) | Just e <- [stageErr] ]
