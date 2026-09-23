module Api exposing (..)

import Dict
import Http
import Json.Decode as D
import Json.Encode as E
import Types exposing (..)
import Url


-- DECODERS ----------------------------------------------------------------


userDecoder : D.Decoder User
userDecoder =
    D.map3 User
        (D.field "id" D.string)
        (D.field "name" D.string)
        (D.field "email" D.string)


optString : String -> D.Decoder String
optString field =
    D.oneOf
        [ D.field field D.string
        , D.succeed ""
        ]


optStringList : String -> D.Decoder (List String)
optStringList field =
    D.oneOf
        [ D.field field (D.list D.string)
        , D.succeed []
        ]


andMap : D.Decoder a -> D.Decoder (a -> b) -> D.Decoder b
andMap =
    D.map2 (|>)


type alias ContactCore =
    { id : String
    , name : String
    , email : String
    , company : String
    , title : String
    , phone : String
    , location : String
    , stage : String
    }


type alias ContactExtras =
    { lastContact : String
    , owner : String
    , tags : List String
    , notes : String
    , createdAt : String
    }


contactCoreDecoder : D.Decoder ContactCore
contactCoreDecoder =
    D.map8 ContactCore
        (D.field "id" D.string)
        (D.field "name" D.string)
        (D.field "email" D.string)
        (D.field "company" D.string)
        (optString "title")
        (optString "phone")
        (optString "location")
        (D.oneOf [ D.field "stage" D.string, D.succeed "Lead" ])


contactExtrasDecoder : D.Decoder ContactExtras
contactExtrasDecoder =
    D.map5 ContactExtras
        (optString "lastContact")
        (optString "owner")
        (optStringList "tags")
        (optString "notes")
        (optString "createdAt")


contactDecoder : D.Decoder Contact
contactDecoder =
    D.map2
        (\core extras ->
            Contact
                core.id
                core.name
                core.email
                core.company
                core.title
                core.phone
                core.location
                core.stage
                extras.lastContact
                extras.owner
                extras.tags
                extras.notes
                extras.createdAt
        )
        contactCoreDecoder
        contactExtrasDecoder


contactsDecoder : D.Decoder (List Contact)
contactsDecoder =
    D.field "contacts" (D.list contactDecoder)


activityDecoder : D.Decoder Activity
activityDecoder =
    D.map Activity
        (D.field "id" D.string)
        |> andMap (D.field "contactId" D.string)
        |> andMap (optString "dealId")
        |> andMap (D.field "kind" D.string)
        |> andMap (D.field "title" D.string)
        |> andMap (optString "body")
        |> andMap (optString "occurredAt")
        |> andMap (optString "createdBy")
        |> andMap (optString "createdAt")


activitiesDecoder : D.Decoder (List Activity)
activitiesDecoder =
    D.field "activities" (D.list activityDecoder)


authResponseDecoder : D.Decoder AuthResponse
authResponseDecoder =
    D.map2 AuthResponse
        (D.field "token" D.string)
        (D.field "user" userDecoder)


profileUpdateDecoder : D.Decoder ProfileUpdateResponse
profileUpdateDecoder =
    D.map2 ProfileUpdateResponse
        (D.field "user" userDecoder)
        (D.field "token" D.string)


errorDecoder : D.Decoder String
errorDecoder =
    D.field "error" D.string


fieldErrorDecoder : D.Decoder (List ( String, String ))
fieldErrorDecoder =
    D.map Dict.toList (D.field "fields" (D.dict D.string))


-- ENCODERS ----------------------------------------------------------------


loginPayload : String -> String -> E.Value
loginPayload email password =
    E.object
        [ ( "email", E.string email )
        , ( "password", E.string password )
        ]


registerPayload : String -> String -> String -> E.Value
registerPayload name email password =
    E.object
        [ ( "name", E.string name )
        , ( "email", E.string email )
        , ( "password", E.string password )
        ]


