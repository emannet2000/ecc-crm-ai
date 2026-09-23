port module Server exposing (main)

import Dict exposing (Dict)
import Json.Decode as D
import Json.Encode as E


-- ============================================================
-- PORTS
-- ============================================================

port request : (E.Value -> msg) -> Sub msg
port response : E.Value -> Cmd msg
port cryptoRequest : E.Value -> Cmd msg
port cryptoResponse : (E.Value -> msg) -> Sub msg


-- ============================================================
-- TYPES
-- ============================================================

type Method
    = Get
    | Post
    | Put
    | Delete
    | Options


type Status
    = OK
    | Created
    | NoContent
    | BadRequest
    | Unauthorized
    | NotFound
    | Conflict
    | InternalError


statusCode : Status -> Int
statusCode s =
    case s of
        OK ->
            200

        Created ->
            201

        NoContent ->
            204

        BadRequest ->
            400

        Unauthorized ->
            401

        NotFound ->
            404

        Conflict ->
            409

        InternalError ->
            500


type alias Contact =
    { id : String
    , name : String
    , email : String
    , company : String
    , title : String
    , phone : String
    , location : String
    , stage : String
    , lastContact : String
    , owner : String
    , tags : List String
    , notes : String
    , createdAt : String
    }


type alias Request =
    { responseHandler : E.Value
    , method : Method
    , path : String
    , query : String
    , body : String
    , headers : List ( String, String )
    }


type PendingKind
    = LoginPending
    | RegisterPending
    | VerifyPending


type alias PendingEntry =
    { request : Request
    , kind : PendingKind
    }


type alias Model =
    { contacts : List Contact
    , pending : Dict String PendingEntry
    , counter : Int
    }


-- ============================================================
-- INIT
-- ============================================================

init : () -> ( Model, Cmd Msg )
init _ =
    ( { contacts = seedContacts
      , pending = Dict.empty
      , counter = 1
      }
    , Cmd.none
    )


seedContacts : List Contact
seedContacts =
    [ { id = "c_1", name = "Ada Lovelace", email = "ada@analytical.io"
      , company = "Analytical Engines", title = "Chief Scientist"
      , phone = "+44 20 7946 0958", location = "London, UK"
      , stage = "Customer", lastContact = "2026-09-08", owner = "Demo User"
      , tags = [ "VIP", "Technical", "Q4-target" ]
      , notes = "Met at Q3 conference. Decision maker for technical purchases."
      , createdAt = "2026-01-15"
      }
    , { id = "c_2", name = "Grace Hopper", email = "grace@navy.mil"
      , company = "US Navy", title = "Rear Admiral"
      , phone = "+1 202 555 0142", location = "Washington, DC"
      , stage = "Customer", lastContact = "2026-09-05", owner = "Demo User"
      , tags = [ "VIP", "Government" ]
      , notes = "Long-time customer. Renewed for 3 years."
      , createdAt = "2025-06-02"
      }
    , { id = "c_3", name = "Alan Turing", email = "alan@bletchley.uk"
      , company = "Bletchley Park", title = "Research Lead"
      , phone = "+44 1908 640404", location = "Milton Keynes, UK"
      , stage = "Qualified", lastContact = "2026-09-01", owner = "Demo User"
      , tags = [ "Technical", "Research" ]
      , notes = "Evaluating our cryptography features."
      , createdAt = "2026-08-12"
      }
    , { id = "c_4", name = "Katherine Johnson", email = "kj@nasa.gov"
      , company = "NASA", title = "Research Mathematician"
      , phone = "+1 281 483 0121", location = "Houston, TX"
      , stage = "Proposal", lastContact = "2026-08-28", owner = "Demo User"
      , tags = [ "Aerospace", "Q4-target" ]
      , notes = "Proposal v2 sent. Waiting on procurement review."
      , createdAt = "2026-07-01"
      }
    , { id = "c_5", name = "Linus Torvalds", email = "linus@kernel.org"
      , company = "Linux Foundation", title = "Principal Engineer"
      , phone = "+1 415 555 0198", location = "Portland, OR"
      , stage = "Lead", lastContact = "2026-08-22", owner = "Demo User"
      , tags = [ "Open Source" ]
      , notes = "Inbound from conference talk."
      , createdAt = "2026-08-22"
      }
    , { id = "c_6", name = "Margaret Hamilton", email = "mh@mit.edu"
      , company = "MIT", title = "Professor"
      , phone = "+1 617 253 1000", location = "Cambridge, MA"
      , stage = "Customer", lastContact = "2026-09-09", owner = "Demo User"
      , tags = [ "Academic", "VIP" ]
      , notes = "Champion for the department-wide rollout."
      , createdAt = "2025-11-20"
      }
    , { id = "c_7", name = "Donald Knuth", email = "knuth@stanford.edu"
      , company = "Stanford", title = "Professor Emeritus"
      , phone = "+1 650 723 2300", location = "Stanford, CA"
      , stage = "Qualified", lastContact = "2026-08-30", owner = "Demo User"
      , tags = [ "Academic" ]
      , notes = ""
      , createdAt = "2026-08-25"
      }
    , { id = "c_8", name = "Barbara Liskov", email = "liskov@mit.edu"
      , company = "MIT", title = "Institute Professor"
      , phone = "+1 617 253 1000", location = "Cambridge, MA"
      , stage = "Proposal", lastContact = "2026-08-25", owner = "Demo User"
      , tags = [ "Academic", "Technical" ]
      , notes = "Interested in the API integrations story."
      , createdAt = "2026-06-14"
      }
    ]


