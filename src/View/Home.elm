module View.Home exposing (homeView)

{-| Dashboard home page: 5-stat row with sparklines, deal pipeline
donut, win-rate gauge, pipeline-value bar chart, contribution
heatmap, priority alerts, and board activity.
-}

import Html exposing (..)
import Html.Attributes exposing (class)
import Types exposing (..)
import View.Charts exposing (BarDatum, barChart, gauge)
import View.Dashboard exposing (ActivityEntry, PriorityAlert, activityPanel, alertsPanel, caseEntry, dealEntry, leadEntry, outstandingInvoiceAlert, overdueTaskAlert, pendingAgentAlert, pendingSchoolAlert, studentEntry, urgentCaseAlert)
import View.Donut exposing (donutWithLegend)
import View.Format exposing (dateToDays, formatCurrency)
import View.Heatmap exposing (activityHeatmap)
import View.Helpers exposing (sparkline)


statCard : String -> String -> String -> List Int -> Html Msg
statCard label valueText hint trend =
    div [ class "stat-card" ]
        [ span [ class "stat-card__label" ] [ text label ]
        , span [ class "stat-card__value" ] [ text valueText ]
        , sparkline trend
        , span [ class "stat-card__hint" ] [ text hint ]
        ]


isPast : String -> String -> Bool
isPast today dateStr =
    case ( dateToDays today, dateToDays dateStr ) of
        ( Just t, Just d ) ->
            d < t

        _ ->
            False


-- ─── Derived deal numbers ────────────────────────────────────


dealsOf : Model -> List Deal
dealsOf model =
    case model.deals of
        Success d ->
            d.items

        _ ->
            []


totalDealValue : Model -> Float
totalDealValue model =
    dealsOf model
        |> List.filter (\x -> x.stage /= "Lost")
        |> List.map .value
        |> List.sum


stageCount : Model -> String -> Int
stageCount model stage =
    List.length (List.filter (\x -> x.stage == stage) (dealsOf model))


stageValue : Model -> String -> Float
stageValue model stage =
    dealsOf model
        |> List.filter (\x -> x.stage == stage)
        |> List.map .value
        |> List.sum


wonCount : Model -> Int
wonCount model =
    stageCount model "Won"


lostCount : Model -> Int
lostCount model =
    stageCount model "Lost"


conversionPct : Model -> Float
conversionPct model =
    let
        won =
            toFloat (wonCount model)

        lost =
            toFloat (lostCount model)

        closed =
            won + lost
    in
    if closed <= 0 then
        0

    else
        won / closed


-- ─── Chart data ──────────────────────────────────────────────


stageColors : List ( String, String )
stageColors =
    [ ( "Lead", "#7eb8d4" )
    , ( "Qualified", "#b8922e" )
    , ( "Proposal", "#e2b94d" )
    , ( "Negotiation", "#f0cf74" )
    , ( "Won", "#6bcb8a" )
    , ( "Lost", "#e07070" )
    ]


donutSlices : Model -> List View.Donut.Slice
donutSlices model =
    List.map
        (\( stage, color ) ->
            { label = stage
            , value = toFloat (stageCount model stage)
            , color = color
            }
        )
        stageColors


barData : Model -> List BarDatum
barData model =
    List.map
        (\( stage, color ) ->
            { label = stage
            , value = stageValue model stage
            , color = color
            }
        )
        stageColors


-- ─── Heatmap source data ─────────────────────────────────────


allCreatedAt : Model -> List ( String, Int )
allCreatedAt model =
    let
        fromLeads =
            case model.leads of
                Success d ->
                    List.map (\l -> ( l.createdAt, 1 )) d.items

                _ ->
                    []

        fromStudents =
            case model.students of
                Success d ->
                    List.map (\s -> ( s.createdAt, 1 )) d.items

                _ ->
                    []

        fromCases =
            case model.cases of
                Success d ->
                    List.map (\c -> ( c.createdAt, 1 )) d.items

                _ ->
                    []

        fromDeals =
            case model.deals of
                Success d ->
                    List.map (\x -> ( x.createdAt, 1 )) d.items

                _ ->
                    []

        fromSchools =
            case model.schools of
                Success d ->
                    List.map (\s -> ( s.createdAt, 1 )) d.items

                _ ->
                    []

        fromAgents =
            case model.agents of
                Success d ->
                    List.map (\a -> ( a.createdAt, 1 )) d.items

                _ ->
                    []
    in
    fromLeads ++ fromStudents ++ fromCases ++ fromDeals ++ fromSchools ++ fromAgents


-- ─── Priority alerts ──────────────────────────────────────────


priorityAlerts : Model -> List PriorityAlert
priorityAlerts model =
    let
        fromCases =
            case model.cases of
                Success d ->
                    d.items
                        |> List.filter (\c -> c.priority == "Urgent")
                        |> List.map urgentCaseAlert

                _ ->
                    []

        fromTasks =
            case model.tasks of
                Success d ->
                    d.items
                        |> List.filter (\t -> t.status /= "done" && isPast model.today t.dueDate)
                        |> List.map overdueTaskAlert

                _ ->
                    []

        fromInvoices =
            case model.invoices of
                Success d ->
                    d.items
                        |> List.filter (\inv -> inv.balance > 0)
                        |> List.map outstandingInvoiceAlert

                _ ->
                    []

        fromSchools =
            case model.schools of
                Success d ->
                    d.items
                        |> List.filter (\s -> s.contractStatus == "Pending")
                        |> List.map pendingSchoolAlert

                _ ->
                    []

        fromAgents =
            case model.agents of
                Success d ->
                    d.items
                        |> List.filter (\a -> a.contractStatus == "Not Signed")
                        |> List.map pendingAgentAlert

                _ ->
                    []
    in
    fromCases ++ fromTasks ++ fromInvoices ++ fromSchools ++ fromAgents


