module Main exposing (main)

import Api
import Browser
import Browser.Events
import Browser.Navigation as Nav
import Json.Decode as D
import Router exposing (parseRoute, routeToPath)
import Set
import Time
import Types exposing (..)
import Update.Activities
import Update.Agents
import Update.Auth
import Update.Cases
import Update.Contacts
import Update.Deals
import Update.Fetched
import Update.Invoices
import Update.Leads
import Update.Navigation
import Update.Partners
import Update.Schools
import Update.Settings
import Update.Students
import Update.Tasks
import Url
import Views


type alias Flags =
    { token : Maybe String
    , today : String
    }


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
            , draggingDealId = Nothing
            , dropTargetStage = Nothing
            , selectedDeals = Set.empty
            , ownerFilter = ""
            , dateFromFilter = ""
            , dateToFilter = ""
            , today = flags.today
            , bulkMoveStage = ""
            , bulkDeleteConfirm = False
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
            , schools = NotAsked
            , viewingSchool = Nothing
            , schoolForm = Nothing
            , editingSchoolId = Nothing
            , deletingSchool = Nothing
            , pendingSchoolsQuery = Nothing
            , students = NotAsked
            , viewingStudent = Nothing
            , studentDossier = NotAsked
            , studentForm = Nothing
            , editingStudentId = Nothing
            , deletingStudent = Nothing
            , pendingStudentsQuery = Nothing
            , agents = NotAsked
            , viewingAgent = Nothing
            , agentForm = Nothing
            , editingAgentId = Nothing
            , deletingAgent = Nothing
            , pendingAgentsQuery = Nothing
            , leads = NotAsked
            , viewingLead = Nothing
            , leadForm = Nothing
            , editingLeadId = Nothing
            , deletingLead = Nothing
            , pendingLeadsQuery = Nothing
            , cases = NotAsked
            , viewingCase = Nothing
            , caseForm = Nothing
            , editingCaseId = Nothing
            , deletingCase = Nothing
            , pendingCasesQuery = Nothing
            , caseDocuments = NotAsked
            , documentForm = Nothing
            , editingDocumentId = Nothing
            , deletingDocument = Nothing
            , invoices = NotAsked
            , viewingInvoice = Nothing
            , invoiceForm = Nothing
            , editingInvoiceId = Nothing
            , deletingInvoice = Nothing
            , pendingInvoicesQuery = Nothing
            , invoicePayments = NotAsked
            , paymentForm = Nothing
            , deletingPayment = Nothing
            , refundConfirmInvoice = Nothing
            , partners = NotAsked
            , viewingPartner = Nothing
            , partnerForm = Nothing
            , editingPartnerId = Nothing
            , deletingPartner = Nothing
            , pendingPartnersQuery = Nothing
            , navKey = key
            }
    in
    case flags.token of
        Just t ->
            ( model, Api.me t GotUser )

        Nothing ->
            ( model, Cmd.none )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        EscapePressed ->
            if model.logoutAllConfirm then
                ( { model | logoutAllConfirm = False }, Cmd.none )

            else if model.bulkDeleteConfirm then
                ( { model | bulkDeleteConfirm = False }, Cmd.none )

            else if not (String.isEmpty model.bulkMoveStage) then
                ( { model | bulkMoveStage = "" }, Cmd.none )

            else if model.activityForm /= Nothing || model.deletingActivity /= Nothing then
                update ClosedActivityForm model

            else if model.contactForm /= Nothing || model.deletingContact /= Nothing then
                update RequestedCloseContactForm model

            else if model.dealForm /= Nothing || model.deletingDeal /= Nothing then
                update RequestedCloseDealForm model

            else if model.taskForm /= Nothing || model.deletingTask /= Nothing then
                update RequestedCloseTaskForm model

            else if model.schoolForm /= Nothing || model.deletingSchool /= Nothing then
                update RequestedCloseSchoolForm model

            else if model.studentForm /= Nothing || model.deletingStudent /= Nothing then
                update RequestedCloseStudentForm model

            else if model.agentForm /= Nothing || model.deletingAgent /= Nothing then
                update RequestedCloseAgentForm model

            else if model.leadForm /= Nothing || model.deletingLead /= Nothing then
                update RequestedCloseLeadForm model

            else if model.caseForm /= Nothing || model.deletingCase /= Nothing then
                update RequestedCloseCaseForm model

            else if model.documentForm /= Nothing || model.deletingDocument /= Nothing then
                update RequestedCloseDocumentForm model

            else if model.invoiceForm /= Nothing || model.deletingInvoice /= Nothing then
                update RequestedCloseInvoiceForm model

            else if model.paymentForm /= Nothing then
                update ClosedPaymentForm model

            else if model.refundConfirmInvoice /= Nothing then
                update CancelledRefund model

            else if model.partnerForm /= Nothing || model.deletingPartner /= Nothing then
                update RequestedClosePartnerForm model

            else
                ( model, Cmd.none )

        DismissedToast ->
            ( { model | toast = Nothing }, Cmd.none )

        _ ->
            let
                oldRoute =
                    model.route

                ( newModel, newCmds ) =
                    updateDomains msg model

                alreadyNavigated =
                    case msg of
                        NavigatedTo _ ->
                            True

                        UrlChanged _ ->
                            True

                        _ ->
                            False
            in
            if not alreadyNavigated && newModel.route /= oldRoute then
                ( newModel
                , Cmd.batch
                    [ newCmds
                    , Nav.pushUrl newModel.navKey (routeToPath newModel.route)
                    ]
                )

            else
                ( newModel, newCmds )


