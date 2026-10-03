module View.Login exposing (brandPanel, loginCard)

{-| Login screen (brand panel + card). -}

import Html exposing (..)
import Html.Attributes as Attr exposing (class, id, type_, disabled, checked)
import Html.Events exposing (onClick, onSubmit)
import Types exposing (..)
import View.Helpers exposing (alertView, formField, onCheck, svgIcon, svgPath)
import View.Icons exposing (eccMark)


brandPanel : Html msg
brandPanel =
    aside [ class "brand-panel" ]
        [ div [ class "brand-panel__glow brand-panel__glow--1" ] []
        , div [ class "brand-panel__glow brand-panel__glow--2" ] []
        , div [ class "brand-panel__inner" ]
            [ header [ class "brand-panel__header" ]
                [ eccMark
                , div [ class "brand-panel__wordmark" ]
                    [ span [ class "brand-panel__name" ] [ text "ECC" ]
                    , span [ class "brand-panel__product" ] [ text "CRM" ]
                    ]
                ]
            , div [ class "brand-panel__hero" ]
                [ h2 [ class "brand-panel__headline" ]
                    [ text "Customer relationships, "
                    , span [ class "brand-panel__headline-accent" ]
                        [ text "secured." ]
                    ]
                , p [ class "brand-panel__lede" ]
                    [ text "The unified workspace for your team to manage accounts, deals, and conversations — with enterprise-grade protection built in." ]
                ]
            , ul [ class "trust-list" ]
                [ trustItem "SOC 2 Type II certified"
                , trustItem "256-bit AES encryption at rest"
                , trustItem "GDPR & CCPA compliant"
                ]
            , footer [ class "brand-panel__footer" ]
                [ text "© 2026 ECC. All rights reserved." ]
            ]
        ]


trustItem : String -> Html msg
trustItem label =
    li [ class "trust-item" ]
        [ span [ class "trust-check" ]
            [ svgIcon
                [ Attr.attribute "viewBox" "0 0 24 24"
                , Attr.attribute "width" "14"
                , Attr.attribute "height" "14"
                , Attr.attribute "fill" "none"
                , Attr.attribute "stroke" "currentColor"
                , Attr.attribute "stroke-width" "2.5"
                , Attr.attribute "stroke-linecap" "round"
                , Attr.attribute "stroke-linejoin" "round"
                ]
                [ svgPath "M20 6 9 17l-5-5" ]
            ]
        , text label
        ]


loginCard : Model -> Html Msg
loginCard model =
    let
        titleText =
            if model.mode == Login then
                "Sign in to ECC-CRM"

            else
                "Create your ECC account"

        subtitleText =
            if model.mode == Login then
                "Enter your credentials to access your workspace."

            else
                "Set up your account in under a minute."

        submitLabel =
            case ( model.mode, model.submitting ) of
                ( Login, True ) ->
                    "Signing in…"

                ( Login, False ) ->
                    "Sign in"

                ( Register, True ) ->
                    "Creating account…"

                ( Register, False ) ->
                    "Create account"

        switchLabel =
            if model.mode == Login then
                "Request access"

            else
                "Sign in instead"

        nextMode =
            if model.mode == Login then
                Register

            else
                Login
    in
    div [ class "auth-panel" ]
        [ div [ class "auth-panel__inner" ]
            [ header [ class "auth-header" ]
                [ h1 [ class "auth-title" ] [ text titleText ]
                , p [ class "auth-subtitle" ] [ text subtitleText ]
                ]
            , alertView model.alert
            , form [ onSubmit Submitted, Attr.novalidate True ]
                ((if model.mode == Register then
                    [ formField model
                        { id = "name"
                        , labelText = "Full name"
                        , fieldType = "text"
                        , fieldKey = NameField
                        , autocomplete = "name"
                        }
                    ]

                  else
                    []
                 )
                    ++ [ formField model
                            { id = "email"
                            , labelText = "Work email"
                            , fieldType = "email"
                            , fieldKey = EmailField
                            , autocomplete = "email"
                            }
                       , formField model
                            { id = "password"
                            , labelText = "Password"
                            , fieldType = "password"
                            , fieldKey = PasswordField
                            , autocomplete =
                                if model.mode == Login then
                                    "current-password"

                                else
                                    "new-password"
                            }
                       , div [ class "ecc-row" ]
                            [ label [ class "ecc-checkbox" ]
                                [ input
                                    [ type_ "checkbox"
                                    , checked model.form.remember
                                    , onCheck ToggledRemember
                                    ]
                                    []
                                , span [] [ text "Keep me signed in" ]
                                ]
                            ]
                       , button
                            [ class "ecc-btn"
                            , type_ "submit"
                            , disabled model.submitting
                            ]
                            [ span [ class "ecc-btn__label" ] [ text submitLabel ]
                            , span
                                [ class
                                    ("ecc-spinner"
                                        ++ (if model.submitting then
                                                " ecc-spinner--on"

                                            else
                                                ""
                                           )
                                    )
                                , Attr.attribute "aria-hidden" "true"
                                ]
                                []
                            ]
                       ]
                )
            , p [ class "auth-switch" ]
                [ text
                    (if model.mode == Login then
                        "Need an account? "

                     else
                        "Already have one? "
                    )
                , button
                    [ class "ecc-link ecc-link--strong"
                    , type_ "button"
                    , onClick (SwitchedMode nextMode)
                    ]
                    [ text switchLabel ]
                ]
            , div [ class "auth-footer" ]
                [ span [ class "auth-footer__lock" ]
                    [ svgIcon
                        [ Attr.attribute "viewBox" "0 0 24 24"
                        , Attr.attribute "width" "12"
                        , Attr.attribute "height" "12"
                        , Attr.attribute "fill" "none"
                        , Attr.attribute "stroke" "currentColor"
                        , Attr.attribute "stroke-width" "2"
                        , Attr.attribute "stroke-linecap" "round"
                        , Attr.attribute "stroke-linejoin" "round"
                        ]
                        [ Html.node "rect"
                            [ Attr.attribute "x" "3"
                            , Attr.attribute "y" "11"
                            , Attr.attribute "width" "18"
                            , Attr.attribute "height" "11"
                            , Attr.attribute "rx" "2"
                            ]
                            []
                        , svgPath "M7 11V7a5 5 0 0 1 10 0v4"
                        ]
                    ]
                , text "Protected by 256-bit encryption"
                ]
            ]
        ]