-- ─── Board activity ───────────────────────────────────────────


recentEntries : Model -> List ActivityEntry
recentEntries model =
    let
        fromLeads =
            case model.leads of
                Success d ->
                    List.map leadEntry d.items

                _ ->
                    []

        fromCases =
            case model.cases of
                Success d ->
                    List.map caseEntry d.items

                _ ->
                    []

        fromStudents =
            case model.students of
                Success d ->
                    List.map studentEntry d.items

                _ ->
                    []

        fromDeals =
            case model.deals of
                Success d ->
                    List.map dealEntry d.items

                _ ->
                    []
    in
    fromLeads ++ fromCases ++ fromStudents ++ fromDeals


-- ─── Home view ────────────────────────────────────────────────


homeView : Model -> User -> Html Msg
homeView model user =
    div []
        [ p [ class "content__lede content__lede--hero" ]
            [ text ("Welcome back, " ++ user.name) ]
        , p [ class "content__lede" ]
            [ text
                (if String.isEmpty model.today then
                    "Here's what's happening across your workspace today."

                 else
                    model.today ++ " · Here's what's happening across your workspace today."
                )
            ]
        , div [ class "stats" ]
            [ statCard "Open Deals"
                (case model.deals of
                    Success d ->
                        String.fromInt d.total

                    _ ->
                        "—"
                )
                (case model.deals of
                    Success d ->
                        let
                            active =
                                List.length
                                    (List.filter (\x -> x.stage /= "Won" && x.stage /= "Lost") d.items)
                        in
                        String.fromInt active ++ " active"

                    _ ->
                        "Loading…"
                )
                [ 3, 5, 4, 7, 6, 8, 9 ]
            , statCard "Pipeline (USD)"
                (formatCurrency (totalDealValue model))
                "Active total"
                [ 6, 7, 5, 8, 9, 8, 11 ]
            , statCard "Leads"
                (case model.leads of
                    Success d ->
                        String.fromInt d.total

                    _ ->
                        "—"
                )
                (case model.leads of
                    Success d ->
                        let
                            fresh =
                                List.length (List.filter (\l -> l.status == "New") d.items)
                        in
                        String.fromInt fresh ++ " new"

                    _ ->
                        "Loading…"
                )
                [ 2, 4, 3, 6, 5, 7, 8 ]
            , statCard "Students"
                (case model.students of
                    Success d ->
                        String.fromInt d.total

                    _ ->
                        "—"
                )
                (case model.students of
                    Success d ->
                        let
                            approved =
                                List.length (List.filter (\s -> s.visaStatus == "Approved") d.items)
                        in
                        String.fromInt approved ++ " approved"

                    _ ->
                        "Loading…"
                )
                [ 4, 5, 6, 5, 7, 8, 10 ]
            , statCard "Cases"
                (case model.cases of
                    Success d ->
                        String.fromInt d.total

                    _ ->
                        "—"
                )
                (case model.cases of
                    Success d ->
                        let
                            open =
                                List.length
                                    (List.filter (\c -> c.currentStage /= "Closed" && c.currentStage /= "Refused") d.items)
                        in
                        String.fromInt open ++ " open"

                    _ ->
                        "Loading…"
                )
                [ 5, 6, 5, 7, 8, 9, 11 ]
            ]
        , div [ class "chart-row" ]
            [ div [ class "chart-card" ]
                [ h3 [ class "chart-card__title" ] [ text "Pipeline distribution" ]
                , p [ class "chart-card__subtitle" ]
                    [ text "Deals by stage · current snapshot" ]
                , donutWithLegend
                    (donutSlices model)
                    (String.fromInt (List.length (dealsOf model)))
                    "Deals"
                ]
            , div [ class "chart-card" ]
                [ h3 [ class "chart-card__title" ] [ text "Win rate" ]
                , p [ class "chart-card__subtitle" ]
                    [ text "Won ÷ (Won + Lost) · all time" ]
                , gauge
                    "Win rate"
                    (conversionPct model * 100)
                    100
                , div [ class "chart-card__subtitle" ]
                    [ text
                        (String.fromInt (wonCount model)
                            ++ " won · "
                            ++ String.fromInt (lostCount model)
                            ++ " lost"
                        )
                    ]
                ]
            ]
        , div [ class "chart-card" ]
            [ h3 [ class "chart-card__title" ] [ text "Pipeline value by stage" ]
            , p [ class "chart-card__subtitle" ]
                [ text "Deal value in USD, summed per stage" ]
            , barChart (barData model)
            ]
        , activityHeatmap model.today (allCreatedAt model)
        , div [ class "bottom-row" ]
            [ alertsPanel (priorityAlerts model)
            , activityPanel (recentEntries model)
            ]
        ]