contactFormPayload : ContactForm -> E.Value
contactFormPayload cf =
    E.object
        [ ( "name", E.string cf.name )
        , ( "email", E.string cf.email )
        , ( "company", E.string cf.company )
        , ( "title", E.string cf.title )
        , ( "phone", E.string cf.phone )
        , ( "location", E.string cf.location )
        , ( "stage", E.string cf.stage )
        , ( "tags", E.list E.string cf.tags )
        , ( "notes", E.string cf.notes )
        ]


dealFormPayload : DealForm -> E.Value
dealFormPayload df =
    E.object
        [ ( "title", E.string df.title )
        , ( "contactId", E.string df.contactId )
        , ( "value", E.float (Maybe.withDefault 0 (String.toFloat df.value)) )
        , ( "stage", E.string df.stage )
        , ( "closeDate", E.string df.closeDate )
        , ( "owner", E.string df.owner )
        , ( "notes", E.string df.notes )
        ]


activityFormPayload : ActivityForm -> E.Value
activityFormPayload af =
    E.object
        [ ( "kind", E.string af.kind )
        , ( "title", E.string af.title )
        , ( "body", E.string af.body )
        , ( "occurredAt", E.string af.occurredAt )
        , ( "dealId", E.string "" )
        ]


type alias DealCore =
    { id : String
    , title : String
    , contactId : String
    , contactName : String
    , value : Float
    }


type alias DealExtras =
    { stage : String
    , closeDate : String
    , owner : String
    , notes : String
    , createdAt : String
    }


dealCoreDecoder : D.Decoder DealCore
dealCoreDecoder =
    D.map5 DealCore
        (D.field "id" D.string)
        (D.field "title" D.string)
        (optString "contactId")
        (optString "contactName")
        (D.oneOf [ D.field "value" D.float, D.succeed 0 ])


dealExtrasDecoder : D.Decoder DealExtras
dealExtrasDecoder =
    D.map5 DealExtras
        (D.oneOf [ D.field "stage" D.string, D.succeed "Lead" ])
        (optString "closeDate")
        (optString "owner")
        (optString "notes")
        (optString "createdAt")


dealDecoder : D.Decoder Deal
dealDecoder =
    D.map2
        (\core extras ->
            Deal
                core.id
                core.title
                core.contactId
                core.contactName
                core.value
                extras.stage
                extras.closeDate
                extras.owner
                extras.notes
                extras.createdAt
        )
        dealCoreDecoder
        dealExtrasDecoder


dealsDecoder : D.Decoder (List Deal)
dealsDecoder =
    D.field "deals" (D.list dealDecoder)


-- EXPECTS -----------------------------------------------------------------


authExpect : (Result String AuthResponse -> msg) -> Http.Expect msg
authExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err ("Bad URL: " ++ url)

                Http.Timeout_ ->
                    Err "Request timed out."

                Http.NetworkError_ ->
                    Err "Network error. Check your connection."

                Http.BadStatus_ metadata body ->
                    case D.decodeString errorDecoder body of
                        Ok msg ->
                            Err msg

                        Err _ ->
                            Err ("Request failed (" ++ String.fromInt metadata.statusCode ++ ").")

                Http.GoodStatus_ _ body ->
                    case D.decodeString authResponseDecoder body of
                        Ok res ->
                            Ok res

                        Err err ->
                            Err ("Could not parse response: " ++ D.errorToString err)


userExpect : (Result String User -> msg) -> Http.Expect msg
userExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err ("Bad URL: " ++ url)

                Http.Timeout_ ->
                    Err "Request timed out."

                Http.NetworkError_ ->
                    Err "Network error."

                Http.BadStatus_ _ body ->
                    case D.decodeString errorDecoder body of
                        Ok msg ->
                            Err msg

                        Err _ ->
                            Err "Not authorized."

                Http.GoodStatus_ _ body ->
                    case D.decodeString (D.field "user" userDecoder) body of
                        Ok user ->
                            Ok user

                        Err err ->
                            Err ("Could not parse response: " ++ D.errorToString err)


