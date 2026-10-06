module Update.Deals exposing (update)

{-| Deal messages (pipeline, drag/drop, bulk actions).
-}

import Api
import Set
import Types exposing (..)
import Update.Loaders exposing (loadDeals, pageSize)
import Update.Navigation
import Update.Validate exposing (validateDealForm)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
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
                    ( { model | pendingDealsQuery = Nothing }
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
            Update.Navigation.update (NavigatedTo (DealDetail deal.id))
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

                                "currency" ->
                                    { df | currency = value }

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

        DraggingDealStarted id ->
            ( { model | draggingDealId = Just id }, Cmd.none )

        DraggingDealEnded ->
            ( { model
                | draggingDealId = Nothing
                , dropTargetStage = Nothing
              }
            , Cmd.none
            )

        DropTargetEntered stageName ->
            ( { model | dropTargetStage = Just stageName }, Cmd.none )

        DropTargetLeft ->
            ( { model | dropTargetStage = Nothing }, Cmd.none )

        DealDroppedOnStage stageName ->
            case ( model.draggingDealId, model.token, model.deals ) of
                ( Just dealId, Just token, Success dealsData ) ->
                    case List.filter (\d -> d.id == dealId) dealsData.items |> List.head of
                        Just deal ->
                            if deal.stage == stageName then
                                ( { model
                                    | draggingDealId = Nothing
                                    , dropTargetStage = Nothing
                                  }
                                , Cmd.none
                                )

                            else
                                ( { model
                                    | draggingDealId = Nothing
                                    , dropTargetStage = Nothing
                                    , movingDealId = Just dealId
                                  }
                                , Api.updateDealStage token dealId stageName GotMovedDeal
                                )

                        Nothing ->
                            ( { model | draggingDealId = Nothing, dropTargetStage = Nothing }, Cmd.none )

                _ ->
                    ( { model | draggingDealId = Nothing, dropTargetStage = Nothing }, Cmd.none )

        ToggledDealSelection dealId ->
            let
                newSelection =
                    if Set.member dealId model.selectedDeals then
                        Set.remove dealId model.selectedDeals

                    else
                        Set.insert dealId model.selectedDeals
            in
            ( { model | selectedDeals = newSelection }, Cmd.none )

        ToggledSelectAllDeals ->
            case model.deals of
                Success data ->
                    let
                        allIds =
                            List.map .id data.items

                        allSelected =
                            List.all (\id -> Set.member id model.selectedDeals) allIds
                    in
                    if allSelected then
                        ( { model | selectedDeals = Set.empty }, Cmd.none )

                    else
                        ( { model | selectedDeals = Set.fromList allIds }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        ClearedDealSelection ->
            ( { model | selectedDeals = Set.empty }, Cmd.none )

        UpdatedOwnerFilter owner ->
            ( { model | ownerFilter = owner }, Cmd.none )

        UpdatedDateFromFilter date ->
            ( { model | dateFromFilter = date }, Cmd.none )

        UpdatedDateToFilter date ->
            ( { model | dateToFilter = date }, Cmd.none )

        ClearedDealFilters ->
            ( { model
                | ownerFilter = ""
                , dateFromFilter = ""
                , dateToFilter = ""
              }
            , Cmd.none
            )

        RequestedBulkMove stageName ->
            ( { model
                | bulkMoveStage =
                    Just
                        (if String.isEmpty stageName then
                            "Qualified"

                         else
                            stageName
                        )
              }
            , Cmd.none
            )

        CancelledBulkMove ->
            ( { model | bulkMoveStage = Nothing }, Cmd.none )

        ConfirmedBulkMove ->
            case ( model.token, model.bulkMoveStage ) of
                ( Just token, Just stageName ) ->
                    if String.isEmpty stageName then
                        ( model, Cmd.none )

                    else
                        let
                            ids =
                                Set.toList model.selectedDeals

                            cmds =
                                List.map
                                    (\dealId ->
                                        Api.updateDealStageOnly token
                                            dealId
                                            stageName
                                            (GotBulkMoved ids)
                                    )
                                    ids
                        in
                        ( { model | bulkMoveStage = Nothing }
                        , Cmd.batch cmds
                        )

                _ ->
                    ( { model | bulkMoveStage = Nothing }, Cmd.none )

        RequestedBulkDelete ->
            ( { model | bulkDeleteConfirm = True }, Cmd.none )

        CancelledBulkDelete ->
            ( { model | bulkDeleteConfirm = False }, Cmd.none )

        ConfirmedBulkDelete ->
            case model.token of
                Just token ->
                    let
                        ids =
                            Set.toList model.selectedDeals

                        cmds =
                            List.map
                                (\dealId ->
                                    Api.deleteDealRaw token dealId (GotBulkDeleted ids)
                                )
                                ids
                    in
                    ( { model | bulkDeleteConfirm = False }
                    , Cmd.batch cmds
                    )

                Nothing ->
                    ( { model | bulkDeleteConfirm = False }, Cmd.none )

        GotBulkMoved ids result ->
            let
                n =
                    List.length ids

                msgText =
                    case result of
                        Ok _ ->
                            "Moved "
                                ++ String.fromInt n
                                ++ " deal"
                                ++ (if n == 1 then
                                        ""

                                    else
                                        "s"
                                   )

                        Err _ ->
                            "Some moves failed"

                freshModel =
                    { model
                        | selectedDeals = Set.empty
                        , movingDealId = Nothing
                        , toast = Just msgText
                    }
            in
            ( freshModel, Tuple.second (loadDeals freshModel) )

        GotBulkDeleted ids result ->
            let
                n =
                    List.length ids

                msgText =
                    case result of
                        Ok _ ->
                            "Deleted "
                                ++ String.fromInt n
                                ++ " deal"
                                ++ (if n == 1 then
                                        ""

                                    else
                                        "s"
                                   )

                        Err _ ->
                            "Some deletes failed"

                freshModel =
                    { model
                        | selectedDeals = Set.empty
                        , toast = Just msgText
                    }
            in
            ( freshModel, Tuple.second (loadDeals freshModel) )

        _ ->
            ( model, Cmd.none )