-- ============================================================
-- MAIN
-- ============================================================

main : Program () Model Msg
main =
    Platform.worker
        { init = init
        , update = update
        , subscriptions =
            \_ ->
                Sub.batch
                    [ request GotRequest
                    , cryptoResponse GotCryptoResponse
                    ]
        }


type Msg
    = GotRequest E.Value
    | GotCryptoResponse E.Value


-- ============================================================
-- DECODERS
-- ============================================================

methodDecoder : D.Decoder Method
methodDecoder =
    D.string
        |> D.andThen
            (\s ->
                case s of
                    "GET" ->
                        D.succeed Get

                    "POST" ->
                        D.succeed Post

                    "PUT" ->
                        D.succeed Put

                    "DELETE" ->
                        D.succeed Delete

                    "OPTIONS" ->
                        D.succeed Options

                    _ ->
                        D.fail ("Unknown method: " ++ s)
            )


requestDecoder : D.Decoder Request
requestDecoder =
    D.map6 Request
        (D.field "responseHandler" D.value)
        (D.field "method" methodDecoder)
        (D.field "path" D.string)
        (D.field "query" D.string)
        (D.field "body" D.string)
        (D.field "headers" (D.keyValuePairs D.string))


-- Elm's Json.Decode only goes up to map8. Split 13 fields
-- into two sub-decoders and combine with map2.
type alias ContactHead =
    { id : String
    , name : String
    , email : String
    , company : String
    , title : String
    , phone : String
    , location : String
    , stage : String
    }


type alias ContactTail =
    { lastContact : String
    , owner : String
    , tags : List String
    , notes : String
    , createdAt : String
    }


contactHeadDecoder : D.Decoder ContactHead
contactHeadDecoder =
    D.map8 ContactHead
        (D.oneOf [ D.field "id" D.string, D.succeed "" ])
        (D.field "name" D.string)
        (D.field "email" D.string)
        (D.oneOf [ D.field "company" D.string, D.succeed "" ])
        (D.oneOf [ D.field "title" D.string, D.succeed "" ])
        (D.oneOf [ D.field "phone" D.string, D.succeed "" ])
        (D.oneOf [ D.field "location" D.string, D.succeed "" ])
        (D.oneOf [ D.field "stage" D.string, D.succeed "Lead" ])