contactsExpect : (Result String (List Contact) -> msg) -> Http.Expect msg
contactsExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err ("Bad URL: " ++ url)

                Http.Timeout_ ->
                    Err "Request timed out."

                Http.NetworkError_ ->
                    Err "Network error."

                Http.BadStatus_ _ body ->
                    case D.decodeString errorDecoder body of
                        Ok msg ->
                            Err msg

                        Err _ ->
                            Err "Could not load contacts."

                Http.GoodStatus_ _ body ->
                    case D.decodeString contactsDecoder body of
                        Ok cs ->
                            Ok cs

                        Err err ->
                            Err ("Could not parse contacts: " ++ D.errorToString err)


activitiesExpect : (Result String (List Activity) -> msg) -> Http.Expect msg
activitiesExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err ("Bad URL: " ++ url)

                Http.Timeout_ ->
                    Err "Request timed out."

                Http.NetworkError_ ->
                    Err "Network error."

                Http.BadStatus_ _ body ->
                    case D.decodeString errorDecoder body of
                        Ok msg ->
                            Err msg

                        Err _ ->
                            Err "Could not load activity."

                Http.GoodStatus_ _ body ->
                    case D.decodeString activitiesDecoder body of
                        Ok as_ ->
                            Ok as_

                        Err err ->
                            Err ("Could not parse activity: " ++ D.errorToString err)


savedContactExpect : (Result ApiError Contact -> msg) -> Http.Expect msg
savedContactExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err (GenericError ("Bad URL: " ++ url))

                Http.Timeout_ ->
                    Err (GenericError "Request timed out.")

                Http.NetworkError_ ->
                    Err (GenericError "Network error. Check your connection.")

                Http.BadStatus_ _ body ->
                    case D.decodeString fieldErrorDecoder body of
                        Ok fields ->
                            Err (FieldErrors fields)

                        Err _ ->
                            case D.decodeString errorDecoder body of
                                Ok msg ->
                                    Err (GenericError msg)

                                Err _ ->
                                    Err (GenericError "Could not save contact.")

                Http.GoodStatus_ _ body ->
                    case D.decodeString (D.field "contact" contactDecoder) body of
                        Ok c ->
                            Ok c

                        Err err ->
                            Err (GenericError ("Could not parse response: " ++ D.errorToString err))


deletedExpect : (Result String String -> msg) -> Http.Expect msg
deletedExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err ("Bad URL: " ++ url)

                Http.Timeout_ ->
                    Err "Request timed out."

                Http.NetworkError_ ->
                    Err "Network error. Check your connection."

                Http.BadStatus_ _ body ->
                    case D.decodeString errorDecoder body of
                        Ok msg ->
                            Err msg

                        Err _ ->
                            Err "Could not delete contact."

                Http.GoodStatus_ _ body ->
                    case D.decodeString (D.field "deleted" D.string) body of
                        Ok id ->
                            Ok id

                        Err err ->
                            Err ("Could not parse response: " ++ D.errorToString err)


dealsExpect : (Result String (List Deal) -> msg) -> Http.Expect msg
dealsExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err ("Bad URL: " ++ url)

                Http.Timeout_ ->
                    Err "Request timed out."

                Http.NetworkError_ ->
                    Err "Network error."

                Http.BadStatus_ metadata body ->
                    case D.decodeString errorDecoder body of
                        Ok msg ->
                            Err msg

                        Err _ ->
                            Err
                                ("Could not load deals (HTTP "
                                    ++ String.fromInt metadata.statusCode
                                    ++ "). Is /api/deals implemented on the backend?"
                                )

                Http.GoodStatus_ _ body ->
                    case D.decodeString dealsDecoder body of
                        Ok ds ->
                            Ok ds

                        Err err ->
                            Err ("Could not parse deals: " ++ D.errorToString err)


