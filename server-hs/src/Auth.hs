module Auth
  ( handleLogin
  , handleRegister
  , handleMe
  , requireAuth
  , jwtSecret
  ) where

import           Control.Monad.IO.Class  (liftIO)
import qualified Data.ByteString         as BS
import           Data.Text               (Text)
import qualified Data.Text               as T
import qualified Data.Text.Lazy          as TL
import qualified Data.Text.Encoding      as TE
import           Data.Time.Clock.POSIX   (getPOSIXTime)
import           Database.SQLite.Simple  (Connection)
import           Network.HTTP.Types.Status
                                         (status400, status401, status409)
import           Web.Scotty

import           JWT
import           Types
import qualified DB
import qualified Password

jwtSecret :: BS.ByteString
jwtSecret = "change-me-in-production"

requireAuth :: ActionM TokenClaims
requireAuth = do
  mhdr <- header "Authorization"
  case mhdr of
    Nothing -> unauthorized "Missing authorization header"
    Just hdr ->
      case TL.stripPrefix "Bearer " (TL.strip hdr) of
        Nothing    -> unauthorized "Missing authorization header"
        Just token -> do
          mclaims <- liftIO $ verifyToken jwtSecret (TL.toStrict token)
          case mclaims of
            Nothing     -> unauthorized "Invalid or expired token"
            Just claims -> return claims
  where
    unauthorized msg = do
      status status401
      json $ ErrorResponse msg
      finish

handleLogin :: Connection -> ActionM ()
handleLogin conn = do
  body <- jsonData :: ActionM LoginRequest
  muser <- liftIO $ DB.findUserByEmail conn (loginEmail body)
  case muser of
    Nothing -> do
      status status401
      json $ ErrorResponse "Invalid email or password"
    Just user -> do
      let ok = Password.validatePassword
                 (userPassword user)
                 (loginPassword body)
      if not ok
        then do
          status status401
          json $ ErrorResponse "Invalid email or password"
        else do
          token <- liftIO $
            signToken jwtSecret (userId user) (userEmail user) (24 * 60 * 60)
          json $ AuthResponse token user

handleRegister :: Connection -> ActionM ()
handleRegister conn = do
  body <- jsonData :: ActionM RegisterRequest
  let name     = T.strip (regName body)
      email    = T.strip (regEmail body)
      password = regPassword body
  if T.null name || T.null email || T.null password
    then do
      status status400
      json $ ErrorResponse "Name, email, and password are required"
    else if T.length password < 8
      then do
        status status400
        json $ ErrorResponse "Password must be at least 8 characters"
      else do
        existing <- liftIO $ DB.findUserByEmail conn email
        case existing of
          Just _ -> do
            status status409
            json $ ErrorResponse "An account with that email already exists"
          Nothing -> do
            hash <- liftIO $ Password.hashPassword password
            now  <- liftIO $ round <$> getPOSIXTime
            let uid  = "u_" <> T.pack (show (now :: Integer))
                user = User uid name email hash
            liftIO $ DB.insertUser conn user
            token <- liftIO $
              signToken jwtSecret uid email (24 * 60 * 60)
            json $ AuthResponse token user

handleMe :: Connection -> ActionM ()
handleMe conn = do
  claims <- requireAuth
  muser  <- liftIO $ DB.findUserByEmail conn (tcEmail claims)
  case muser of
    Nothing -> do
      status status401
      json $ ErrorResponse "User not found"
    Just user -> json $ UserResponse user