contactTailDecoder : D.Decoder ContactTail
contactTailDecoder =
    D.map5 ContactTail
        (D.oneOf [ D.field "lastContact" D.string, D.succeed "" ])
        (D.oneOf [ D.field "owner" D.string, D.succeed "Demo User" ])
        (D.oneOf [ D.field "tags" (D.list D.string), D.succeed [] ])
        (D.oneOf [ D.field "notes" D.string, D.succeed "" ])
        (D.oneOf [ D.field "createdAt" D.string, D.succeed "" ])


contactDecoder : D.Decoder Contact
contactDecoder =
    D.map2
        (\head tail ->
            { id = head.id
            , name = head.name
            , email = head.email
            , company = head.company
            , title = head.title
            , phone = head.phone
            , location = head.location
            , stage = head.stage
            , lastContact = tail.lastContact
            , owner = tail.owner
            , tags = tail.tags
            , notes = tail.notes
            , createdAt = tail.createdAt
            }
        )
        contactHeadDecoder
        contactTailDecoder


cryptoResponseDecoder :
    D.Decoder
        { id : String
        , ok : Bool
        , token : D.Value
        , user : D.Value
        , error : D.Value
        }
cryptoResponseDecoder =
    D.map5
        (\i o t u e ->
            { id = i, ok = o, token = t, user = u, error = e }
        )
        (D.field "id" D.string)
        (D.field "ok" D.bool)
        (D.oneOf [ D.field "token" D.value, D.succeed E.null ])
        (D.oneOf [ D.field "user" D.value, D.succeed E.null ])
        (D.oneOf
            [ D.field "error" D.string |> D.map E.string
            , D.succeed E.null
            ]
        )


-- ============================================================
-- ENCODERS
-- ============================================================

contactEncoder : Contact -> E.Value
contactEncoder c =
    E.object
        [ ( "id", E.string c.id )
        , ( "name", E.string c.name )
        , ( "email", E.string c.email )
        , ( "company", E.string c.company )
        , ( "title", E.string c.title )
        , ( "phone", E.string c.phone )
        , ( "location", E.string c.location )
        , ( "stage", E.string c.stage )
        , ( "lastContact", E.string c.lastContact )
        , ( "owner", E.string c.owner )
        , ( "tags", E.list E.string c.tags )
        , ( "notes", E.string c.notes )
        , ( "createdAt", E.string c.createdAt )
        ]


jsonResponse : Request -> Status -> E.Value -> Cmd Msg
jsonResponse req status payload =
    response <|
        E.object
            [ ( "responseHandler", req.responseHandler )
            , ( "status", E.int (statusCode status) )
            , ( "contentType", E.string "application/json" )
            , ( "body", E.string (E.encode 0 payload) )
            ]


errorResponse : Request -> Status -> String -> Cmd Msg
errorResponse req status msg =
    jsonResponse req status (E.object [ ( "error", E.string msg ) ])


-- ============================================================
-- ROUTING
-- ============================================================

route : Request -> Model -> ( Model, Cmd Msg )
route req model =
    case ( req.method, req.path ) of
        ( Post, "/api/login" ) ->
            loginHandler req model

        ( Post, "/api/register" ) ->
            registerHandler req model

        ( Get, "/api/me" ) ->
            meHandler req model

        ( Get, "/api/contacts" ) ->
            ( model, listContacts req model )

        ( Post, "/api/contacts" ) ->
            createContact req model

        _ ->
            case ( req.method, String.split "/" req.path ) of
                ( Get, [ "", "api", "contacts", id ] ) ->
                    ( model, getContact req model id )

                ( Put, [ "", "api", "contacts", id ] ) ->
                    updateContact req model id

                ( Delete, [ "", "api", "contacts", id ] ) ->
                    deleteContact req model id

                _ ->
                    ( model, errorResponse req NotFound "Not found" )