savedDealExpect : (Result ApiError Deal -> msg) -> Http.Expect msg
savedDealExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err (GenericError ("Bad URL: " ++ url))

                Http.Timeout_ ->
                    Err (GenericError "Request timed out.")

                Http.NetworkError_ ->
                    Err (GenericError "Network error. Check your connection.")

                Http.BadStatus_ metadata body ->
                    case D.decodeString fieldErrorDecoder body of
                        Ok fields ->
                            Err (FieldErrors fields)

                        Err _ ->
                            case D.decodeString errorDecoder body of
                                Ok msg ->
                                    Err (GenericError msg)

                                Err _ ->
                                    Err
                                        (GenericError
                                            ("Could not save deal (HTTP "
                                                ++ String.fromInt metadata.statusCode
                                                ++ ")."
                                            )
                                        )

                Http.GoodStatus_ _ body ->
                    case D.decodeString (D.field "deal" dealDecoder) body of
                        Ok d ->
                            Ok d

                        Err err ->
                            Err (GenericError ("Could not parse response: " ++ D.errorToString err))


deletedDealExpect : (Result String String -> msg) -> Http.Expect msg
deletedDealExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err ("Bad URL: " ++ url)

                Http.Timeout_ ->
                    Err "Request timed out."

                Http.NetworkError_ ->
                    Err "Network error. Check your connection."

                Http.BadStatus_ metadata body ->
                    case D.decodeString errorDecoder body of
                        Ok msg ->
                            Err msg

                        Err _ ->
                            Err
                                ("Could not delete deal (HTTP "
                                    ++ String.fromInt metadata.statusCode
                                    ++ ")."
                                )

                Http.GoodStatus_ _ body ->
                    case D.decodeString (D.field "deleted" D.string) body of
                        Ok id ->
                            Ok id

                        Err err ->
                            Err ("Could not parse response: " ++ D.errorToString err)


savedActivityExpect : (Result ApiError Activity -> msg) -> Http.Expect msg
savedActivityExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err (GenericError ("Bad URL: " ++ url))

                Http.Timeout_ ->
                    Err (GenericError "Request timed out.")

                Http.NetworkError_ ->
                    Err (GenericError "Network error. Check your connection.")

                Http.BadStatus_ _ body ->
                    case D.decodeString fieldErrorDecoder body of
                        Ok fields ->
                            Err (FieldErrors fields)

                        Err _ ->
                            case D.decodeString errorDecoder body of
                                Ok msg ->
                                    Err (GenericError msg)

                                Err _ ->
                                    Err (GenericError "Could not save activity.")

                Http.GoodStatus_ _ body ->
                    case D.decodeString (D.field "activity" activityDecoder) body of
                        Ok a ->
                            Ok a

                        Err err ->
                            Err (GenericError ("Could not parse response: " ++ D.errorToString err))


deletedActivityExpect : (Result String String -> msg) -> Http.Expect msg
deletedActivityExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err ("Bad URL: " ++ url)

                Http.Timeout_ ->
                    Err "Request timed out."

                Http.NetworkError_ ->
                    Err "Network error. Check your connection."

                Http.BadStatus_ _ body ->
                    case D.decodeString errorDecoder body of
                        Ok msg ->
                            Err msg

                        Err _ ->
                            Err "Could not delete activity."

                Http.GoodStatus_ _ body ->
                    case D.decodeString (D.field "deleted" D.string) body of
                        Ok id ->
                            Ok id

                        Err err ->
                            Err ("Could not parse response: " ++ D.errorToString err)


profileUpdateExpect : (Result ApiError ProfileUpdateResponse -> msg) -> Http.Expect msg
profileUpdateExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err (GenericError ("Bad URL: " ++ url))

                Http.Timeout_ ->
                    Err (GenericError "Request timed out.")

                Http.NetworkError_ ->
                    Err (GenericError "Network error. Check your connection.")

                Http.BadStatus_ _ body ->
                    case D.decodeString fieldErrorDecoder body of
                        Ok fields ->
                            Err (FieldErrors fields)

                        Err _ ->
                            case D.decodeString errorDecoder body of
                                Ok msg ->
                                    Err (GenericError msg)

                                Err _ ->
                                    Err (GenericError "Could not update profile.")

                Http.GoodStatus_ _ body ->
                    case D.decodeString profileUpdateDecoder body of
                        Ok res ->
                            Ok res

                        Err err ->
                            Err (GenericError ("Could not parse response: " ++ D.errorToString err))


