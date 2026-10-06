module Update.Workspace exposing (update)

import Api
import Ports
import Process
import Task
import Types exposing (..)


remote : Result String a -> RemoteData a
remote result =
    case result of
        Ok value ->
            Success value

        Err message ->
            Failure message


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        PollWorkspaceClock ->
            case model.token of
                Just token ->
                    ( model, Api.fetchWorkspaceClock token RefreshedWorkspaceClock )

                Nothing ->
                    ( model, Cmd.none )

        RefreshedWorkspaceClock result ->
            case result of
                Ok ( today, unread ) ->
                    ( { model | today = today, unreadNotifications = unread }, Cmd.none )

                Err _ ->
                    ( model, Cmd.none )

        UpdatedGlobalQuery query ->
            ( { model
                | globalQuery = query
                , globalResults =
                    if String.length (String.trim query) >= 2 then
                        Loading

                    else
                        NotAsked
              }
            , Process.sleep 300 |> Task.perform (\_ -> GlobalSearchReady query)
            )

        GlobalSearchReady query ->
            if query == model.globalQuery && String.length (String.trim query) >= 2 then
                case model.token of
                    Just token ->
                        ( model, Api.fetchGlobalSearch token query (GotGlobalSearch query) )

                    Nothing ->
                        ( model, Cmd.none )

            else
                ( model, Cmd.none )

        GotGlobalSearch query result ->
            if query == model.globalQuery && model.user /= Nothing then
                ( { model | globalResults = remote result }, Cmd.none )

            else
                ( model, Cmd.none )

        ClosedGlobalSearch ->
            ( { model | globalQuery = "", globalResults = NotAsked }, Cmd.none )

        RequestedAuditPage offset ->
            case model.token of
                Just token ->
                    ( { model | audit = Loading, auditOffset = max 0 offset }, Api.fetchAudit token (max 0 offset) (GotAudit (max 0 offset)) )

                Nothing ->
                    ( model, Cmd.none )

        GotAudit offset result ->
            if model.user /= Nothing && offset == model.auditOffset then
                ( { model | audit = remote result }, Cmd.none )

            else
                ( model, Cmd.none )

        SelectedExportEntity entity ->
            ( { model | exportEntity = entity }, Cmd.none )

        RequestedExport ->
            case ( model.token, model.exporting ) of
                ( Just token, Nothing ) ->
                    ( { model | exporting = Just model.exportEntity }, Api.fetchExport token model.exportEntity (GotExport model.exportEntity) )

                _ ->
                    ( model, Cmd.none )

        GotExport entity result ->
            if model.exporting /= Just entity || model.user == Nothing then
                ( model, Cmd.none )

            else
                case result of
                    Ok content ->
                        ( { model | exporting = Nothing, toast = Just "CSV export downloaded" }
                        , Ports.downloadFile { filename = entity ++ "-" ++ model.today ++ ".csv", content = content, mime = "text/csv;charset=utf-8" }
                        )

                    Err message ->
                        ( { model | exporting = Nothing, toast = Just message }, Cmd.none )

        _ ->
            ( model, Cmd.none )
