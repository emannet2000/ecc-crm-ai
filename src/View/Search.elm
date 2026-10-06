module View.Search exposing (searchView)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick, onInput)
import Types exposing (..)
import Url
import View.Icons exposing (iconSearch)


resultPath : SearchResult -> String
resultPath result =
    if result.entity == "tasks" then
        "/tasks"

    else
        "/" ++ result.entity ++ "/" ++ Url.percentEncode result.id


searchView : Model -> Html Msg
searchView model =
    div [ class "global-search" ]
        [ span [ class "global-search__icon", attribute "aria-hidden" "true" ] [ iconSearch ]
        , input
            [ id "workspace-search"
            , type_ "search"
            , value model.globalQuery
            , onInput UpdatedGlobalQuery
            , placeholder "Search workspace…"
            , maxlength 200
            , attribute "aria-label" "Search all CRM records"
            , attribute "aria-controls" "global-search-results"
            , attribute "aria-expanded"
                (if model.globalQuery == "" then
                    "false"

                 else
                    "true"
                )
            ]
            []
        , if model.globalQuery == "" then
            text ""

          else
            div [ class "global-search__panel", id "global-search-results" ]
                [ div [ class "global-search__heading" ]
                    [ strong [] [ text "Search results" ]
                    , button [ type_ "button", onClick ClosedGlobalSearch, attribute "aria-label" "Close search" ] [ text "Close" ]
                    ]
                , case model.globalResults of
                    Success data ->
                        div []
                            (List.map
                                (\result ->
                                    a [ class "global-search__result", href (resultPath result) ]
                                        [ strong [] [ text result.title ]
                                        , span [] [ text (result.entity ++ " · " ++ result.subtitle) ]
                                        ]
                                )
                                data.results
                                ++ [ if List.isEmpty data.results then
                                        p [ class "global-search__message" ] [ text "No matching records." ]

                                     else if data.truncated then
                                        p [ class "global-search__message" ] [ text "Showing 30 results. Refine your search to see more." ]

                                     else
                                        text ""
                                   ]
                            )

                    Failure message ->
                        p [ class "global-search__message", attribute "role" "alert" ] [ text message ]

                    Loading ->
                        p [ class "global-search__message", attribute "role" "status" ] [ text "Searching…" ]

                    NotAsked ->
                        p [ class "global-search__message" ] [ text "Type at least two characters." ]
                ]
        ]