updateDomains : Msg -> Model -> ( Model, Cmd Msg )
updateDomains msg model =
    List.foldl
        (\handler ( m, cmds ) ->
            let
                ( m2, cmd ) =
                    handler msg m
            in
            ( m2, cmd :: cmds )
        )
        ( model, [] )
        [ Update.Auth.update
        , Update.Navigation.update
        , Update.Contacts.update
        , Update.Deals.update
        , Update.Activities.update
        , Update.Settings.update
        , Update.Tasks.update
        , Update.Schools.update
        , Update.Students.update
        , Update.Agents.update
        , Update.Leads.update
        , Update.Cases.update
        , Update.Invoices.update
        , Update.Partners.update
        , Update.Fetched.update
        ]
        |> Tuple.mapSecond (List.reverse >> Cmd.batch)


escapeDecoder : D.Decoder Msg
escapeDecoder =
    D.field "key" D.string
        |> D.andThen
            (\key ->
                if key == "Escape" then
                    D.succeed EscapePressed

                else
                    D.fail "not escape"
            )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Browser.Events.onKeyDown escapeDecoder
        , if model.pendingContactsQuery /= Nothing then
            Time.every 300 (\_ -> FlushContactsSearch)

          else
            Sub.none
        , if model.pendingDealsQuery /= Nothing then
            Time.every 300 (\_ -> FlushDealsSearch)

          else
            Sub.none
        , if model.pendingTasksQuery /= Nothing then
            Time.every 300 (\_ -> FlushTasksSearch)

          else
            Sub.none
        , if model.pendingSchoolsQuery /= Nothing then
            Time.every 300 (\_ -> FlushSchoolsSearch)

          else
            Sub.none
        , if model.pendingStudentsQuery /= Nothing then
            Time.every 300 (\_ -> FlushStudentsSearch)

          else
            Sub.none
        , if model.pendingAgentsQuery /= Nothing then
            Time.every 300 (\_ -> FlushAgentsSearch)

          else
            Sub.none
        , if model.pendingLeadsQuery /= Nothing then
            Time.every 300 (\_ -> FlushLeadsSearch)

          else
            Sub.none
        , if model.pendingCasesQuery /= Nothing then
            Time.every 300 (\_ -> FlushCasesSearch)

          else
            Sub.none
        , if model.pendingInvoicesQuery /= Nothing then
            Time.every 300 (\_ -> FlushInvoicesSearch)

          else
            Sub.none
        , if model.pendingPartnersQuery /= Nothing then
            Time.every 300 (\_ -> FlushPartnersSearch)

          else
            Sub.none
        ]


main : Program Flags Model Msg
main =
    Browser.application
        { init = init
        , view =
            \model ->
                { title = "ECC CRM"
                , body = [ Views.view model ]
                }
        , update = update
        , subscriptions = subscriptions
        , onUrlChange = UrlChanged
        , onUrlRequest = LinkClicked
        }