statusExpect : (Result String String -> msg) -> Http.Expect msg
statusExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err ("Bad URL: " ++ url)

                Http.Timeout_ ->
                    Err "Request timed out."

                Http.NetworkError_ ->
                    Err "Network error. Check your connection."

                Http.BadStatus_ _ body ->
                    case D.decodeString errorDecoder body of
                        Ok msg ->
                            Err msg

                        Err _ ->
                            Err "Request failed."

                Http.GoodStatus_ _ body ->
                    case D.decodeString (D.field "status" D.string) body of
                        Ok s ->
                            Ok s

                        Err err ->
                            Err ("Could not parse response: " ++ D.errorToString err)


-- REQUESTS ----------------------------------------------------------------


login : String -> String -> (Result String AuthResponse -> msg) -> Cmd msg
login email password toMsg =
    Http.post
        { url = "/api/login"
        , body = Http.jsonBody (loginPayload email password)
        , expect = authExpect toMsg
        }


register : String -> String -> String -> (Result String AuthResponse -> msg) -> Cmd msg
register name email password toMsg =
    Http.post
        { url = "/api/register"
        , body = Http.jsonBody (registerPayload name email password)
        , expect = authExpect toMsg
        }


me : String -> (Result String User -> msg) -> Cmd msg
me token toMsg =
    Http.request
        { method = "GET"
        , headers = [ Http.header "Authorization" ("Bearer " ++ token) ]
        , url = "/api/me"
        , body = Http.emptyBody
        , expect = userExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


fetchContacts : String -> String -> Int -> Int -> (Result String ( List Contact, Int ) -> msg) -> Cmd msg
fetchContacts token query limit offset toMsg =
    let
        qs =
            String.join "&"
                [ "q=" ++ Url.percentEncode query
                , "limit=" ++ String.fromInt limit
                , "offset=" ++ String.fromInt offset
                ]
    in
    Http.request
        { method = "GET"
        , headers = [ Http.header "Authorization" ("Bearer " ++ token) ]
        , url = "/api/contacts?" ++ qs
        , body = Http.emptyBody
        , expect = contactsPageExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


createContact : String -> ContactForm -> (Result ApiError Contact -> msg) -> Cmd msg
createContact token cf toMsg =
    Http.request
        { method = "POST"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ token)
            , Http.header "Content-Type" "application/json"
            ]
        , url = "/api/contacts"
        , body = Http.jsonBody (contactFormPayload cf)
        , expect = savedContactExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


updateContact : String -> String -> ContactForm -> (Result ApiError Contact -> msg) -> Cmd msg
updateContact token id cf toMsg =
    Http.request
        { method = "PUT"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ token)
            , Http.header "Content-Type" "application/json"
            ]
        , url = "/api/contacts/" ++ id
        , body = Http.jsonBody (contactFormPayload cf)
        , expect = savedContactExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