-- ============================================================
-- AUTH HANDLERS
-- ============================================================

loginHandler : Request -> Model -> ( Model, Cmd Msg )
loginHandler req model =
    let
        decoded =
            D.decodeString
                (D.map2 Tuple.pair
                    (D.field "email" D.string)
                    (D.field "password" D.string)
                )
                req.body
    in
    case decoded of
        Err _ ->
            ( model, errorResponse req BadRequest "Invalid JSON" )

        Ok ( email, password ) ->
            let
                cryptoId =
                    "crypto-" ++ String.fromInt model.counter
            in
            ( { model
                | counter = model.counter + 1
                , pending =
                    Dict.insert cryptoId
                        { request = req, kind = LoginPending }
                        model.pending
              }
            , cryptoRequest <|
                E.object
                    [ ( "id", E.string cryptoId )
                    , ( "op", E.string "login" )
                    , ( "email", E.string email )
                    , ( "password", E.string password )
                    ]
            )


registerHandler : Request -> Model -> ( Model, Cmd Msg )
registerHandler req model =
    let
        decoded =
            D.decodeString
                (D.map3 (\a b c -> ( a, b, c ))
                    (D.field "name" D.string)
                    (D.field "email" D.string)
                    (D.field "password" D.string)
                )
                req.body
    in
    case decoded of
        Err _ ->
            ( model, errorResponse req BadRequest "Invalid JSON" )

        Ok ( name, email, password ) ->
            let
                cryptoId =
                    "crypto-" ++ String.fromInt model.counter
            in
            ( { model
                | counter = model.counter + 1
                , pending =
                    Dict.insert cryptoId
                        { request = req, kind = RegisterPending }
                        model.pending
              }
            , cryptoRequest <|
                E.object
                    [ ( "id", E.string cryptoId )
                    , ( "op", E.string "register" )
                    , ( "name", E.string name )
                    , ( "email", E.string email )
                    , ( "password", E.string password )
                    ]
            )


meHandler : Request -> Model -> ( Model, Cmd Msg )
meHandler req model =
    let
        token =
            req.headers
                |> List.filter (\( k, _ ) -> String.toLower k == "authorization")
                |> List.head
                |> Maybe.map Tuple.second
                |> Maybe.map (String.replace "Bearer " "")
    in
    case token of
        Nothing ->
            ( model, errorResponse req Unauthorized "Missing authorization header" )

        Just t ->
            let
                cryptoId =
                    "crypto-" ++ String.fromInt model.counter
            in
            ( { model
                | counter = model.counter + 1
                , pending =
                    Dict.insert cryptoId
                        { request = req, kind = VerifyPending }
                        model.pending
              }
            , cryptoRequest <|
                E.object
                    [ ( "id", E.string cryptoId )
                    , ( "op", E.string "verify" )
                    , ( "token", E.string t )
                    ]
            )


-- ============================================================
-- CONTACT HANDLERS
-- ============================================================

listContacts : Request -> Model -> Cmd Msg
listContacts req model =
    let
        q =
            req.query
                |> String.split "&"
                |> List.filterMap
                    (\pair ->
                        case String.split "=" pair of
                            [ "q", val ] ->
                                Just (String.toLower (String.replace "%20" " " val))

                            _ ->
                                Nothing
                    )
                |> List.head
                |> Maybe.withDefault ""

        filtered =
            if String.isEmpty q then
                model.contacts

            else
                List.filter
                    (\c ->
                        String.contains q (String.toLower c.name)
                            || String.contains q (String.toLower c.email)
                            || String.contains q (String.toLower c.company)
                    )
                    model.contacts
    in
    jsonResponse req OK <|
        E.object
            [ ( "contacts", E.list contactEncoder filtered )
            , ( "total", E.int (List.length filtered) )
            ]


