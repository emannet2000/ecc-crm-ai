module View.Pipeline exposing (pipelineView)

{-| Horizontal pipeline stepper, Flor-style: numbered circles with
connector borders, active step highlighted in gold, done steps in
green. Used on the Home dashboard to summarise the deal pipeline.
-}

import Html exposing (..)
import Html.Attributes exposing (class)


type alias Step =
    { label : String
    , count : Int
    }


pipelineView : List Step -> Int -> Html msg
pipelineView steps activeIdx =
    div [ class "pipeline" ]
        (List.indexedMap (stepView activeIdx) steps)


stepView : Int -> Int -> Step -> Html msg
stepView activeIdx idx step =
    let
        stateClass =
            if idx < activeIdx then
                "pipe-step done"

            else if idx == activeIdx then
                "pipe-step active"

            else
                "pipe-step"

        dotLabel =
            if idx < activeIdx then
                "✓"

            else
                String.fromInt (idx + 1)

        countText =
            String.fromInt step.count
                ++ (if step.count == 1 then
                        " deal"

                    else
                        " deals"
                   )
    in
    div [ class stateClass ]
        [ div [ class "pipe-num" ] [ text dotLabel ]
        , div [ class "pipe-label" ] [ text step.label ]
        , div [ class "pipe-count" ] [ text countText ]
        ]