deleteContact : String -> String -> (Result String String -> msg) -> Cmd msg
deleteContact token id toMsg =
    Http.request
        { method = "DELETE"
        , headers = [ Http.header "Authorization" ("Bearer " ++ token) ]
        , url = "/api/contacts/" ++ id
        , body = Http.emptyBody
        , expect = deletedExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


fetchActivities : String -> String -> (Result String (List Activity) -> msg) -> Cmd msg
fetchActivities token contactId toMsg =
    Http.request
        { method = "GET"
        , headers = [ Http.header "Authorization" ("Bearer " ++ token) ]
        , url = "/api/contacts/" ++ contactId ++ "/activities"
        , body = Http.emptyBody
        , expect = activitiesExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


createActivity : String -> String -> ActivityForm -> (Result ApiError Activity -> msg) -> Cmd msg
createActivity token contactId af toMsg =
    Http.request
        { method = "POST"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ token)
            , Http.header "Content-Type" "application/json"
            ]
        , url = "/api/contacts/" ++ contactId ++ "/activities"
        , body = Http.jsonBody (activityFormPayload af)
        , expect = savedActivityExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


deleteActivity : String -> String -> (Result String String -> msg) -> Cmd msg
deleteActivity token id toMsg =
    Http.request
        { method = "DELETE"
        , headers = [ Http.header "Authorization" ("Bearer " ++ token) ]
        , url = "/api/activities/" ++ id
        , body = Http.emptyBody
        , expect = deletedActivityExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


fetchDeals : String -> String -> Int -> Int -> (Result String ( List Deal, Int ) -> msg) -> Cmd msg
fetchDeals token query limit offset toMsg =
    let
        qs =
            String.join "&"
                [ "q=" ++ Url.percentEncode query
                , "limit=" ++ String.fromInt limit
                , "offset=" ++ String.fromInt offset
                ]
    in
    Http.request
        { method = "GET"
        , headers = [ Http.header "Authorization" ("Bearer " ++ token) ]
        , url = "/api/deals?" ++ qs
        , body = Http.emptyBody
        , expect = dealsPageExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


createDeal : String -> DealForm -> (Result ApiError Deal -> msg) -> Cmd msg
createDeal token df toMsg =
    Http.request
        { method = "POST"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ token)
            , Http.header "Content-Type" "application/json"
            ]
        , url = "/api/deals"
        , body = Http.jsonBody (dealFormPayload df)
        , expect = savedDealExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


updateDeal : String -> String -> DealForm -> (Result ApiError Deal -> msg) -> Cmd msg
updateDeal token id df toMsg =
    Http.request
        { method = "PUT"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ token)
            , Http.header "Content-Type" "application/json"
            ]
        , url = "/api/deals/" ++ id
        , body = Http.jsonBody (dealFormPayload df)
        , expect = savedDealExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


updateDealStage : String -> String -> String -> (Result ApiError Deal -> msg) -> Cmd msg
updateDealStage token id newStage toMsg =
    Http.request
        { method = "PATCH"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ token)
            , Http.header "Content-Type" "application/json"
            ]
        , url = "/api/deals/" ++ id ++ "/stage"
        , body = Http.jsonBody (E.object [ ( "stage", E.string newStage ) ])
        , expect = savedDealExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


deleteDeal : String -> String -> (Result String String -> msg) -> Cmd msg
deleteDeal token id toMsg =
    Http.request
        { method = "DELETE"
        , headers = [ Http.header "Authorization" ("Bearer " ++ token) ]
        , url = "/api/deals/" ++ id
        , body = Http.emptyBody
        , expect = deletedDealExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


updateMe : String -> String -> String -> (Result ApiError ProfileUpdateResponse -> msg) -> Cmd msg
updateMe token name email toMsg =
    Http.request
        { method = "PUT"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ token)
            , Http.header "Content-Type" "application/json"
            ]
        , url = "/api/me"
        , body =
            Http.jsonBody
                (E.object
                    [ ( "name", E.string name )
                    , ( "email", E.string email )
                    ]
                )
        , expect = profileUpdateExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


changePassword : String -> String -> String -> (Result String String -> msg) -> Cmd msg
changePassword token current next toMsg =
    Http.request
        { method = "POST"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ token)
            , Http.header "Content-Type" "application/json"
            ]
        , url = "/api/me/password"
        , body =
            Http.jsonBody
                (E.object
                    [ ( "currentPassword", E.string current )
                    , ( "newPassword", E.string next )
                    ]
                )
        , expect = statusExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


