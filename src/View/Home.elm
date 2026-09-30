module View.Home exposing (homeView)

{-| Dashboard home page. -}

import Html exposing (..)
import Html.Attributes as Attr exposing (class)
import Types exposing (..)


statCard : String -> String -> String -> Html Msg
statCard label valueText hint =
    div [ class "stat-card" ]
        [ span [ class "stat-card__label" ] [ text label ]
        , span [ class "stat-card__value" ] [ text valueText ]
        , span [ class "stat-card__hint" ] [ text hint ]
        ]


homeView : Model -> User -> Html Msg
homeView model user =
    div []
        [ h1 [ class "content__heading" ]
            [ text ("Welcome back, " ++ user.name) ]
        , p [ class "content__lede" ]
            [ text "Here's what's happening across your workspace today." ]
        , div [ class "stat-grid" ]
            [ statCard "Leads"
                (case model.leads of
                    Success data ->
                        String.fromInt data.total

                    _ ->
                        "—"
                )
                (case model.leads of
                    Success data ->
                        let
                            fresh =
                                List.length (List.filter (\l -> l.status == "New") data.items)
                        in
                        String.fromInt fresh ++ " new"

                    _ ->
                        "Loading…"
                )
            , statCard "Students"
                (case model.students of
                    Success data ->
                        String.fromInt data.total

                    _ ->
                        "—"
                )
                (case model.students of
                    Success data ->
                        let
                            approved =
                                List.length (List.filter (\s -> s.visaStatus == "Approved") data.items)

                            pending =
                                List.length (List.filter (\s -> s.visaStatus == "Pending") data.items)
                        in
                        String.fromInt approved ++ " approved · " ++ String.fromInt pending ++ " pending"

                    _ ->
                        "Loading…"
                )
            , statCard "Schools"
                (case model.schools of
                    Success data ->
                        String.fromInt data.total

                    _ ->
                        "—"
                )
                (case model.schools of
                    Success data ->
                        let
                            signed =
                                List.length (List.filter (\s -> s.contractStatus == "Signed") data.items)
                        in
                        String.fromInt signed ++ " signed contracts"

                    _ ->
                        "Loading…"
                )
            , statCard "Agents"
                (case model.agents of
                    Success data ->
                        String.fromInt data.total

                    _ ->
                        "—"
                )
                (case model.agents of
                    Success data ->
                        let
                            active =
                                List.length (List.filter (\a -> a.agentStatus == "Active") data.items)
                        in
                        String.fromInt active ++ " active"

                    _ ->
                        "Loading…"
                )
            ]
        , div [ class "content__section" ]
            [ h2 [ class "content__section-title" ] [ text "Recent activity" ]
            , p [ class "content__empty" ]
                [ text "No activity yet. Once you add leads and students, updates will appear here." ]
            ]
        ]
