module Update.Fetched exposing (update)

{-| Single-record fetch results for detail routes.
-}

import Api
import Types exposing (..)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        FetchedContact result ->
            case result of
                Ok contact ->
                    let
                        freshModel =
                            { model | viewingContact = Just contact }
                    in
                    case model.token of
                        Just t ->
                            ( freshModel, Api.fetchActivities t contact.id GotActivities )

                        Nothing ->
                            ( freshModel, Cmd.none )

                Err _ ->
                    ( { model | viewingContact = Nothing }, Cmd.none )

        FetchedDeal result ->
            case result of
                Ok deal ->
                    ( { model | viewingDeal = Just deal }, Cmd.none )

                Err _ ->
                    ( { model | viewingDeal = Nothing }, Cmd.none )

        FetchedSchool result ->
            case result of
                Ok school ->
                    ( { model | viewingSchool = Just school }, Cmd.none )

                Err _ ->
                    ( { model | viewingSchool = Nothing }, Cmd.none )

        FetchedStudent result ->
            case result of
                Ok student ->
                    let
                        fresh =
                            { model | viewingStudent = Just student }
                    in
                    case model.token of
                        Just t ->
                            ( fresh, Api.fetchStudentDossier t student.id GotStudentDossier )

                        Nothing ->
                            ( fresh, Cmd.none )

                Err _ ->
                    ( { model
                        | viewingStudent = Nothing
                        , studentDossier = NotAsked
                      }
                    , Cmd.none
                    )

        GotStudentDossier result ->
            case result of
                Ok dossier ->
                    ( { model | studentDossier = Success dossier }, Cmd.none )

                Err message ->
                    ( { model | studentDossier = Failure message }, Cmd.none )

        FetchedAgent result ->
            case result of
                Ok agent ->
                    ( { model | viewingAgent = Just agent }, Cmd.none )

                Err _ ->
                    ( { model | viewingAgent = Nothing }, Cmd.none )

        FetchedLead result ->
            case result of
                Ok lead ->
                    ( { model | viewingLead = Just lead }, Cmd.none )

                Err _ ->
                    ( { model | viewingLead = Nothing }, Cmd.none )

        FetchedCase result ->
            case result of
                Ok c ->
                    let
                        fresh =
                            { model | viewingCase = Just c }
                    in
                    case model.token of
                        Just t ->
                            ( fresh, Api.fetchCaseDocuments t c.id GotCaseDocuments )

                        Nothing ->
                            ( fresh, Cmd.none )

                Err _ ->
                    ( { model | viewingCase = Nothing }, Cmd.none )

        FetchedInvoice result ->
            case result of
                Ok inv ->
                    let
                        fresh =
                            { model | viewingInvoice = Just inv }
                    in
                    case model.token of
                        Just t ->
                            ( fresh, Api.fetchInvoicePayments t inv.id GotInvoicePayments )

                        Nothing ->
                            ( fresh, Cmd.none )

                Err _ ->
                    ( { model | viewingInvoice = Nothing }, Cmd.none )

        FetchedPartner result ->
            case result of
                Ok p ->
                    ( { model | viewingPartner = Just p }, Cmd.none )

                Err _ ->
                    ( { model | viewingPartner = Nothing }, Cmd.none )

        FetchFailed message ->
            ( { model | toast = Just message }, Cmd.none )

        _ ->
            ( model, Cmd.none )