logoutAll : String -> (Result String String -> msg) -> Cmd msg
logoutAll token toMsg =
    Http.request
        { method = "POST"
        , headers = [ Http.header "Authorization" ("Bearer " ++ token) ]
        , url = "/api/me/logout-all"
        , body = Http.emptyBody
        , expect = statusExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


contactsPageExpect : (Result String ( List Contact, Int ) -> msg) -> Http.Expect msg
contactsPageExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err ("Bad URL: " ++ url)

                Http.Timeout_ ->
                    Err "Request timed out."

                Http.NetworkError_ ->
                    Err "Network error."

                Http.BadStatus_ _ body ->
                    case D.decodeString errorDecoder body of
                        Ok msg ->
                            Err msg

                        Err _ ->
                            Err "Could not load contacts."

                Http.GoodStatus_ _ body ->
                    case
                        D.decodeString
                            (D.map2 Tuple.pair
                                (D.field "contacts" (D.list contactDecoder))
                                (D.oneOf [ D.field "total" D.int, D.succeed 0 ])
                            )
                            body
                    of
                        Ok pair ->
                            Ok pair

                        Err err ->
                            Err ("Could not parse contacts: " ++ D.errorToString err)


dealsPageExpect : (Result String ( List Deal, Int ) -> msg) -> Http.Expect msg
dealsPageExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err ("Bad URL: " ++ url)

                Http.Timeout_ ->
                    Err "Request timed out."

                Http.NetworkError_ ->
                    Err "Network error."

                Http.BadStatus_ metadata body ->
                    case D.decodeString errorDecoder body of
                        Ok msg ->
                            Err msg

                        Err _ ->
                            Err ("Could not load deals (HTTP " ++ String.fromInt metadata.statusCode ++ ").")

                Http.GoodStatus_ _ body ->
                    case
                        D.decodeString
                            (D.map2 Tuple.pair
                                (D.field "deals" (D.list dealDecoder))
                                (D.oneOf [ D.field "total" D.int, D.succeed 0 ])
                            )
                            body
                    of
                        Ok pair ->
                            Ok pair

                        Err err ->
                            Err ("Could not parse deals: " ++ D.errorToString err)


taskDecoder : D.Decoder Task
taskDecoder =
    D.map Task (D.field "id" D.string)
        |> andMap (D.field "title" D.string)
        |> andMap (optString "description")
        |> andMap (D.oneOf [ D.field "status" D.string, D.succeed "todo" ])
        |> andMap (optString "dueDate")
        |> andMap (optString "contactId")
        |> andMap (optString "contactName")
        |> andMap (optString "owner")
        |> andMap (optString "createdAt")


taskFormPayload : TaskForm -> E.Value
taskFormPayload tf =
    E.object
        [ ( "title", E.string tf.title )
        , ( "description", E.string tf.description )
        , ( "status", E.string tf.status )
        , ( "dueDate", E.string tf.dueDate )
        , ( "contactId", E.string tf.contactId )
        , ( "owner", E.string tf.owner )
        ]


tasksPageExpect : (Result String ( List Task, Int ) -> msg) -> Http.Expect msg
tasksPageExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err ("Bad URL: " ++ url)

                Http.Timeout_ ->
                    Err "Request timed out."

                Http.NetworkError_ ->
                    Err "Network error."

                Http.BadStatus_ metadata body ->
                    case D.decodeString errorDecoder body of
                        Ok msg ->
                            Err msg

                        Err _ ->
                            Err ("Could not load tasks (HTTP " ++ String.fromInt metadata.statusCode ++ ").")

                Http.GoodStatus_ _ body ->
                    case
                        D.decodeString
                            (D.map2 Tuple.pair
                                (D.field "tasks" (D.list taskDecoder))
                                (D.oneOf [ D.field "total" D.int, D.succeed 0 ])
                            )
                            body
                    of
                        Ok pair ->
                            Ok pair

                        Err err ->
                            Err ("Could not parse tasks: " ++ D.errorToString err)


savedTaskExpect : (Result ApiError Task -> msg) -> Http.Expect msg
savedTaskExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err (GenericError ("Bad URL: " ++ url))

                Http.Timeout_ ->
                    Err (GenericError "Request timed out.")

                Http.NetworkError_ ->
                    Err (GenericError "Network error.")

                Http.BadStatus_ _ body ->
                    case D.decodeString fieldErrorDecoder body of
                        Ok fields ->
                            Err (FieldErrors fields)

                        Err _ ->
                            case D.decodeString errorDecoder body of
                                Ok msg ->
                                    Err (GenericError msg)

                                Err _ ->
                                    Err (GenericError "Could not save task.")

                Http.GoodStatus_ _ body ->
                    case D.decodeString (D.field "task" taskDecoder) body of
                        Ok task ->
                            Ok task

                        Err err ->
                            Err (GenericError ("Could not parse response: " ++ D.errorToString err))


deletedTaskExpect : (Result String String -> msg) -> Http.Expect msg
deletedTaskExpect toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err ("Bad URL: " ++ url)

                Http.Timeout_ ->
                    Err "Request timed out."

                Http.NetworkError_ ->
                    Err "Network error."

                Http.BadStatus_ _ body ->
                    case D.decodeString errorDecoder body of
                        Ok msg ->
                            Err msg

                        Err _ ->
                            Err "Could not delete task."

                Http.GoodStatus_ _ body ->
                    case D.decodeString (D.field "deleted" D.string) body of
                        Ok id ->
                            Ok id

                        Err err ->
                            Err ("Could not parse response: " ++ D.errorToString err)


fetchTasks : String -> String -> String -> (Result String ( List Task, Int ) -> msg) -> Cmd msg
fetchTasks token query statusFilter toMsg =
    let
        parts =
            List.filter (\part -> not (String.isEmpty part))
                [ "q=" ++ Url.percentEncode query
                , if String.isEmpty statusFilter then
                    ""

                  else
                    "status=" ++ Url.percentEncode statusFilter
                ]
    in
    Http.request
        { method = "GET"
        , headers = [ Http.header "Authorization" ("Bearer " ++ token) ]
        , url = "/api/tasks?" ++ String.join "&" parts
        , body = Http.emptyBody
        , expect = tasksPageExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


createTask : String -> TaskForm -> (Result ApiError Task -> msg) -> Cmd msg
createTask token tf toMsg =
    Http.request
        { method = "POST"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ token)
            , Http.header "Content-Type" "application/json"
            ]
        , url = "/api/tasks"
        , body = Http.jsonBody (taskFormPayload tf)
        , expect = savedTaskExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


updateTask : String -> String -> TaskForm -> (Result ApiError Task -> msg) -> Cmd msg
updateTask token id tf toMsg =
    Http.request
        { method = "PUT"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ token)
            , Http.header "Content-Type" "application/json"
            ]
        , url = "/api/tasks/" ++ id
        , body = Http.jsonBody (taskFormPayload tf)
        , expect = savedTaskExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


updateTaskStatus : String -> String -> String -> (Result ApiError Task -> msg) -> Cmd msg
updateTaskStatus token id newStatus toMsg =
    Http.request
        { method = "PATCH"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ token)
            , Http.header "Content-Type" "application/json"
            ]
        , url = "/api/tasks/" ++ id ++ "/status"
        , body = Http.jsonBody (E.object [ ( "status", E.string newStatus ) ])
        , expect = savedTaskExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }


deleteTask : String -> String -> (Result String String -> msg) -> Cmd msg
deleteTask token id toMsg =
    Http.request
        { method = "DELETE"
        , headers = [ Http.header "Authorization" ("Bearer " ++ token) ]
        , url = "/api/tasks/" ++ id
        , body = Http.emptyBody
        , expect = deletedTaskExpect toMsg
        , timeout = Nothing
        , tracker = Nothing
        }
