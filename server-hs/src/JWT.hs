module JWT
  ( TokenClaims(..)
  , signToken
  , verifyToken
  ) where

import           Crypto.Hash              (SHA256)
import           Crypto.MAC.HMAC          (HMAC, hmac)
import           Data.Aeson               (Value(..), decodeStrict, encode, object, (.=))
import qualified Data.Aeson.KeyMap        as KM
import qualified Data.ByteArray           as BA
import qualified Data.ByteArray.Encoding  as BAE
import qualified Data.ByteString          as BS
import qualified Data.ByteString.Lazy     as BSL
import           Data.Int                 (Int64)
import           Data.Text                (Text)
import qualified Data.Text                as T
import qualified Data.Text.Encoding       as TE
import           Data.Time.Clock.POSIX    (getPOSIXTime)

data TokenClaims = TokenClaims
  { tcSub   :: Text
  , tcEmail :: Text
  , tcExp   :: Int64
  } deriving (Show, Eq)

b64urlEncode :: BS.ByteString -> Text
b64urlEncode = TE.decodeUtf8 . BAE.convertToBase BAE.Base64URLUnpadded

b64urlDecode :: Text -> Maybe BS.ByteString
b64urlDecode t =
  case BAE.convertFromBase BAE.Base64URLUnpadded (TE.encodeUtf8 t) of
    Right bs -> Just bs
    Left  _  -> Nothing

hmacSHA256 :: BS.ByteString -> BS.ByteString -> BS.ByteString
hmacSHA256 key msg = BA.convert (hmac key msg :: HMAC SHA256)

signToken :: BS.ByteString -> Text -> Text -> Int64 -> IO Text
signToken secret sub email ttlSeconds = do
  now <- round <$> getPOSIXTime
  let exp'   = now + ttlSeconds
      header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}"
      payload = encode $ object
        [ "sub"   .= sub
        , "email" .= email
        , "iat"   .= now
        , "exp"   .= exp'
        ]
      headerB64  = b64urlEncode (TE.encodeUtf8 header)
      payloadB64 = b64urlEncode (BSL.toStrict payload)
      signingIn  = TE.encodeUtf8 (headerB64 <> "." <> payloadB64)
      sig        = hmacSHA256 secret signingIn
      sigB64     = b64urlEncode sig
  return $ headerB64 <> "." <> payloadB64 <> "." <> sigB64

verifyToken :: BS.ByteString -> Text -> IO (Maybe TokenClaims)
verifyToken secret token =
  case T.splitOn "." token of
    [h, p, s] -> do
      let signingIn   = TE.encodeUtf8 (h <> "." <> p)
          expectedSig = b64urlEncode (hmacSHA256 secret signingIn)
      if expectedSig /= s
        then return Nothing
        else case b64urlDecode p of
          Nothing        -> return Nothing
          Just payloadBS -> do
            now <- round <$> getPOSIXTime
            case decodeStrict payloadBS of
              Just (Object o) ->
                let msub   = asText (KM.lookup "sub" o)
                    memail = asText (KM.lookup "email" o)
                    mexp   = case KM.lookup "exp" o of
                               Just (Number n) -> Just (truncate n :: Int64)
                               _               -> Nothing
                in case (msub, memail, mexp) of
                     (Just sub, Just email, Just exp')
                       | exp' > now ->
                           return $ Just (TokenClaims sub email exp')
                       | otherwise  -> return Nothing
                     _ -> return Nothing
              _ -> return Nothing
    _ -> return Nothing
  where
    asText (Just (String s)) = Just s
    asText _                 = Nothing
