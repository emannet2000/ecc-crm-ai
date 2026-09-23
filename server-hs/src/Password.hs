module Password
  ( hashPassword
  , validatePassword
  ) where

import           Crypto.Hash              (Digest, SHA256, hash)
import qualified Data.ByteArray           as BA
import qualified Data.ByteArray.Encoding  as BAE
import           Data.Time.Clock.POSIX    (getPOSIXTime)
import qualified Data.ByteString          as BS
import qualified Data.Text                as T
import           Data.Text                (Text)
import qualified Data.Text.Encoding       as TE

-- | Iteration count. Higher = slower to brute-force.
iterations :: Int
iterations = 100000

-- | Iterated SHA256. This is our own mini-PBKDF2.
stretchHash :: BS.ByteString -> BS.ByteString
stretchHash = go iterations
  where
    go :: Int -> BS.ByteString -> BS.ByteString
    go 0 acc = acc
    go k acc = go (k - 1)
      (BA.convert (hash acc :: Digest SHA256) :: BS.ByteString)

-- | Hash a password. Returns base64(salt || hash).
hashPassword :: Text -> IO Text
hashPassword pw = do
  now <- round <$> getPOSIXTime
  let salt     = TE.encodeUtf8 $ T.pack (show (now :: Integer))
      combined = salt <> TE.encodeUtf8 pw
      hashed   = stretchHash combined
      result   = salt <> hashed
  return $ TE.decodeUtf8 $ BAE.convertToBase BAE.Base64 result

-- | Verify a password against a stored hash.
validatePassword :: Text -> Text -> Bool
validatePassword stored pw =
  case BAE.convertFromBase BAE.Base64 (TE.encodeUtf8 stored) of
    Left _ -> False
    Right raw ->
      let hashLen = 32
          saltLen = BS.length raw - hashLen
      in if saltLen <= 0
           then False
           else
             let salt     = BS.take saltLen raw
                 expected = BS.drop saltLen raw
                 combined = salt <> TE.encodeUtf8 pw
                 computed = stretchHash combined
             in computed == expected
