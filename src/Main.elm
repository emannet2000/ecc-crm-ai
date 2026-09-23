port module Main exposing (main)

import Api
import Browser
import Browser.Events
import Browser.Navigation as Nav
import Json.Decode as D
import Time
import Types exposing (..)
import Url
import Url.Parser as Parser exposing ((</>), oneOf, s, string)
import Views


port storeToken : Maybe String -> Cmd msg


type alias Flags =
    { token : Maybe String }


pageSize : Int
pageSize =
    25


routeParser : Parser.Parser (Route -> a) a
routeParser =
    oneOf
        [ Parser.map Home Parser.top
        , Parser.map Contacts (s "contacts")
        , Parser.map ContactDetail (s "contacts" </> string)
        , Parser.map Deals (s "deals")
        , Parser.map DealDetail (s "deals" </> string)
        , Parser.map Tasks (s "tasks")
        , Parser.map Reports (s "reports")
        , Parser.map Settings (s "settings")
        ]


parseRoute : Url.Url -> Route
parseRoute url =
    Maybe.withDefault Home (Parser.parse routeParser url)


routeToPath : Route -> String
routeToPath route =
    case route of
        Home ->
            "/"

        Contacts ->
            "/contacts"

        ContactDetail id ->
            "/contacts/" ++ id

        Deals ->
            "/deals"

        DealDetail id ->
            "/deals/" ++ id

        Tasks ->
            "/tasks"

        Reports ->
            "/reports"

        Settings ->
            "/settings"


init : Flags -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
    let
        route =
            parseRoute url

        model =
            { mode = Login
            , form = emptyForm
            , errors = []
            , alert = Nothing
            , submitting = False
            , token = flags.token
            , user = Nothing
            , showPassword = False
            , bootstrapping = flags.token /= Nothing
            , route = route
            , contacts = NotAsked
            , viewingContact = Nothing
            , contactForm = Nothing
            , editingId = Nothing
            , deletingContact = Nothing
            , toast = Nothing
            , deals = NotAsked
            , viewingDeal = Nothing
            , dealForm = Nothing
            , editingDealId = Nothing
            , deletingDeal = Nothing
            , movingDealId = Nothing
            , activities = NotAsked
            , activityForm = Nothing
            , deletingActivity = Nothing
            , tasks = NotAsked
            , taskForm = Nothing
            , editingTaskId = Nothing
            , deletingTask = Nothing
            , pendingContactsQuery = Nothing
            , pendingDealsQuery = Nothing
            , pendingTasksQuery = Nothing
            , profileForm = emptyProfileForm
            , passwordForm = emptyPasswordForm
            , logoutAllConfirm = False
            , navKey = key
            }
    in
    case flags.token of
        Just t ->
            ( model, Api.me t GotUser )

        Nothing ->
            ( model, Cmd.none )


validate : Form -> Mode -> List ( Field, String )
validate form mode =
    let
        nameErr =
            if mode == Register && String.isEmpty (String.trim form.name) then
                [ ( NameField, "Please enter your name." ) ]

            else
                []

        emailErr =
            if not (String.contains "@" form.email && String.contains "." form.email) then
                [ ( EmailField, "Please enter a valid email." ) ]

            else
                []

        passErr =
            if String.length form.password < 8 then
                [ ( PasswordField, "Password must be at least 8 characters." ) ]

            else
                []
    in
    nameErr ++ emailErr ++ passErr


contactsQueryOf : Model -> String
contactsQueryOf model =
    case model.contacts of
        Success d ->
            d.query

        _ ->
            ""


contactsOffsetOf : Model -> Int
contactsOffsetOf model =
    case model.contacts of
        Success d ->
            d.offset

        _ ->
            0


dealsQueryOf : Model -> String
dealsQueryOf model =
    case model.deals of
        Success d ->
            d.query

        _ ->
            ""


loadContacts : Model -> ( Model, Cmd Msg )
loadContacts model =
    case model.token of
        Just t ->
            ( { model | contacts = Loading }
            , Api.fetchContacts t (contactsQueryOf model) pageSize (contactsOffsetOf model) GotContacts
            )

        Nothing ->
            ( model, Cmd.none )


loadDeals : Model -> ( Model, Cmd Msg )
loadDeals model =
    case model.token of
        Just t ->
            ( { model | deals = Loading }
            , Api.fetchDeals t (dealsQueryOf model) pageSize 0 GotDeals
            )

        Nothing ->
            ( model, Cmd.none )


loadTasks : Model -> ( Model, Cmd Msg )
loadTasks model =
    case model.token of
        Just t ->
            let
                ( q, st ) =
                    case model.tasks of
                        Success d ->
                            ( d.query, d.statusFilter )

                        _ ->
                            ( "", "" )
            in
            ( { model | tasks = Loading }
            , Api.fetchTasks t q st GotTasks
            )

        Nothing ->
            ( model, Cmd.none )


loadActivities : Model -> String -> ( Model, Cmd Msg )
loadActivities model contactId =
    case model.token of
        Just t ->
            ( { model | activities = Loading }
            , Api.fetchActivities t contactId GotActivities
            )

        Nothing ->
            ( model, Cmd.none )


validateDealForm : DealForm -> ( DealForm, Bool )
validateDealForm df =
    let
        titleErr =
            if String.isEmpty (String.trim df.title) then
                [ ( "title", "Title is required." ) ]

            else
                []

        valueErr =
            case String.toFloat df.value of
                Just v ->
                    if v < 0 then
                        [ ( "value", "Value can't be negative." ) ]

                    else
                        []

                Nothing ->
                    if String.isEmpty (String.trim df.value) then
                        [ ( "value", "Deal value is required." ) ]

                    else
                        [ ( "value", "Enter a valid number." ) ]

        allErrors =
            titleErr ++ valueErr
    in
    ( { df | errors = allErrors }, List.isEmpty allErrors )


