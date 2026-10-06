port module Ports exposing (downloadFile, storeTheme, storeToken, recordChanged)

{-| JavaScript interop.
-}


port storeToken : Maybe String -> Cmd msg


port downloadFile : { filename : String, content : String, mime : String } -> Cmd msg


port storeTheme : String -> Cmd msg


port recordChanged : (String -> msg) -> Sub msg