getContact : Request -> Model -> String -> Cmd Msg
getContact req model id =
    case List.filter (\c -> c.id == id) model.contacts of
        [ c ] ->
            jsonResponse req OK (E.object [ ( "contact", contactEncoder c ) ])

        _ ->
            errorResponse req NotFound "Contact not found"


createContact : Request -> Model -> ( Model, Cmd Msg )
createContact req model =
    case D.decodeString contactDecoder req.body of
        Err _ ->
            ( model, errorResponse req BadRequest "Invalid contact data" )

        Ok partial ->
            let
                newId =
                    "c_" ++ String.fromInt model.counter

                newContact =
                    { partial
                        | id = newId
                        , lastContact = "2026-09-14"
                        , createdAt = "2026-09-14"
                    }

                newModel =
                    { model
                        | counter = model.counter + 1
                        , contacts = model.contacts ++ [ newContact ]
                    }
            in
            ( newModel
            , jsonResponse req Created
                (E.object [ ( "contact", contactEncoder newContact ) ])
            )


updateContact : Request -> Model -> String -> ( Model, Cmd Msg )
updateContact req model id =
    case List.filter (\c -> c.id == id) model.contacts of
        [] ->
            ( model, errorResponse req NotFound "Contact not found" )

        existing :: _ ->
            case D.decodeString contactDecoder req.body of
                Err _ ->
                    ( model, errorResponse req BadRequest "Invalid contact data" )

                Ok updated ->
                    let
                        final =
                            { updated
                                | id = id
                                , createdAt = existing.createdAt
                            }

                        newContacts =
                            List.map
                                (\c ->
                                    if c.id == id then
                                        final

                                    else
                                        c
                                )
                                model.contacts
                    in
                    ( { model | contacts = newContacts }
                    , jsonResponse req OK
                        (E.object [ ( "contact", contactEncoder final ) ])
                    )


deleteContact : Request -> Model -> String -> ( Model, Cmd Msg )
deleteContact req model id =
    let
        filtered =
            List.filter (\c -> c.id /= id) model.contacts
    in
    ( { model | contacts = filtered }
    , jsonResponse req OK
        (E.object [ ( "deleted", E.string id ) ])
    )


-- ============================================================
-- UPDATE
-- ============================================================

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotRequest raw ->
            case D.decodeValue requestDecoder raw of
                Err _ ->
                    ( model, Cmd.none )

                Ok req ->
                    route req model

        GotCryptoResponse raw ->
            case D.decodeValue cryptoResponseDecoder raw of
                Err _ ->
                    ( model, Cmd.none )

                Ok resp ->
                    case Dict.get resp.id model.pending of
                        Nothing ->
                            ( model, Cmd.none )

                        Just entry ->
                            let
                                newPending =
                                    Dict.remove resp.id model.pending
                            in
                            handleCryptoResult model newPending entry resp


handleCryptoResult :
    Model
    -> Dict String PendingEntry
    -> PendingEntry
    ->
        { id : String
        , ok : Bool
        , token : D.Value
        , user : D.Value
        , error : D.Value
        }
    -> ( Model, Cmd Msg )
handleCryptoResult model newPending entry resp =
    let
        req =
            entry.request

        newModel =
            { model | pending = newPending }
    in
    if not resp.ok then
        let
            errMsg =
                D.decodeValue D.string resp.error
                    |> Result.withDefault "Authentication failed"
        in
        ( newModel, errorResponse req Unauthorized errMsg )

    else
        case entry.kind of
            LoginPending ->
                ( newModel
                , jsonResponse req OK <|
                    E.object
                        [ ( "token", resp.token )
                        , ( "user", resp.user )
                        ]
                )

            RegisterPending ->
                ( newModel
                , jsonResponse req OK <|
                    E.object
                        [ ( "token", resp.token )
                        , ( "user", resp.user )
                        ]
                )

            VerifyPending ->
                ( newModel
                , jsonResponse req OK <|
                    E.object [ ( "user", resp.user ) ]
                )
