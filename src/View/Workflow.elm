module View.Workflow exposing (workflowView)

{-| Vertical workflow progress indicator.
Renders a list of stages with the current one highlighted, the ones
before it marked done, and the ones after it left pending.
-}

import Html exposing (..)
import Html.Attributes exposing (class)


workflowView : List String -> String -> Html msg
workflowView stages current =
    let
        currentIdx =
            stages
                |> List.indexedMap Tuple.pair
                |> List.filter (\( _, s ) -> s == current)
                |> List.head
                |> Maybe.map Tuple.first
    in
    div [ class "workflow" ]
        (List.indexedMap (stepView currentIdx) stages)


stepView : Maybe Int -> Int -> String -> Html msg
stepView currentIdx idx stage =
    let
        ( stateClass, dotContent, hint ) =
            case currentIdx of
                Just ci ->
                    if idx < ci then
                        ( "wf-step done", "✓", "Completed" )

                    else if idx == ci then
                        ( "wf-step current", String.fromInt (idx + 1), "Current stage" )

                    else
                        ( "wf-step", String.fromInt (idx + 1), "Pending" )

                Nothing ->
                    ( "wf-step", String.fromInt (idx + 1), "" )
    in
    div [ class stateClass ]
        [ div [ class "wf-dot" ] [ text dotContent ]
        , div [ class "wf-content" ]
            [ div [ class "wf-title" ] [ text stage ]
            , div [ class "wf-time" ] [ text hint ]
            ]
        ]
