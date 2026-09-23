module Types
  ( User(..)
  , Contact(..)
  , LoginRequest(..)
  , RegisterRequest(..)
  , ContactRequest(..)
  , AuthResponse(..)
  , UserResponse(..)
  , ContactsResponse(..)
  , ContactResponse(..)
  , DeletedResponse(..)
  , ErrorResponse(..)
  , FieldErrorResponse(..)
  ) where

import Data.Aeson
import Data.Map (Map)
import Data.Text (Text)

-- | User record. Password is intentionally not serialized.
data User = User
  { userId       :: Text
  , userName     :: Text
  , userEmail    :: Text
  , userPassword :: Text
  } deriving (Show, Eq)

instance ToJSON User where
  toJSON u = object
    [ "id"    .= userId u
    , "name"  .= userName u
    , "email" .= userEmail u
    ]

data Contact = Contact
  { contactId          :: Text
  , contactName        :: Text
  , contactEmail       :: Text
  , contactCompany     :: Text
  , contactStage       :: Text
  , contactLastContact :: Text
  } deriving (Show, Eq)

instance ToJSON Contact where
  toJSON c = object
    [ "id"          .= contactId c
    , "name"        .= contactName c
    , "email"       .= contactEmail c
    , "company"     .= contactCompany c
    , "stage"       .= contactStage c
    , "lastContact" .= contactLastContact c
    ]

data LoginRequest = LoginRequest
  { loginEmail    :: Text
  , loginPassword :: Text
  }

instance FromJSON LoginRequest where
  parseJSON = withObject "LoginRequest" $ \o ->
    LoginRequest <$> o .: "email" <*> o .: "password"

data RegisterRequest = RegisterRequest
  { regName     :: Text
  , regEmail    :: Text
  , regPassword :: Text
  }

instance FromJSON RegisterRequest where
  parseJSON = withObject "RegisterRequest" $ \o ->
    RegisterRequest
      <$> o .:  "name"
      <*> o .:  "email"
      <*> o .:  "password"

data ContactRequest = ContactRequest
  { reqName    :: Text
  , reqEmail   :: Text
  , reqCompany :: Text
  , reqStage   :: Text
  }

instance FromJSON ContactRequest where
  parseJSON = withObject "ContactRequest" $ \o ->
    ContactRequest
      <$> o .:  "name"
      <*> o .:  "email"
      <*> (o .:? "company" .!= "")
      <*> (o .:? "stage"   .!= "")

newtype UserResponse = UserResponse { urUser :: User }
instance ToJSON UserResponse where
  toJSON (UserResponse u) = object [ "user" .= u ]

data AuthResponse = AuthResponse
  { authToken :: Text
  , authUser  :: User
  }

instance ToJSON AuthResponse where
  toJSON a = object
    [ "token" .= authToken a
    , "user"  .= authUser a
    ]

data ContactsResponse = ContactsResponse
  { crContacts :: [Contact]
  , crTotal    :: Int
  }

instance ToJSON ContactsResponse where
  toJSON c = object
    [ "contacts" .= crContacts c
    , "total"    .= crTotal c
    ]

newtype ContactResponse = ContactResponse { ctrContact :: Contact }
instance ToJSON ContactResponse where
  toJSON (ContactResponse c) = object [ "contact" .= c ]

newtype DeletedResponse = DeletedResponse { delId :: Text }
instance ToJSON DeletedResponse where
  toJSON (DeletedResponse i) = object [ "deleted" .= i ]

newtype ErrorResponse = ErrorResponse { errMessage :: Text }
instance ToJSON ErrorResponse where
  toJSON (ErrorResponse m) = object [ "error" .= m ]

data FieldErrorResponse = FieldErrorResponse
  { ferError  :: Text
  , ferFields :: Map Text Text
  }

instance ToJSON FieldErrorResponse where
  toJSON f = object
    [ "error"  .= ferError f
    , "fields" .= ferFields f
    ]
