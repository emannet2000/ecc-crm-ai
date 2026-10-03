module View.Heatmap exposing (activityHeatmap)

{-| GitHub-style contribution heatmap. Renders the last 26 weeks as a
7-row grid, one cell per day, coloured by activity weight.
-}

import Dict exposing (Dict)
import Html exposing (..)
import Html.Attributes exposing (class, title)
import View.Format exposing (dateToDays)


activityHeatmap : String -> List ( String, Int ) -> Html msg
activityHeatmap today entries =
    let
        buckets : Dict Int Int
        buckets =
            List.foldl
                (\( dateStr, weight ) acc ->
                    case dateToDays dateStr of
                        Just d ->
                            Dict.update d
                                (\existing ->
                                    Just (Maybe.withDefault 0 existing + weight)
                                )
                                acc

                        Nothing ->
                            acc
                )
                Dict.empty
                entries

        maxWeight =
            Dict.values buckets
                |> List.maximum
                |> Maybe.withDefault 1

        weeksBack =
            26

        endDay =
            dateToDays today |> Maybe.withDefault 0

        startDay =
            endDay - (weeksBack * 7) + 1

        cells =
            List.range 0 (weeksBack * 7 - 1)
                |> List.map
                    (\offset ->
                        cellFor buckets maxWeight (startDay + offset)
                    )
    in
    div [ class "heatmap-wrap" ]
        [ h3 [ class "heatmap-title" ] [ text "Contribution activity" ]
        , p [ class "heatmap-subtitle" ]
            [ text "Records created per day · last 26 weeks" ]
        , div [ class "heatmap-grid" ] cells
        , div [ class "heatmap-legend" ]
            [ text "Less"
            , span [ class "heatmap-legend__swatch heatmap-cell" ] []
            , span [ class "heatmap-legend__swatch heatmap-cell heatmap-cell--l1" ] []
            , span [ class "heatmap-legend__swatch heatmap-cell heatmap-cell--l2" ] []
            , span [ class "heatmap-legend__swatch heatmap-cell heatmap-cell--l3" ] []
            , span [ class "heatmap-legend__swatch heatmap-cell heatmap-cell--l4" ] []
            , text "More"
            ]
        ]


cellFor : Dict Int Int -> Int -> Int -> Html msg
cellFor buckets maxWeight day =
    let
        weight =
            Dict.get day buckets |> Maybe.withDefault 0

        levelClass =
            if weight == 0 then
                ""

            else
                let
                    ratio =
                        toFloat weight / toFloat (max 1 maxWeight)
                in
                if ratio >= 0.75 then
                    " heatmap-cell--l4"

                else if ratio >= 0.5 then
                    " heatmap-cell--l3"

                else if ratio >= 0.25 then
                    " heatmap-cell--l2"

                else
                    " heatmap-cell--l1"

        tooltip =
            if weight == 0 then
                "No activity"

            else
                String.fromInt weight
                    ++ " record"
                    ++ (if weight == 1 then "" else "s")
    in
    span
        [ class ("heatmap-cell" ++ levelClass)
        , title tooltip
        ]
        []
