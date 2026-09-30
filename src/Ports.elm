port module Ports exposing (storeToken)

{-| JavaScript interop. -}


port storeToken : Maybe String -> Cmd msg
