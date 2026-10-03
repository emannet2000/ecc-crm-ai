module Update.Auth exposing (update)

{-| Login, session and logout messages. -}

import Api
import Ports exposing (storeToken)
import Set
import Types exposing (..)
import Update.Navigation
import Update.Validate exposing (validate)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
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
            ( { model | form = (\f -> { f | remember = value }) model.form }, Cmd.none )


        ToggledShowPassword ->
            ( { model | showPassword = not model.showPassword }, Cmd.none )


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
                                , deals = NotAsked
                                , cases = NotAsked
                                , invoices = NotAsked
                                , partners = NotAsked
                                , toast = Nothing
                                , alert =
                                    Just
                                        { kind = AlertSuccess
                                        , message = "Welcome, " ++ user.name ++ "!"
                                        }
                            }

                        ( routedModel, routeCmds ) =
                            Update.Navigation.update (NavigatedTo Home) modelWithAuth
                    in
                    ( routedModel, Cmd.batch [ storeCmd, routeCmds ] )

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
                            { model | user = Just user, bootstrapping = False }

                        ( routedModel, routeCmds ) =
                            Update.Navigation.update (NavigatedTo model.route) modelWithUser
                    in
                    ( routedModel, routeCmds )

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
                , draggingDealId = Nothing
                , dropTargetStage = Nothing
                , selectedDeals = Set.empty
                , ownerFilter = ""
                , dateFromFilter = ""
                , dateToFilter = ""
                , bulkMoveStage = Nothing
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
              }
            , storeToken Nothing
            )

        _ ->
            ( model, Cmd.none )