validateContactForm : ContactForm -> ( ContactForm, Bool )
validateContactForm cf =
    let
        nameErr =
            if String.isEmpty (String.trim cf.name) then
                [ ( "name", "Name is required." ) ]

            else
                []

        emailErr =
            if String.isEmpty (String.trim cf.email) then
                [ ( "email", "Email is required." ) ]

            else if not (String.contains "@" cf.email && String.contains "." cf.email) then
                [ ( "email", "Please enter a valid email." ) ]

            else
                []

        allErrors =
            nameErr ++ emailErr
    in
    ( { cf | errors = allErrors }, List.isEmpty allErrors )


validateActivityForm : ActivityForm -> ( ActivityForm, Bool )
validateActivityForm af =
    let
        kindErr =
            if List.member af.kind activityKinds then
                []

            else
                [ ( "kind", "Pick a kind." ) ]

        titleErr =
            if String.isEmpty (String.trim af.title) then
                [ ( "title", "Title is required." ) ]

            else
                []

        allErrors =
            kindErr ++ titleErr
    in
    ( { af | errors = allErrors }, List.isEmpty allErrors )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        EscapePressed ->
            if model.logoutAllConfirm then
                ( { model | logoutAllConfirm = False }, Cmd.none )

            else if model.activityForm /= Nothing || model.deletingActivity /= Nothing then
                update ClosedActivityForm model

            else if model.contactForm /= Nothing || model.deletingContact /= Nothing then
                update RequestedCloseContactForm model

            else if model.dealForm /= Nothing || model.deletingDeal /= Nothing then
                update RequestedCloseDealForm model

            else if model.taskForm /= Nothing || model.deletingTask /= Nothing then
                update RequestedCloseTaskForm model

            else
                ( model, Cmd.none )

        UpdatedField field value ->
            let
                current =
                    model.form

                newForm =
                    case field of
                        NameField ->
                            { current | name = value }

                        EmailField ->
                            { current | email = value }

                        PasswordField ->
                            { current | password = value }
            in
            ( { model
                | form = newForm
                , errors = List.filter (\( f, _ ) -> f /= field) model.errors
              }
            , Cmd.none
            )

        ToggledRemember value ->
            ( { model | form = (\f -> { f | remember = value }) model.form }
            , Cmd.none
            )

        ToggledShowPassword ->
            ( { model | showPassword = not model.showPassword }
            , Cmd.none
            )

        SwitchedMode newMode ->
            ( { model
                | mode = newMode
                , form = emptyForm
                , errors = []
                , alert = Nothing
              }
            , Cmd.none
            )

        Submitted ->
            let
                errs =
                    validate model.form model.mode
            in
            if not (List.isEmpty errs) then
                ( { model | errors = errs }, Cmd.none )

            else
                let
                    cmd =
                        case model.mode of
                            Login ->
                                Api.login model.form.email model.form.password GotAuth

                            Register ->
                                Api.register model.form.name model.form.email model.form.password GotAuth
                in
                ( { model
                    | submitting = True
                    , errors = []
                    , alert = Nothing
                  }
                , cmd
                )

        GotAuth result ->
            case result of
                Ok { token, user } ->
                    let
                        storeCmd =
                            if model.form.remember then
                                storeToken (Just token)

                            else
                                storeToken Nothing

                        modelWithAuth =
                            { model
                                | submitting = False
                                , token = Just token
                                , user = Just user
                                , route = Home
                                , contacts = NotAsked
                                , toast = Nothing
                                , alert =
                                    Just
                                        { kind = AlertSuccess
                                        , message = "Welcome, " ++ user.name ++ "!"
                                        }
                            }
                    in
                    ( modelWithAuth
                    , Cmd.batch
                        [ storeCmd
                        , Tuple.second (loadContacts modelWithAuth)
                        , Tuple.second (loadDeals modelWithAuth)
                        ]
                    )

                Err message ->
                    ( { model
                        | submitting = False
                        , alert = Just { kind = AlertError, message = message }
                      }
                    , Cmd.none
                    )

        GotUser result ->
            case result of
                Ok user ->
                    let
                        modelWithUser =
                            { model
                                | user = Just user
                                , bootstrapping = False
                            }
                    in
                    ( modelWithUser
                    , Cmd.batch
                        [ Tuple.second (loadContacts modelWithUser)
                        , Tuple.second (loadDeals modelWithUser)
                        ]
                    )

                Err _ ->
                    ( { model
                        | token = Nothing
                        , user = Nothing
                        , bootstrapping = False
                      }
                    , storeToken Nothing
                    )

        LoggedOut ->
            ( { model
                | token = Nothing
                , user = Nothing
                , form = emptyForm
                , mode = Login
                , route = Home
                , contacts = NotAsked
                , viewingContact = Nothing
                , contactForm = Nothing
                , editingId = Nothing
                , deletingContact = Nothing
                , alert = Nothing
                , toast = Nothing
                , bootstrapping = False
                , deals = NotAsked
                , viewingDeal = Nothing
                , dealForm = Nothing
                , editingDealId = Nothing
                , deletingDeal = Nothing
                , movingDealId = Nothing
                , activities = NotAsked
                , activityForm = Nothing
                , deletingActivity = Nothing
                , tasks = NotAsked
                , taskForm = Nothing
                , editingTaskId = Nothing
                , deletingTask = Nothing
                , pendingContactsQuery = Nothing
                , pendingDealsQuery = Nothing
                , pendingTasksQuery = Nothing
                , profileForm = emptyProfileForm
                , passwordForm = emptyPasswordForm
                , logoutAllConfirm = False
              }
            , storeToken Nothing
            )

        LinkClicked urlRequest ->
            case urlRequest of
                Browser.Internal url ->
                    ( model, Nav.pushUrl model.navKey (Url.toString url) )

                Browser.External href ->
                    ( model, Nav.load href )

        UrlChanged url ->
            update (NavigatedTo (parseRoute url)) model

        NavigatedTo route ->
            let
                seededProfile =
                    if route == Settings then
                        case model.user of
                            Just u ->
                                profileFromUser u

                            Nothing ->
                                emptyProfileForm

                    else
                        model.profileForm

                preservedContact =
                    case ( route, model.viewingContact ) of
                        ( ContactDetail id, Just c ) ->
                            if c.id == id then
                                Just c

                            else
                                Nothing

                        _ ->
                            Nothing

                preservedDeal =
                    case ( route, model.viewingDeal ) of
                        ( DealDetail id, Just d ) ->
                            if d.id == id then
                                Just d

                            else
                                Nothing

                        _ ->
                            Nothing

                clearedModel =
                    { model
                        | route = route
                        , contactForm = Nothing
                        , deletingContact = Nothing
                        , viewingContact = preservedContact
                        , dealForm = Nothing
                        , deletingDeal = Nothing
                        , viewingDeal = preservedDeal
                        , activityForm = Nothing
                        , deletingActivity = Nothing
                        , activities = NotAsked
                        , taskForm = Nothing
                        , deletingTask = Nothing
                        , profileForm = seededProfile
                        , passwordForm = emptyPasswordForm
                        , logoutAllConfirm = False
                    }

                needsContacts =
                    (route == Contacts || route == Home || route == Tasks)
                        && clearedModel.contacts
                        == NotAsked

                needsDeals =
                    (route == Deals || route == Home)
                        && clearedModel.deals
                        == NotAsked

                needsTasks =
                    route == Tasks && clearedModel.tasks == NotAsked

                contactsCmd =
                    if needsContacts then
                        Tuple.second (loadContacts clearedModel)

                    else
                        Cmd.none

                dealsCmd =
                    if needsDeals then
                        Tuple.second (loadDeals clearedModel)

                    else
                        Cmd.none

                tasksCmd =
                    if needsTasks then
                        Tuple.second (loadTasks clearedModel)

                    else
                        Cmd.none

                activityCmd =
                    case ( route, preservedContact ) of
                        ( ContactDetail _, Just c ) ->
                            Tuple.second (loadActivities clearedModel c.id)

                        _ ->
                            Cmd.none

                pushCmd =
                    if model.route == route then
                        Cmd.none

                    else
                        Nav.pushUrl model.navKey (routeToPath route)

                finalModel =
                    { clearedModel
                        | contacts =
                            if needsContacts then
                                Loading

                            else
                                clearedModel.contacts
                        , deals =
                            if needsDeals then
                                Loading

                            else
                                clearedModel.deals
                        , tasks =
                            if needsTasks then
                                Loading

                            else
                                clearedModel.tasks
                    }
            in
            ( finalModel, Cmd.batch [ pushCmd, contactsCmd, dealsCmd, tasksCmd, activityCmd ] )

        GotContacts result ->
            case result of
                Ok ( items, total ) ->
                    let
                        prev =
                            case model.contacts of
                                Success d ->
                                    d

                                _ ->
                                    { items = [], query = "", total = 0, offset = 0, limit = pageSize }
                    in
                    ( { model
                        | contacts =
                            Success
                                { items = items
                                , query = prev.query
                                , total = total
                                , offset = prev.offset
                                , limit = pageSize
                                }
                      }
                    , Cmd.none
                    )

                Err message ->
                    ( { model | contacts = Failure message }, Cmd.none )

        UpdatedContactsQuery q ->
            let
                nextContacts =
                    case model.contacts of
                        Success data ->
                            Success { data | query = q, offset = 0 }

                        _ ->
                            Success { items = [], query = q, total = 0, offset = 0, limit = pageSize }
            in
            ( { model | contacts = nextContacts, pendingContactsQuery = Just q }
            , Cmd.none
            )

        FlushContactsSearch ->
            case ( model.token, model.pendingContactsQuery ) of
                ( Just t, Just q ) ->
                    ( { model | pendingContactsQuery = Nothing, contacts = Loading }
                    , Api.fetchContacts t q pageSize 0 GotContacts
                    )

                _ ->
                    ( { model | pendingContactsQuery = Nothing }, Cmd.none )

        ContactsPageChanged newOffset ->
            case ( model.token, model.contacts ) of
                ( Just t, Success data ) ->
                    ( { model | contacts = Success { data | offset = newOffset } }
                    , Api.fetchContacts t data.query pageSize newOffset GotContacts
                    )

                _ ->
                    ( model, Cmd.none )

        OpenedContactDetail contact ->
            update (NavigatedTo (ContactDetail contact.id))
                { model | viewingContact = Just contact, toast = Nothing }

        OpenedAddContact ->
            ( { model
                | contactForm = Just emptyContactForm
                , editingId = Nothing
                , toast = Nothing
              }
            , Cmd.none
            )

        OpenedEditContact contact ->
            ( { model
                | contactForm = Just (contactToForm contact)
                , editingId = Just contact.id
                , toast = Nothing
              }
            , Cmd.none
            )

        RequestedCloseContactForm ->
            case ( model.contactForm, model.deletingContact ) of
                ( _, Just _ ) ->
                    ( { model | deletingContact = Nothing }, Cmd.none )

                ( Just cf, _ ) ->
                    if cf.dirty && not cf.submitting then
                        ( { model | contactForm = Just { cf | confirmDiscard = True } }
                        , Cmd.none
                        )

                    else
                        ( { model | contactForm = Nothing, editingId = Nothing }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        ConfirmedCloseContactForm ->
            ( { model | contactForm = Nothing, editingId = Nothing }, Cmd.none )

        CancelledCloseContactForm ->
            case model.contactForm of
                Just cf ->
                    ( { model | contactForm = Just { cf | confirmDiscard = False } }
                    , Cmd.none
                    )

                Nothing ->
                    ( model, Cmd.none )

        UpdatedContactFormField field value ->
            case model.contactForm of
                Just cf ->
                    let
                        updated =
                            case field of
                                "name" ->
                                    { cf | name = value }

                                "email" ->
                                    { cf | email = value }

                                "company" ->
                                    { cf | company = value }

                                "title" ->
                                    { cf | title = value }

                                "phone" ->
                                    { cf | phone = value }

                                "location" ->
                                    { cf | location = value }

                                "stage" ->
                                    { cf | stage = value }

                                "tagInput" ->
                                    { cf | tagInput = value }

                                "notes" ->
                                    { cf | notes = value }

                                _ ->
                                    cf
                    in
                    ( { model
                        | contactForm =
                            Just
                                { updated
                                    | dirty = True
                                    , errors =
                                        List.filter (\( f, _ ) -> f /= field) updated.errors
                                }
                      }
                    , Cmd.none
                    )

                Nothing ->
                    ( model, Cmd.none )

        AddedContactTag ->
            case model.contactForm of
                Just cf ->
                    let
                        tag =
                            String.trim cf.tagInput
                    in
                    if String.isEmpty tag || List.member tag cf.tags then
                        ( { model | contactForm = Just { cf | tagInput = "" } }, Cmd.none )

                    else
                        ( { model
                            | contactForm =
                                Just
                                    { cf
                                        | tags = cf.tags ++ [ tag ]
                                        , tagInput = ""
                                        , dirty = True
                                    }
                          }
                        , Cmd.none
                        )

                Nothing ->
                    ( model, Cmd.none )

        RemovedContactTag tag ->
            case model.contactForm of
                Just cf ->
                    ( { model
                        | contactForm =
                            Just
                                { cf
                                    | tags = List.filter (\t -> t /= tag) cf.tags
                                    , dirty = True
                                }
                      }
                    , Cmd.none
                    )

                Nothing ->
                    ( model, Cmd.none )

        SubmittedContactForm ->
            case ( model.contactForm, model.token ) of
                ( Just cf, Just token ) ->
                    let
                        ( validated, ok ) =
                            validateContactForm cf
                    in
                    if not ok then
                        ( { model | contactForm = Just validated }, Cmd.none )

                    else
                        let
                            cmd =
                                case model.editingId of
                                    Just id ->
                                        Api.updateContact token id validated GotSavedContact

                                    Nothing ->
                                        Api.createContact token validated GotSavedContact
                        in
                        ( { model
                            | contactForm = Just { validated | submitting = True }
                          }
                        , cmd
                        )

                _ ->
                    ( model, Cmd.none )

        GotSavedContact result ->
            let
                wasEdit =
                    model.editingId /= Nothing

                verb =
                    if wasEdit then
                        "Updated "

                    else
                        "Added "
            in
            case result of
                Ok contact ->
                    let
                        freshModel =
                            { model
                                | contactForm = Nothing
                                , editingId = Nothing
                                , viewingContact =
                                    case model.route of
                                        ContactDetail _ ->
                                            Just contact

                                        _ ->
                                            model.viewingContact
                                , toast = Just (verb ++ contact.name)
                            }
                    in
                    ( freshModel, Tuple.second (loadContacts freshModel) )

                Err (FieldErrors fields) ->
                    case model.contactForm of
                        Just cf ->
                            ( { model
                                | contactForm =
                                    Just
                                        { cf
                                            | submitting = False
                                            , errors = fields
                                        }
                              }
                            , Cmd.none
                            )

                        Nothing ->
                            ( model, Cmd.none )

                Err (GenericError message) ->
                    case model.contactForm of
                        Just cf ->
                            ( { model
                                | contactForm =
                                    Just
                                        { cf
                                            | submitting = False
                                            , errors = [ ( "form", message ) ]
                                        }
                              }
                            , Cmd.none
                            )

                        Nothing ->
                            ( model, Cmd.none )

        RequestedDeleteContact contact ->
            ( { model | deletingContact = Just contact }, Cmd.none )

        CancelledDeleteContact ->
            ( { model | deletingContact = Nothing }, Cmd.none )

        ConfirmedDeleteContact ->
            case ( model.deletingContact, model.token ) of
                ( Just contact, Just token ) ->
                    ( model, Api.deleteContact token contact.id GotDeletedContact )

                _ ->
                    ( model, Cmd.none )

        GotDeletedContact result ->
            case result of
                Ok _ ->
                    let
                        name =
                            case model.deletingContact of
                                Just c ->
                                    c.name

                                Nothing ->
                                    "contact"

                        backToContacts =
                            case model.route of
                                ContactDetail _ ->
                                    True

                                _ ->
                                    False

                        freshModel =
                            { model
                                | deletingContact = Nothing
                                , viewingContact =
                                    if backToContacts then
                                        Nothing

                                    else
                                        model.viewingContact
                                , route =
                                    if backToContacts then
                                        Contacts

                                    else
                                        model.route
                                , toast = Just ("Deleted " ++ name)
                            }
                    in
                    ( freshModel, Tuple.second (loadContacts freshModel) )

                Err message ->
                    ( { model
                        | deletingContact = Nothing
                        , toast = Just ("Delete failed: " ++ message)
                      }
                    , Cmd.none
                    )

        DismissedToast ->
            ( { model | toast = Nothing }, Cmd.none )

        GotDeals result ->
            case result of
                Ok ( items, total ) ->
                    let
                        prevQ =
                            case model.deals of
                                Success d ->
                                    d.query

                                _ ->
                                    ""
                    in
                    ( { model
                        | deals =
                            Success
                                { items = items
                                , query = prevQ
                                , total = total
                                , offset = 0
                                , limit = pageSize
                                }
                      }
                    , Cmd.none
                    )

                Err message ->
                    ( { model | deals = Failure message }, Cmd.none )

        UpdatedDealsQuery q ->
            let
                nextDeals =
                    case model.deals of
                        Success data ->
                            Success { data | query = q, offset = 0 }

                        _ ->
                            Success { items = [], query = q, total = 0, offset = 0, limit = pageSize }
            in
            ( { model | deals = nextDeals, pendingDealsQuery = Just q }
            , Cmd.none
            )

        FlushDealsSearch ->
            case ( model.token, model.pendingDealsQuery ) of
                ( Just t, Just q ) ->
                    ( { model | pendingDealsQuery = Nothing, deals = Loading }
                    , Api.fetchDeals t q pageSize 0 GotDeals
                    )

                _ ->
                    ( { model | pendingDealsQuery = Nothing }, Cmd.none )

        OpenedAddDeal ->
            ( { model
                | dealForm = Just emptyDealForm
                , editingDealId = Nothing
                , toast = Nothing
              }
            , Cmd.none
            )

        OpenedAddDealWithStage stage ->
            ( { model
                | dealForm = Just { emptyDealForm | stage = stage }
                , editingDealId = Nothing
                , toast = Nothing
              }
            , Cmd.none
            )

        OpenedEditDeal deal ->
            ( { model
                | dealForm = Just (dealToForm deal)
                , editingDealId = Just deal.id
                , toast = Nothing
              }
            , Cmd.none
            )

        OpenedDealDetail deal ->
            update (NavigatedTo (DealDetail deal.id))
                { model | viewingDeal = Just deal, toast = Nothing }

        RequestedCloseDealForm ->
            case ( model.dealForm, model.deletingDeal ) of
                ( _, Just _ ) ->
                    ( { model | deletingDeal = Nothing }, Cmd.none )

                ( Just df, _ ) ->
                    if df.dirty && not df.submitting then
                        ( { model | dealForm = Just { df | confirmDiscard = True } }
                        , Cmd.none
                        )

                    else
                        ( { model | dealForm = Nothing, editingDealId = Nothing }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        ConfirmedCloseDealForm ->
            ( { model | dealForm = Nothing, editingDealId = Nothing }, Cmd.none )

        CancelledCloseDealForm ->
            case model.dealForm of
                Just df ->
                    ( { model | dealForm = Just { df | confirmDiscard = False } }
                    , Cmd.none
                    )

                Nothing ->
                    ( model, Cmd.none )

        UpdatedDealFormField field value ->
            case model.dealForm of
                Just df ->
                    let
                        updated =
                            case field of
                                "title" ->
                                    { df | title = value }

                                "contactId" ->
                                    { df | contactId = value }

                                "value" ->
                                    { df | value = value }

                                "stage" ->
                                    { df | stage = value }

                                "closeDate" ->
                                    { df | closeDate = value }

                                "owner" ->
                                    { df | owner = value }

                                "notes" ->
                                    { df | notes = value }

                                _ ->
                                    df
                    in
                    ( { model
                        | dealForm =
                            Just
                                { updated
                                    | dirty = True
                                    , errors =
                                        List.filter (\( f, _ ) -> f /= field) updated.errors
                                }
                      }
                    , Cmd.none
                    )

                Nothing ->
                    ( model, Cmd.none )

        SubmittedDealForm ->
            case ( model.dealForm, model.token ) of
                ( Just df, Just token ) ->
                    let
                        ( validated, ok ) =
                            validateDealForm df
                    in
                    if not ok then
                        ( { model | dealForm = Just validated }, Cmd.none )

                    else
                        let
                            cmd =
                                case model.editingDealId of
                                    Just id ->
                                        Api.updateDeal token id validated GotSavedDeal

                                    Nothing ->
                                        Api.createDeal token validated GotSavedDeal
                        in
                        ( { model
                            | dealForm = Just { validated | submitting = True }
                          }
                        , cmd
                        )

                _ ->
                    ( model, Cmd.none )

        GotSavedDeal result ->
            let
                wasEdit =
                    model.editingDealId /= Nothing

                verb =
                    if wasEdit then
                        "Updated "

                    else
                        "Added "
            in
            case result of
                Ok deal ->
                    let
                        freshModel =
                            { model
                                | dealForm = Nothing
                                , editingDealId = Nothing
                                , viewingDeal =
                                    case model.route of
                                        DealDetail _ ->
                                            Just deal

                                        _ ->
                                            model.viewingDeal
                                , toast = Just (verb ++ deal.title)
                            }
                    in
                    ( freshModel, Tuple.second (loadDeals freshModel) )

                Err (FieldErrors fields) ->
                    case model.dealForm of
                        Just df ->
                            ( { model
                                | dealForm =
                                    Just { df | submitting = False, errors = fields }
                              }
                            , Cmd.none
                            )

                        Nothing ->
                            ( model, Cmd.none )

                Err (GenericError message) ->
                    case model.dealForm of
                        Just df ->
                            ( { model
                                | dealForm =
                                    Just
                                        { df
                                            | submitting = False
                                            , errors = [ ( "form", message ) ]
                                        }
                              }
                            , Cmd.none
                            )

                        Nothing ->
                            ( model, Cmd.none )

        MovedDeal deal newStage ->
            case model.token of
                Just token ->
                    ( { model | movingDealId = Just deal.id }
                    , Api.updateDealStage token deal.id newStage GotMovedDeal
                    )

                Nothing ->
                    ( model, Cmd.none )

        GotMovedDeal result ->
            case result of
                Ok deal ->
                    let
                        freshModel =
                            { model
                                | movingDealId = Nothing
                                , viewingDeal =
                                    case model.route of
                                        DealDetail _ ->
                                            Just deal

                                        _ ->
                                            model.viewingDeal
                                , toast = Just (deal.title ++ " moved to " ++ deal.stage)
                            }
                    in
                    ( freshModel, Tuple.second (loadDeals freshModel) )

                Err err ->
                    let
                        message =
                            case err of
                                FieldErrors _ ->
                                    "Could not move deal."

                                GenericError m ->
                                    m
                    in
                    ( { model | movingDealId = Nothing, toast = Just message }, Cmd.none )

        RequestedDeleteDeal deal ->
            ( { model | deletingDeal = Just deal }, Cmd.none )

        CancelledDeleteDeal ->
            ( { model | deletingDeal = Nothing }, Cmd.none )

        ConfirmedDeleteDeal ->
            case ( model.deletingDeal, model.token ) of
                ( Just deal, Just token ) ->
                    ( model, Api.deleteDeal token deal.id GotDeletedDeal )

                _ ->
                    ( model, Cmd.none )

        GotDeletedDeal result ->
            case result of
                Ok _ ->
                    let
                        name =
                            case model.deletingDeal of
                                Just d ->
                                    d.title

                                Nothing ->
                                    "deal"

                        backToDeals =
                            case model.route of
                                DealDetail _ ->
                                    True

                                _ ->
                                    False

                        freshModel =
                            { model
                                | deletingDeal = Nothing
                                , dealForm = Nothing
                                , editingDealId = Nothing
                                , viewingDeal =
                                    if backToDeals then
                                        Nothing

                                    else
                                        model.viewingDeal
                                , route =
                                    if backToDeals then
                                        Deals

                                    else
                                        model.route
                                , toast = Just ("Deleted " ++ name)
                            }
                    in
                    ( freshModel, Tuple.second (loadDeals freshModel) )

                Err message ->
                    ( { model
                        | deletingDeal = Nothing
                        , toast = Just ("Delete failed: " ++ message)
                      }
                    , Cmd.none
                    )


        GotActivities result ->
            case result of
                Ok items ->
                    ( { model | activities = Success items }, Cmd.none )

                Err message ->
                    ( { model | activities = Failure message }, Cmd.none )

        OpenedActivityForm ->
            ( { model
                | activityForm = Just emptyActivityForm
                , toast = Nothing
              }
            , Cmd.none
            )

        ClosedActivityForm ->
            ( { model | activityForm = Nothing }, Cmd.none )

        UpdatedActivityFormField field value ->
            case model.activityForm of
                Just af ->
                    let
                        updated =
                            case field of
                                "kind" ->
                                    { af | kind = value }

                                "title" ->
                                    { af | title = value }

                                "body" ->
                                    { af | body = value }

                                "occurredAt" ->
                                    { af | occurredAt = value }

                                _ ->
                                    af
                    in
                    ( { model
                        | activityForm =
                            Just
                                { updated
                                    | errors =
                                        List.filter (\( f, _ ) -> f /= field) updated.errors
                                }
                      }
                    , Cmd.none
                    )

                Nothing ->
                    ( model, Cmd.none )

        SubmittedActivityForm ->
            case ( model.activityForm, model.token, model.viewingContact ) of
                ( Just af, Just token, Just contact ) ->
                    let
                        ( validated, ok ) =
                            validateActivityForm af
                    in
                    if not ok then
                        ( { model | activityForm = Just validated }, Cmd.none )

                    else
                        ( { model
                            | activityForm = Just { validated | submitting = True }
                          }
                        , Api.createActivity token contact.id validated GotSavedActivity
                        )

                _ ->
                    ( model, Cmd.none )

        GotSavedActivity result ->
            case result of
                Ok activity ->
                    let
                        freshModel =
                            { model
                                | activityForm = Nothing
                                , toast = Just ("Logged " ++ activity.title)
                            }

                        contactId =
                            case model.viewingContact of
                                Just c ->
                                    c.id

                                Nothing ->
                                    ""
                    in
                    if String.isEmpty contactId then
                        ( freshModel, Cmd.none )

                    else
                        ( freshModel
                        , Cmd.batch
                            [ Tuple.second (loadActivities freshModel contactId)
                            , Tuple.second (loadContacts freshModel)
                            ]
                        )

                Err (FieldErrors fields) ->
                    case model.activityForm of
                        Just af ->
                            ( { model
                                | activityForm =
                                    Just { af | submitting = False, errors = fields }
                              }
                            , Cmd.none
                            )

                        Nothing ->
                            ( model, Cmd.none )

                Err (GenericError message) ->
                    case model.activityForm of
                        Just af ->
                            ( { model
                                | activityForm =
                                    Just
                                        { af
                                            | submitting = False
                                            , errors = [ ( "form", message ) ]
                                        }
                              }
                            , Cmd.none
                            )

                        Nothing ->
                            ( model, Cmd.none )

        RequestedDeleteActivity activity ->
            ( { model | deletingActivity = Just activity }, Cmd.none )

        CancelledDeleteActivity ->
            ( { model | deletingActivity = Nothing }, Cmd.none )

        ConfirmedDeleteActivity ->
            case ( model.deletingActivity, model.token ) of
                ( Just activity, Just token ) ->
                    ( model, Api.deleteActivity token activity.id GotDeletedActivity )

                _ ->
                    ( model, Cmd.none )

        GotDeletedActivity result ->
            case result of
                Ok _ ->
                    let
                        freshModel =
                            { model
                                | deletingActivity = Nothing
                                , toast = Just "Activity deleted"
                            }

                        contactId =
                            case model.viewingContact of
                                Just c ->
                                    c.id

                                Nothing ->
                                    ""
                    in
                    if String.isEmpty contactId then
                        ( freshModel, Cmd.none )

                    else
                        ( freshModel, Tuple.second (loadActivities freshModel contactId) )

                Err message ->
                    ( { model
                        | deletingActivity = Nothing
                        , toast = Just ("Delete failed: " ++ message)
                      }
                    , Cmd.none
                    )

        UpdatedProfileField field value ->
            let
                pf =
                    model.profileForm

                updated =
                    case field of
                        "name" ->
                            { pf | name = value }

                        "email" ->
                            { pf | email = value }

                        _ ->
                            pf
            in
            ( { model
                | profileForm =
                    { updated
                        | errors = List.filter (\( f, _ ) -> f /= field) updated.errors
                        , success = Nothing
                    }
              }
            , Cmd.none
            )

        SubmittedProfile ->
            case model.token of
                Just token ->
                    let
                        pf =
                            model.profileForm

                        errs =
                            List.filterMap identity
                                [ if String.isEmpty (String.trim pf.name) then
                                    Just ( "name", "Name is required." )

                                  else
                                    Nothing
                                , if not (String.contains "@" pf.email && String.contains "." pf.email) then
                                    Just ( "email", "Please enter a valid email." )

                                  else
                                    Nothing
                                ]
                    in
                    if not (List.isEmpty errs) then
                        ( { model | profileForm = { pf | errors = errs } }, Cmd.none )

                    else
                        ( { model
                            | profileForm =
                                { pf
                                    | submitting = True
                                    , errors = []
                                    , success = Nothing
                                }
                          }
                        , Api.updateMe token pf.name pf.email GotUpdatedProfile
                        )

                Nothing ->
                    ( model, Cmd.none )

        GotUpdatedProfile result ->
            let
                pf =
                    model.profileForm
            in
            case result of
                Ok res ->
                    ( { model
                        | profileForm =
                            { pf
                                | submitting = False
                                , success = Just "Profile updated."
                            }
                        , user = Just res.user
                        , token = Just res.token
                      }
                    , storeToken (Just res.token)
                    )

                Err (FieldErrors fields) ->
                    ( { model
                        | profileForm =
                            { pf | submitting = False, errors = fields }
                      }
                    , Cmd.none
                    )

                Err (GenericError message) ->
                    ( { model
                        | profileForm =
                            { pf
                                | submitting = False
                                , errors = [ ( "form", message ) ]
                            }
                      }
                    , Cmd.none
                    )

        UpdatedPasswordField field value ->
            let
                pf =
                    model.passwordForm

                updated =
                    case field of
                        "current" ->
                            { pf | current = value }

                        "next" ->
                            { pf | next = value }

                        "confirm" ->
                            { pf | confirm = value }

                        _ ->
                            pf
            in
            ( { model
                | passwordForm =
                    { updated
                        | errors = List.filter (\( f, _ ) -> f /= field) updated.errors
                        , success = Nothing
                    }
              }
            , Cmd.none
            )

        SubmittedPassword ->
            case model.token of
                Just token ->
                    let
                        pf =
                            model.passwordForm

                        errs =
                            List.filterMap identity
                                [ if String.isEmpty pf.current then
                                    Just ( "current", "Enter your current password." )

                                  else
                                    Nothing
                                , if String.length pf.next < 8 then
                                    Just ( "next", "New password must be at least 8 characters." )

                                  else
                                    Nothing
                                , if pf.confirm /= pf.next then
                                    Just ( "confirm", "Passwords don't match." )

                                  else
                                    Nothing
                                ]
                    in
                    if not (List.isEmpty errs) then
                        ( { model | passwordForm = { pf | errors = errs } }, Cmd.none )

                    else
                        ( { model
                            | passwordForm =
                                { pf
                                    | submitting = True
                                    , errors = []
                                    , success = Nothing
                                }
                          }
                        , Api.changePassword token pf.current pf.next GotChangedPassword
                        )

                Nothing ->
                    ( model, Cmd.none )

        GotChangedPassword result ->
            let
                pf =
                    model.passwordForm
            in
            case result of
                Ok _ ->
                    ( { model
                        | passwordForm =
                            { emptyPasswordForm | success = Just "Password changed." }
                        , toast = Just "Password updated"
                      }
                    , Cmd.none
                    )

                Err message ->
                    ( { model
                        | passwordForm =
                            { pf
                                | submitting = False
                                , errors = [ ( "form", message ) ]
                            }
                      }
                    , Cmd.none
                    )

        RequestedLogoutAll ->
            ( { model | logoutAllConfirm = True }, Cmd.none )

        CancelledLogoutAll ->
            ( { model | logoutAllConfirm = False }, Cmd.none )

        ConfirmedLogoutAll ->
            case model.token of
                Just token ->
                    ( { model | logoutAllConfirm = False }
                    , Api.logoutAll token GotLogoutAll
                    )

                Nothing ->
                    ( { model | logoutAllConfirm = False }, Cmd.none )

        GotLogoutAll result ->
            case result of
                Ok _ ->
                    ( { model
                        | token = Nothing
                        , user = Nothing
                        , mode = Login
                        , route = Home
                        , contacts = NotAsked
                        , deals = NotAsked
                        , activities = NotAsked
                        , toast = Nothing
                        , alert =
                            Just
                                { kind = AlertSuccess
                                , message = "Signed out of all devices."
                                }
                      }
                    , storeToken Nothing
                    )

                Err message ->
                    ( { model | toast = Just ("Sign-out failed: " ++ message) }
                    , Cmd.none
                    )

        GotTasks result ->
            case result of
                Ok ( items, total ) ->
                    let
                        ( prevQ, prevSt ) =
                            case model.tasks of
                                Success d ->
                                    ( d.query, d.statusFilter )

                                _ ->
                                    ( "", "" )
                    in
                    ( { model
                        | tasks =
                            Success
                                { items = items
                                , query = prevQ
                                , statusFilter = prevSt
                                , total = total
                                }
                      }
                    , Cmd.none
                    )

                Err message ->
                    ( { model | tasks = Failure message }, Cmd.none )

        UpdatedTasksQuery q ->
            let
                next =
                    case model.tasks of
                        Success data ->
                            Success { data | query = q }

                        _ ->
                            Success { items = [], query = q, statusFilter = "", total = 0 }
            in
            ( { model | tasks = next, pendingTasksQuery = Just q }, Cmd.none )

        FlushTasksSearch ->
            case ( model.token, model.pendingTasksQuery ) of
                ( Just t, Just q ) ->
                    let
                        st =
                            case model.tasks of
                                Success d ->
                                    d.statusFilter

                                _ ->
                                    ""
                    in
                    ( { model | pendingTasksQuery = Nothing, tasks = Loading }
                    , Api.fetchTasks t q st GotTasks
                    )

                _ ->
                    ( { model | pendingTasksQuery = Nothing }, Cmd.none )

        UpdatedTasksStatusFilter status ->
            case model.token of
                Just t ->
                    let
                        q =
                            case model.tasks of
                                Success d ->
                                    d.query

                                _ ->
                                    ""

                        next =
                            case model.tasks of
                                Success data ->
                                    Success { data | statusFilter = status }

                                _ ->
                                    Success { items = [], query = q, statusFilter = status, total = 0 }
                    in
                    ( { model | tasks = next }
                    , Api.fetchTasks t q status GotTasks
                    )

                Nothing ->
                    ( model, Cmd.none )

        OpenedAddTask ->
            ( { model | taskForm = Just emptyTaskForm, editingTaskId = Nothing, toast = Nothing }, Cmd.none )

        OpenedEditTask task ->
            ( { model | taskForm = Just (taskToForm task), editingTaskId = Just task.id, toast = Nothing }, Cmd.none )

        RequestedCloseTaskForm ->
            case ( model.taskForm, model.deletingTask ) of
                ( _, Just _ ) ->
                    ( { model | deletingTask = Nothing }, Cmd.none )

                ( Just tf, _ ) ->
                    if tf.dirty && not tf.submitting then
                        ( { model | taskForm = Just { tf | confirmDiscard = True } }, Cmd.none )

                    else
                        ( { model | taskForm = Nothing, editingTaskId = Nothing }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        ConfirmedCloseTaskForm ->
            ( { model | taskForm = Nothing, editingTaskId = Nothing }, Cmd.none )

        CancelledCloseTaskForm ->
            case model.taskForm of
                Just tf ->
                    ( { model | taskForm = Just { tf | confirmDiscard = False } }, Cmd.none )

                Nothing ->
                    ( model, Cmd.none )

        UpdatedTaskFormField field value ->
            case model.taskForm of
                Just tf ->
                    let
                        updated =
                            case field of
                                "title" ->
                                    { tf | title = value }

                                "description" ->
                                    { tf | description = value }

                                "status" ->
                                    { tf | status = value }

                                "dueDate" ->
                                    { tf | dueDate = value }

                                "contactId" ->
                                    { tf | contactId = value }

                                "owner" ->
                                    { tf | owner = value }

                                _ ->
                                    tf
                    in
                    ( { model
                        | taskForm =
                            Just
                                { updated
                                    | dirty = True
                                    , errors = List.filter (\( f, _ ) -> f /= field) updated.errors
                                }
                      }
                    , Cmd.none
                    )

                Nothing ->
                    ( model, Cmd.none )

        SubmittedTaskForm ->
            case ( model.taskForm, model.token ) of
                ( Just tf, Just token ) ->
                    let
                        errs =
                            if String.isEmpty (String.trim tf.title) then
                                [ ( "title", "Title is required." ) ]

                            else
                                []

                        validated =
                            { tf | errors = errs }
                    in
                    if not (List.isEmpty errs) then
                        ( { model | taskForm = Just validated }, Cmd.none )

                    else
                        let
                            cmd =
                                case model.editingTaskId of
                                    Just id ->
                                        Api.updateTask token id validated GotSavedTask

                                    Nothing ->
                                        Api.createTask token validated GotSavedTask
                        in
                        ( { model | taskForm = Just { validated | submitting = True } }, cmd )

                _ ->
                    ( model, Cmd.none )

        GotSavedTask result ->
            case result of
                Ok task ->
                    let
                        verb =
                            if model.editingTaskId /= Nothing then
                                "Updated "

                            else
                                "Added "

                        fresh =
                            { model | taskForm = Nothing, editingTaskId = Nothing, toast = Just (verb ++ task.title) }
                    in
                    ( fresh, Tuple.second (loadTasks fresh) )

                Err (FieldErrors fields) ->
                    case model.taskForm of
                        Just tf ->
                            ( { model | taskForm = Just { tf | submitting = False, errors = fields } }, Cmd.none )

                        Nothing ->
                            ( model, Cmd.none )

                Err (GenericError message) ->
                    case model.taskForm of
                        Just tf ->
                            ( { model | taskForm = Just { tf | submitting = False, errors = [ ( "form", message ) ] } }, Cmd.none )

                        Nothing ->
                            ( model, Cmd.none )

        ToggledTaskStatus task newStatus ->
            case model.token of
                Just token ->
                    ( model, Api.updateTaskStatus token task.id newStatus GotToggledTask )

                Nothing ->
                    ( model, Cmd.none )

        GotToggledTask result ->
            case result of
                Ok task ->
                    let
                        fresh =
                            { model | toast = Just (task.title ++ " → " ++ task.status) }
                    in
                    ( fresh, Tuple.second (loadTasks fresh) )

                Err err ->
                    let
                        message =
                            case err of
                                FieldErrors _ ->
                                    "Could not update task."

                                GenericError m ->
                                    m
                    in
                    ( { model | toast = Just message }, Cmd.none )

        RequestedDeleteTask task ->
            ( { model | deletingTask = Just task }, Cmd.none )

        CancelledDeleteTask ->
            ( { model | deletingTask = Nothing }, Cmd.none )

        ConfirmedDeleteTask ->
            case ( model.deletingTask, model.token ) of
                ( Just task, Just token ) ->
                    ( model, Api.deleteTask token task.id GotDeletedTask )

                _ ->
                    ( model, Cmd.none )

        GotDeletedTask result ->
            case result of
                Ok _ ->
                    let
                        name =
                            case model.deletingTask of
                                Just t ->
                                    t.title

                                Nothing ->
                                    "task"

                        fresh =
                            { model | deletingTask = Nothing, toast = Just ("Deleted " ++ name) }
                    in
                    ( fresh, Tuple.second (loadTasks fresh) )

                Err message ->
                    ( { model | deletingTask = Nothing, toast = Just ("Delete failed: " ++ message) }, Cmd.none )




subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ case model.toast of
            Just _ ->
                Time.every 4000 (\_ -> DismissedToast)

            Nothing ->
                Sub.none
        , case model.pendingContactsQuery of
            Just _ ->
                Time.every 350 (\_ -> FlushContactsSearch)

            Nothing ->
                Sub.none
        , case model.pendingDealsQuery of
            Just _ ->
                Time.every 350 (\_ -> FlushDealsSearch)

            Nothing ->
                Sub.none
        , case model.pendingTasksQuery of
            Just _ ->
                Time.every 350 (\_ -> FlushTasksSearch)

            Nothing ->
                Sub.none
        , if
            model.contactForm
                /= Nothing
                || model.deletingContact
                /= Nothing
                || model.dealForm
                /= Nothing
                || model.deletingDeal
                /= Nothing
                || model.activityForm
                /= Nothing
                || model.deletingActivity
                /= Nothing
                || model.taskForm
                /= Nothing
                || model.deletingTask
                /= Nothing
                || model.logoutAllConfirm
          then
            escapePressed

          else
            Sub.none
        ]


escapePressed : Sub Msg
escapePressed =
    Browser.Events.onKeyDown
        (D.field "key" D.string
            |> D.andThen
                (\key ->
                    if key == "Escape" then
                        D.succeed EscapePressed

                    else
                        D.fail "not escape"
                )
        )


main : Program Flags Model Msg
main =
    Browser.application
        { init = init
        , update = update
        , view =
            \model ->
                { title = "ECC-CRM"
                , body = [ Views.view model ]
                }
        , subscriptions = subscriptions
        , onUrlRequest = LinkClicked
        , onUrlChange = UrlChanged
        }
