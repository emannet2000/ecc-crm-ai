module Views exposing (view)

import Html exposing (..)
import Html.Attributes as Attr exposing (class, id, type_, placeholder, value, disabled, checked, href, for)
import Html.Events exposing (onClick, onInput, onSubmit)
import Json.Decode as D
import Types exposing (..)


-- ================= HELPERS =================


svgIcon : List (Html.Attribute msg) -> List (Html msg) -> Html msg
svgIcon =
    Html.node "svg"


svgPath : String -> Html msg
svgPath d =
    Html.node "path" [ Attr.attribute "d" d ] []


onCheck : (Bool -> msg) -> Html.Attribute msg
onCheck toMsg =
    Html.Events.on "change"
        (D.map toMsg (D.at [ "target", "checked" ] D.bool))


onEnter : msg -> Html.Attribute msg
onEnter msg =
    Html.Events.on "keydown"
        (D.field "key" D.string
            |> D.andThen
                (\key ->
                    if key == "Enter" then
                        D.succeed msg

                    else
                        D.fail "not enter"
                )
        )


fieldError : Field -> Model -> Maybe String
fieldError field model =
    model.errors
        |> List.filter (\( f, _ ) -> f == field)
        |> List.head
        |> Maybe.map Tuple.second


initials : String -> String
initials name =
    name
        |> String.words
        |> List.map (String.left 1)
        |> List.take 2
        |> String.concat
        |> String.toUpper


-- ================= BRAND MARK =================


eccMark : Html msg
eccMark =
    div [ class "ecc-mark" ]
        [ svgIcon
            [ Attr.attribute "viewBox" "0 0 40 40"
            , Attr.attribute "width" "40"
            , Attr.attribute "height" "40"
            , Attr.attribute "fill" "none"
            ]
            [ Html.node "rect"
                [ Attr.attribute "x" "0"
                , Attr.attribute "y" "0"
                , Attr.attribute "width" "40"
                , Attr.attribute "height" "40"
                , Attr.attribute "rx" "12"
                , Attr.attribute "fill" "url(#eccGrad)"
                ]
                []
            , Html.node "text"
                [ Attr.attribute "x" "20"
                , Attr.attribute "y" "26"
                , Attr.attribute "text-anchor" "middle"
                , Attr.attribute "font-family" "Inter, sans-serif"
                , Attr.attribute "font-size" "16"
                , Attr.attribute "font-weight" "700"
                , Attr.attribute "fill" "white"
                , Attr.attribute "letter-spacing" "0.5"
                ]
                [ text "ECC" ]
            , Html.node "defs"
                []
                [ Html.node "linearGradient"
                    [ Attr.attribute "id" "eccGrad"
                    , Attr.attribute "x1" "0"
                    , Attr.attribute "y1" "0"
                    , Attr.attribute "x2" "40"
                    , Attr.attribute "y2" "40"
                    , Attr.attribute "gradientUnits" "userSpaceOnUse"
                    ]
                    [ Html.node "stop"
                        [ Attr.attribute "offset" "0"
                        , Attr.attribute "stop-color" "#6366F1"
                        ]
                        []
                    , Html.node "stop"
                        [ Attr.attribute "offset" "1"
                        , Attr.attribute "stop-color" "#06B6D4"
                        ]
                        []
                    ]
                ]
            ]
        ]


-- ================= LOGIN: BRAND PANEL =================


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


-- ================= LOGIN: ALERT =================


alertView : Maybe Alert -> Html msg
alertView maybeAlert =
    case maybeAlert of
        Nothing ->
            text ""

        Just alert ->
            let
                cls =
                    case alert.kind of
                        AlertError ->
                            "ecc-alert ecc-alert--error"

                        AlertSuccess ->
                            "ecc-alert ecc-alert--success"
            in
            div [ class cls, Attr.attribute "role" "alert" ]
                [ text alert.message ]


-- ================= LOGIN: FORM FIELD =================


type alias FieldConfig =
    { id : String
    , labelText : String
    , fieldType : String
    , fieldKey : Field
    , autocomplete : String
    }


formField : Model -> FieldConfig -> Html Msg
formField model cfg =
    let
        val =
            case cfg.fieldKey of
                NameField ->
                    model.form.name

                EmailField ->
                    model.form.email

                PasswordField ->
                    model.form.password

        err =
            fieldError cfg.fieldKey model

        isPassword =
            cfg.fieldKey == PasswordField

        inputType =
            if isPassword && model.showPassword then
                "text"

            else
                cfg.fieldType

        containerClass =
            case err of
                Just _ ->
                    "ecc-field ecc-field--error"

                Nothing ->
                    "ecc-field"
    in
    div [ class containerClass ]
        ([ input
            [ id cfg.id
            , Attr.name cfg.id
            , type_ inputType
            , placeholder " "
            , Attr.attribute "autocomplete" cfg.autocomplete
            , value val
            , onInput (UpdatedField cfg.fieldKey)
            ]
            []
         , label [ for cfg.id ] [ text cfg.labelText ]
         ]
            ++ (if isPassword then
                    [ button
                        [ type_ "button"
                        , class "ecc-field__toggle"
                        , Attr.attribute "aria-label"
                            (if model.showPassword then
                                "Hide password"

                             else
                                "Show password"
                            )
                        , onClick ToggledShowPassword
                        ]
                        [ if model.showPassword then
                            svgIcon
                                [ Attr.attribute "viewBox" "0 0 24 24"
                                , Attr.attribute "width" "18"
                                , Attr.attribute "height" "18"
                                , Attr.attribute "fill" "none"
                                , Attr.attribute "stroke" "currentColor"
                                , Attr.attribute "stroke-width" "1.8"
                                , Attr.attribute "stroke-linecap" "round"
                                , Attr.attribute "stroke-linejoin" "round"
                                ]
                                [ svgPath "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                                , svgPath "M1 1l22 22"
                                ]

                          else
                            svgIcon
                                [ Attr.attribute "viewBox" "0 0 24 24"
                                , Attr.attribute "width" "18"
                                , Attr.attribute "height" "18"
                                , Attr.attribute "fill" "none"
                                , Attr.attribute "stroke" "currentColor"
                                , Attr.attribute "stroke-width" "1.8"
                                , Attr.attribute "stroke-linecap" "round"
                                , Attr.attribute "stroke-linejoin" "round"
                                ]
                                [ svgPath "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"
                                , Html.node "circle"
                                    [ Attr.attribute "cx" "12"
                                    , Attr.attribute "cy" "12"
                                    , Attr.attribute "r" "3"
                                    ]
                                    []
                                ]
                        ]
                    ]

                else
                    []
               )
            ++ (case err of
                    Just msg ->
                        [ p [ class "ecc-field__message" ] [ text msg ] ]

                    Nothing ->
                        []
               )
        )


-- ================= LOGIN: CARD =================


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
            if model.submitting then
                "Signing in…"

            else if model.mode == Login then
                "Sign in"

            else
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
                            , a [ class "ecc-link", Attr.href "#" ]
                                [ text "Forgot password?" ]
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


-- ================= APP: ICONS =================


iconHome : Html Msg
iconHome =
    svgIcon
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "18"
        , Attr.attribute "height" "18"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "1.8"
        , Attr.attribute "stroke-linecap" "round"
        , Attr.attribute "stroke-linejoin" "round"
        ]
        [ svgPath "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        , svgPath "M9 22V12h6v10"
        ]


iconContacts : Html Msg
iconContacts =
    svgIcon
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "18"
        , Attr.attribute "height" "18"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "1.8"
        , Attr.attribute "stroke-linecap" "round"
        , Attr.attribute "stroke-linejoin" "round"
        ]
        [ svgPath "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        , Html.node "circle"
            [ Attr.attribute "cx" "9"
            , Attr.attribute "cy" "7"
            , Attr.attribute "r" "4"
            ]
            []
        , svgPath "M23 21v-2a4 4 0 0 0-3-3.87"
        , svgPath "M16 3.13a4 4 0 0 1 0 7.75"
        ]


iconDeals : Html Msg
iconDeals =
    svgIcon
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "18"
        , Attr.attribute "height" "18"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "1.8"
        , Attr.attribute "stroke-linecap" "round"
        , Attr.attribute "stroke-linejoin" "round"
        ]
        [ svgPath "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
        ]


iconTasks : Html Msg
iconTasks =
    svgIcon
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "18"
        , Attr.attribute "height" "18"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "1.8"
        , Attr.attribute "stroke-linecap" "round"
        , Attr.attribute "stroke-linejoin" "round"
        ]
        [ svgPath "M9 11l3 3L22 4"
        , svgPath "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
        ]


iconReports : Html Msg
iconReports =
    svgIcon
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "18"
        , Attr.attribute "height" "18"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "1.8"
        , Attr.attribute "stroke-linecap" "round"
        , Attr.attribute "stroke-linejoin" "round"
        ]
        [ svgPath "M18 20V10M12 20V4M6 20v-6"
        ]


iconSettings : Html Msg
iconSettings =
    svgIcon
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "18"
        , Attr.attribute "height" "18"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "1.8"
        , Attr.attribute "stroke-linecap" "round"
        , Attr.attribute "stroke-linejoin" "round"
        ]
        [ Html.node "circle"
            [ Attr.attribute "cx" "12"
            , Attr.attribute "cy" "12"
            , Attr.attribute "r" "3"
            ]
            []
        , svgPath "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
        ]


iconSignOut : Html Msg
iconSignOut =
    svgIcon
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "16"
        , Attr.attribute "height" "16"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "1.8"
        , Attr.attribute "stroke-linecap" "round"
        , Attr.attribute "stroke-linejoin" "round"
        ]
        [ svgPath "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        , svgPath "M16 17l5-5-5-5"
        , svgPath "M21 12H9"
        ]


iconEdit : Html msg
iconEdit =
    svgIcon
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "15"
        , Attr.attribute "height" "15"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "1.8"
        , Attr.attribute "stroke-linecap" "round"
        , Attr.attribute "stroke-linejoin" "round"
        ]
        [ svgPath "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        , svgPath "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        ]


iconTrash : Html msg
iconTrash =
    svgIcon
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "15"
        , Attr.attribute "height" "15"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "1.8"
        , Attr.attribute "stroke-linecap" "round"
        , Attr.attribute "stroke-linejoin" "round"
        ]
        [ svgPath "M3 6h18"
        , svgPath "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
        , svgPath "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        ]


iconBack : Html msg
iconBack =
    svgIcon
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "16"
        , Attr.attribute "height" "16"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "2"
        , Attr.attribute "stroke-linecap" "round"
        , Attr.attribute "stroke-linejoin" "round"
        ]
        [ svgPath "M19 12H5"
        , svgPath "M12 19l-7-7 7-7"
        ]


iconMail : Html msg
iconMail =
    svgIcon
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "14"
        , Attr.attribute "height" "14"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "1.8"
        , Attr.attribute "stroke-linecap" "round"
        , Attr.attribute "stroke-linejoin" "round"
        ]
        [ svgPath "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
        , svgPath "M22 6l-10 7L2 6"
        ]


iconPhone : Html msg
iconPhone =
    svgIcon
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "14"
        , Attr.attribute "height" "14"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "1.8"
        , Attr.attribute "stroke-linecap" "round"
        , Attr.attribute "stroke-linejoin" "round"
        ]
        [ svgPath "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        ]


iconCalendar : Html msg
iconCalendar =
    svgIcon
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "14"
        , Attr.attribute "height" "14"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "1.8"
        , Attr.attribute "stroke-linecap" "round"
        , Attr.attribute "stroke-linejoin" "round"
        ]
        [ Html.node "rect"
            [ Attr.attribute "x" "3"
            , Attr.attribute "y" "4"
            , Attr.attribute "width" "18"
            , Attr.attribute "height" "18"
            , Attr.attribute "rx" "2"
            ]
            []
        , svgPath "M16 2v4M8 2v4M3 10h18"
        ]


iconPin : Html msg
iconPin =
    svgIcon
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "14"
        , Attr.attribute "height" "14"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "1.8"
        , Attr.attribute "stroke-linecap" "round"
        , Attr.attribute "stroke-linejoin" "round"
        ]
        [ svgPath "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        , Html.node "circle"
            [ Attr.attribute "cx" "12"
            , Attr.attribute "cy" "10"
            , Attr.attribute "r" "3"
            ]
            []
        ]


iconUserTiny : Html msg
iconUserTiny =
    svgIcon
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "11"
        , Attr.attribute "height" "11"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "2"
        , Attr.attribute "stroke-linecap" "round"
        , Attr.attribute "stroke-linejoin" "round"
        ]
        [ svgPath "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        , Html.node "circle"
            [ Attr.attribute "cx" "12"
            , Attr.attribute "cy" "7"
            , Attr.attribute "r" "4"
            ]
            []
        ]


iconLock : Html msg
iconLock =
    svgIcon
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "14"
        , Attr.attribute "height" "14"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "1.8"
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


-- ================= APP: SIDEBAR =================


navItem : Route -> Route -> String -> Html Msg -> Html Msg
navItem current target label icon =
    let
        cls =
            if current == target then
                "nav-item nav-item--active"

            else
                "nav-item"
    in
    button
        [ class cls
        , type_ "button"
        , onClick (NavigatedTo target)
        ]
        [ span [ class "nav-item__icon" ] [ icon ]
        , span [ class "nav-item__label" ] [ text label ]
        ]


sidebar : Model -> User -> Html Msg
sidebar model user =
    let
        effectiveRoute =
            case model.route of
                ContactDetail _ ->
                    Contacts

                DealDetail _ ->
                    Deals

                other ->
                    other
    in
    aside [ class "sidebar" ]
        [ div [ class "sidebar__brand" ]
            [ eccMark
            , div [ class "sidebar__wordmark" ]
                [ span [ class "sidebar__name" ] [ text "ECC" ]
                , span [ class "sidebar__product" ] [ text "CRM" ]
                ]
            ]
        , nav [ class "sidebar__nav" ]
            [ span [ class "sidebar__section-label" ] [ text "Workspace" ]
            , navItem effectiveRoute Home "Home" iconHome
            , navItem effectiveRoute Contacts "Contacts" iconContacts
            , navItem effectiveRoute Deals "Deals" iconDeals
            , navItem effectiveRoute Tasks "Tasks" iconTasks
            , navItem effectiveRoute Reports "Reports" iconReports
            ]
        , nav [ class "sidebar__nav sidebar__nav--bottom" ]
            [ navItem effectiveRoute Settings "Settings" iconSettings ]
        , div [ class "sidebar__user" ]
            [ div [ class "sidebar__avatar" ]
                [ text (String.left 1 user.name) ]
            , div [ class "sidebar__user-info" ]
                [ span [ class "sidebar__user-name" ] [ text user.name ]
                , span [ class "sidebar__user-email" ] [ text user.email ]
                ]
            ]
        , button
            [ class "sidebar__signout-btn"
            , type_ "button"
            , onClick LoggedOut
            ]
            [ iconSignOut
            , span [] [ text "Sign out" ]
            ]
        ]


-- ================= APP: TOPBAR =================


topbar : Model -> User -> Html Msg
topbar _ user =
    header [ class "topbar" ]
        [ div [ class "topbar__search" ]
            [ svgIcon
                [ Attr.attribute "viewBox" "0 0 24 24"
                , Attr.attribute "width" "16"
                , Attr.attribute "height" "16"
                , Attr.attribute "fill" "none"
                , Attr.attribute "stroke" "currentColor"
                , Attr.attribute "stroke-width" "1.8"
                , Attr.attribute "stroke-linecap" "round"
                , Attr.attribute "stroke-linejoin" "round"
                ]
                [ Html.node "circle"
                    [ Attr.attribute "cx" "11"
                    , Attr.attribute "cy" "11"
                    , Attr.attribute "r" "8"
                    ]
                    []
                , svgPath "M21 21l-4.35-4.35"
                ]
            , input
                [ type_ "text"
                , placeholder "Search contacts, deals, tasks…"
                , class "topbar__search-input"
                ]
                []
            , span [ class "topbar__search-kbd" ] [ text "⌘K" ]
            ]
        , div [ class "topbar__right" ]
            [ button
                [ class "topbar__icon-btn topbar__icon-btn--notify"
                , type_ "button"
                , Attr.attribute "aria-label" "Notifications"
                ]
                [ svgIcon
                    [ Attr.attribute "viewBox" "0 0 24 24"
                    , Attr.attribute "width" "18"
                    , Attr.attribute "height" "18"
                    , Attr.attribute "fill" "none"
                    , Attr.attribute "stroke" "currentColor"
                    , Attr.attribute "stroke-width" "1.8"
                    , Attr.attribute "stroke-linecap" "round"
                    , Attr.attribute "stroke-linejoin" "round"
                    ]
                    [ svgPath "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                    , svgPath "M13.73 21a2 2 0 0 1-3.46 0"
                    ]
                ]
            , div [ class "topbar__avatar" ]
                [ text (String.left 1 user.name) ]
            ]
        ]


-- ================= APP: PAGES =================


pageTitle : Model -> String
pageTitle model =
    case model.route of
        Home ->
            "Home"

        Contacts ->
            "Contacts"

        ContactDetail _ ->
            "Contact"

        Deals ->
            "Deals"

        DealDetail _ ->
            "Deal"

        Tasks ->
            "Tasks"

        Reports ->
            "Reports"

        Settings ->
            "Settings"


statCard : String -> String -> String -> Html Msg
statCard label valueText hint =
    div [ class "stat-card" ]
        [ span [ class "stat-card__label" ] [ text label ]
        , span [ class "stat-card__value" ] [ text valueText ]
        , span [ class "stat-card__hint" ] [ text hint ]
        ]


homeView : Model -> User -> Html Msg
homeView model user =
    let
        contactsLoaded =
            case model.contacts of
                Success _ ->
                    True

                _ ->
                    False

        contactsCount =
            case model.contacts of
                Success data ->
                    List.length data.items

                _ ->
                    0

        dealsLoaded =
            case model.deals of
                Success _ ->
                    True

                _ ->
                    False

        dealItems =
            case model.deals of
                Success data ->
                    data.items

                _ ->
                    []

        openDeals =
            List.filter (\d -> d.stage /= "Won" && d.stage /= "Lost") dealItems

        openValue =
            openDeals |> List.map .value |> List.sum

        wonDeals =
            List.filter (\d -> d.stage == "Won") dealItems

        wonValue =
            wonDeals |> List.map .value |> List.sum
    in
    div []
        [ h1 [ class "content__heading" ]
            [ text ("Welcome back, " ++ user.name) ]
        , p [ class "content__lede" ]
            [ text "Here's what's happening across your workspace today." ]
        , div [ class "stat-grid" ]
            [ statCard "Open deals"
                (if dealsLoaded then
                    String.fromInt (List.length openDeals)

                 else
                    "—"
                )
                (if dealsLoaded then
                    formatCurrency openValue ++ " in pipeline"

                 else
                    "Loading…"
                )
            , statCard "Contacts"
                (if contactsLoaded then
                    String.fromInt contactsCount

                 else
                    "—"
                )
                "Across all stages"
            , statCard "Tasks due" "7" "2 overdue"
            , statCard "Won revenue"
                (if dealsLoaded then
                    formatCurrency wonValue

                 else
                    "—"
                )
                (if dealsLoaded then
                    String.fromInt (List.length wonDeals) ++ " deals closed"

                 else
                    "Loading…"
                )
            ]
        , div [ class "content__section" ]
            [ h2 [ class "content__section-title" ] [ text "Recent activity" ]
            , p [ class "content__empty" ]
                [ text "No activity yet. Once you add contacts and deals, updates will appear here." ]
            ]
        ]


-- ================= CONTACTS LIST =================


stageBadge : String -> Html Msg
stageBadge stage =
    let
        cls =
            case String.toLower stage of
                "customer" ->
                    "badge badge--customer"

                "qualified" ->
                    "badge badge--qualified"

                "proposal" ->
                    "badge badge--proposal"

                "lead" ->
                    "badge badge--lead"

                "negotiation" ->
                    "badge badge--negotiation"

                "won" ->
                    "badge badge--won"

                "lost" ->
                    "badge badge--lost"

                _ ->
                    "badge"
    in
    span [ class cls ] [ text stage ]


contactRow : Contact -> Html Msg
contactRow c =
    tr [ class "contact-row", onClick (OpenedContactDetail c) ]
        [ td []
            [ div [ class "contact-name-cell" ]
                [ div [ class "contact-avatar" ] [ text (initials c.name) ]
                , div [ class "contact-name-info" ]
                    [ span [ class "contact-name" ] [ text c.name ]
                    , span [ class "contact-email" ] [ text c.email ]
                    ]
                ]
            ]
        , td [] [ text c.company ]
        , td [] [ stageBadge c.stage ]
        , td [ class "contact-date" ] [ text c.lastContact ]
        , td [ class "contact-actions-cell" ]
            [ button
                [ class "row-action"
                , type_ "button"
                , Attr.title "Edit"
                , Attr.attribute "aria-label" ("Edit " ++ c.name)
                , Html.Events.stopPropagationOn "click"
                    (D.succeed ( OpenedEditContact c, True ))
                ]
                [ iconEdit ]
            , button
                [ class "row-action row-action--danger"
                , type_ "button"
                , Attr.title "Delete"
                , Attr.attribute "aria-label" ("Delete " ++ c.name)
                , Html.Events.stopPropagationOn "click"
                    (D.succeed ( RequestedDeleteContact c, True ))
                ]
                [ iconTrash ]
            ]
        ]



contactsSkeleton : Html Msg
contactsSkeleton =
    div []
        [ div [ class "page-toolbar" ]
            [ div [ class "page-toolbar__search" ]
                [ input [ type_ "text", placeholder "Search contacts…", disabled True ] [] ]
            ]
        , div [ class "table-wrap" ]
            (List.repeat 6
                (div [ class "skeleton-row" ]
                    [ div [ class "skeleton-avatar" ] []
                    , div [ class "skeleton-line skeleton-line--medium" ] []
                    , div [ class "skeleton-line skeleton-line--short" ] []
                    ]
                )
            )
        ]


dealsSkeleton : Html Msg
dealsSkeleton =
    div [ class "pipeline-board" ]
        (List.repeat 4
            (div [ class "pipeline-col" ]
                [ div [ class "skeleton-line skeleton-line--short" ] []
                , div [ class "skeleton-line skeleton-line--medium" ] []
                ]
            )
        )


tasksSkeleton : Html Msg
tasksSkeleton =
    div []
        [ div [ class "page-toolbar" ]
            [ div [ class "page-toolbar__search" ]
                [ input [ type_ "text", placeholder "Search tasks…", disabled True ] [] ]
            ]
        , div [ class "table-wrap" ]
            (List.repeat 5
                (div [ class "skeleton-row" ]
                    [ div [ class "skeleton-line skeleton-line--long" ] []
                    , div [ class "skeleton-line skeleton-line--short" ] []
                    ]
                )
            )
        ]


paginationBar : Int -> Int -> Int -> (Int -> Msg) -> Html Msg
paginationBar total offset limit toMsg =
    let
        from =
            if total == 0 then
                0

            else
                offset + 1

        to =
            min total (offset + limit)

        canPrev =
            offset > 0

        canNext =
            offset + limit < total
    in
    if total <= limit then
        p [ class "page-toolbar__summary" ]
            [ text (String.fromInt total ++ " result" ++ (if total == 1 then "" else "s")) ]

    else
        div [ class "pagination" ]
            [ span [ class "pagination__info" ]
                [ text (String.fromInt from ++ "–" ++ String.fromInt to ++ " of " ++ String.fromInt total) ]
            , div [ class "pagination__btns" ]
                [ button
                    [ type_ "button"
                    , class "ecc-btn ecc-btn--ghost ecc-btn--inline"
                    , disabled (not canPrev)
                    , onClick (toMsg (max 0 (offset - limit)))
                    ]
                    [ text "Previous" ]
                , button
                    [ type_ "button"
                    , class "ecc-btn ecc-btn--ghost ecc-btn--inline"
                    , disabled (not canNext)
                    , onClick (toMsg (offset + limit))
                    ]
                    [ text "Next" ]
                ]
            ]


matchesQuery : String -> Contact -> Bool
matchesQuery q c =
    let
        needle =
            q |> String.toLower |> String.trim
    in
    String.isEmpty needle
        || String.contains needle (String.toLower c.name)
        || String.contains needle (String.toLower c.email)
        || String.contains needle (String.toLower c.company)


contactsView : Model -> Html Msg
contactsView model =
    case model.contacts of
        NotAsked ->
            contactsSkeleton

        Loading ->
            contactsSkeleton

        Failure msg ->
            div [ class "content__empty-block" ]
                [ text ("Could not load contacts: " ++ msg) ]

        Success data ->
            let
                filtered =
                    data.items

                count =
                    List.length filtered

                isQueryEmpty =
                    String.isEmpty (String.trim data.query)
            in
            div []
                [ div [ class "page-toolbar" ]
                    [ div [ class "page-toolbar__search" ]
                        [ svgIcon
                            [ Attr.attribute "viewBox" "0 0 24 24"
                            , Attr.attribute "width" "16"
                            , Attr.attribute "height" "16"
                            , Attr.attribute "fill" "none"
                            , Attr.attribute "stroke" "currentColor"
                            , Attr.attribute "stroke-width" "1.8"
                            , Attr.attribute "stroke-linecap" "round"
                            , Attr.attribute "stroke-linejoin" "round"
                            ]
                            [ Html.node "circle"
                                [ Attr.attribute "cx" "11"
                                , Attr.attribute "cy" "11"
                                , Attr.attribute "r" "8"
                                ]
                                []
                            , svgPath "M21 21l-4.35-4.35"
                            ]
                        , input
                            [ type_ "text"
                            , placeholder "Search contacts…"
                            , value data.query
                            , onInput UpdatedContactsQuery
                            ]
                            []
                        ]
                    , button
                        [ class "ecc-btn ecc-btn--inline"
                        , type_ "button"
                        , onClick OpenedAddContact
                        ]
                        [ text "Add contact" ]
                    ]
                , if List.isEmpty filtered then
                    div [ class "empty-state" ]
                        [ div [ class "empty-state__icon" ]
                            [ svgIcon
                                [ Attr.attribute "viewBox" "0 0 24 24"
                                , Attr.attribute "width" "22"
                                , Attr.attribute "height" "22"
                                , Attr.attribute "fill" "none"
                                , Attr.attribute "stroke" "currentColor"
                                , Attr.attribute "stroke-width" "1.8"
                                , Attr.attribute "stroke-linecap" "round"
                                , Attr.attribute "stroke-linejoin" "round"
                                ]
                                [ svgPath "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                                , Html.node "circle"
                                    [ Attr.attribute "cx" "9"
                                    , Attr.attribute "cy" "7"
                                    , Attr.attribute "r" "4"
                                    ]
                                    []
                                , svgPath "M23 21v-2a4 4 0 0 0-3-3.87"
                                , svgPath "M16 3.13a4 4 0 0 1 0 7.75"
                                ]
                            ]
                        , h3 [ class "empty-state__title" ]
                            [ text
                                (if isQueryEmpty then
                                    "No contacts yet"

                                 else
                                    "No matches found"
                                )
                            ]
                        , p [ class "empty-state__desc" ]
                            [ text
                                (if isQueryEmpty then
                                    "Add your first contact to start building your CRM."

                                 else
                                    "Try a different search term or clear the filter."
                                )
                            ]
                        , if isQueryEmpty then
                            div [ class "empty-state__action" ]
                                [ button
                                    [ class "ecc-btn ecc-btn--inline"
                                    , type_ "button"
                                    , onClick OpenedAddContact
                                    ]
                                    [ text "Add your first contact" ]
                                ]

                          else
                            text ""
                        ]

                  else
                    div [ class "table-wrap" ]
                        [ table [ class "data-table" ]
                            [ thead []
                                [ tr []
                                    [ th [] [ text "Name" ]
                                    , th [] [ text "Company" ]
                                    , th [] [ text "Stage" ]
                                    , th [] [ text "Last contact" ]
                                    , th [ class "th-actions" ] [ text "" ]
                                    ]
                                ]
                            , tbody [] (List.map contactRow filtered)
                            ]
                        ]
                , paginationBar data.total data.offset data.limit ContactsPageChanged
                ]


-- ================= DEALS PIPELINE =================


dealStageOptions : List String
dealStageOptions =
    [ "Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost" ]


formatCurrency : Float -> String
formatCurrency v =
    let
        rounded =
            round v

        grouped =
            String.fromInt (abs rounded)
                |> String.reverse
                |> String.toList
                |> List.indexedMap
                    (\i c ->
                        if i /= 0 && modBy 3 i == 0 then
                            [ ',', c ]

                        else
                            [ c ]
                    )
                |> List.concat
                |> List.reverse
                |> String.fromList

        sign =
            if rounded < 0 then
                "-"

            else
                ""
    in
    sign ++ "$" ++ grouped


stageNeighbors : String -> ( Maybe String, Maybe String )
stageNeighbors stage =
    let
        idx =
            dealStageOptions
                |> List.indexedMap Tuple.pair
                |> List.filter (\( _, s ) -> s == stage)
                |> List.head
                |> Maybe.map Tuple.first
                |> Maybe.withDefault 0
    in
    ( List.drop (idx - 1) dealStageOptions |> List.head
    , List.drop (idx + 1) dealStageOptions |> List.head
    )


dealStageClass : String -> String
dealStageClass stage =
    case String.toLower stage of
        "lead" ->
            "pipeline-col--lead"

        "qualified" ->
            "pipeline-col--qualified"

        "proposal" ->
            "pipeline-col--proposal"

        "negotiation" ->
            "pipeline-col--negotiation"

        "won" ->
            "pipeline-col--won"

        "lost" ->
            "pipeline-col--lost"

        _ ->
            "pipeline-col--lead"


contactList : Model -> List Contact
contactList model =
    case model.contacts of
        Success data ->
            data.items

        _ ->
            []


contactById : List Contact -> String -> Maybe Contact
contactById contacts id =
    if String.isEmpty id then
        Nothing

    else
        contacts
            |> List.filter (\c -> c.id == id)
            |> List.head


dealCard : List Contact -> Maybe String -> Deal -> Html Msg
dealCard contacts movingId d =
    let
        isMoving =
            movingId == Just d.id

        ( prevStage, nextStage ) =
            stageNeighbors d.stage

        cardClass =
            if isMoving then
                "deal-card deal-card--moving"

            else
                "deal-card"

        valueClass =
            if d.value == 0 then
                "deal-card__value deal-card__value--zero"

            else
                "deal-card__value"

        metaItems =
            List.filterMap identity
                [ if String.isEmpty d.closeDate then
                    Nothing

                  else
                    Just
                        (span [ class "deal-card__meta-item" ]
                            [ span [ class "deal-card__meta-icon" ] [ iconCalendar ]
                            , text d.closeDate
                            ]
                        )

                , if String.isEmpty d.owner then
                    Nothing

                  else
                    Just
                        (span [ class "deal-card__meta-item" ]
                            [ span [ class "deal-card__meta-icon" ] [ iconUserTiny ]
                            , text d.owner
                            ]
                        )
                ]
                |> List.intersperse
                    (span [ class "deal-card__meta-sep" ] [ text "·" ])

        linkedContact =
            contactById contacts d.contactId
    in
    div [ class cardClass ]
        [ div [ class "deal-card__header" ]
            [ span
                [ class "deal-card__title deal-card__title--link"
                , Attr.attribute "role" "button"
                , Attr.attribute "tabindex" "0"
                , Attr.title ("Open " ++ d.title)
                , onClick (OpenedDealDetail d)
                ]
                [ text d.title ]
            , div [ class "deal-card__menu" ]
                [ button
                    [ class "row-action"
                    , type_ "button"
                    , Attr.title "Edit"
                    , Attr.attribute "aria-label" ("Edit " ++ d.title)
                    , onClick (OpenedEditDeal d)
                    ]
                    [ iconEdit ]
                , button
                    [ class "row-action row-action--danger"
                    , type_ "button"
                    , Attr.title "Delete"
                    , Attr.attribute "aria-label" ("Delete " ++ d.title)
                    , onClick (RequestedDeleteDeal d)
                    ]
                    [ iconTrash ]
                ]
            ]
        , div [ class valueClass ]
            [ text
                (if d.value == 0 then
                    "—"

                 else
                    formatCurrency d.value
                )
            ]
        , if String.isEmpty d.contactName then
            text ""

          else
            case linkedContact of
                Just c ->
                    div
                        [ class "deal-card__contact deal-card__contact--link"
                        , Attr.attribute "role" "button"
                        , Attr.attribute "tabindex" "0"
                        , Attr.title ("Open " ++ c.name)
                        , Html.Events.stopPropagationOn "click"
                            (D.succeed ( OpenedContactDetail c, True ))
                        ]
                        [ div [ class "deal-card__contact-avatar" ]
                            [ text (initials c.name) ]
                        , span [ class "deal-card__contact-name" ]
                            [ text c.name ]
                        ]

                Nothing ->
                    div [ class "deal-card__contact" ]
                        [ div [ class "deal-card__contact-avatar" ]
                            [ text (initials d.contactName) ]
                        , span [ class "deal-card__contact-name" ]
                            [ text d.contactName ]
                        ]
        , div [ class "deal-card__footer" ]
            [ div [ class "deal-card__meta" ] metaItems
            , div [ class "deal-card__move" ]
                [ button
                    [ class "deal-move-btn"
                    , type_ "button"
                    , Attr.title "Move back a stage"
                    , Attr.attribute "aria-label" ("Move " ++ d.title ++ " back")
                    , onClick
                        (case prevStage of
                            Just s ->
                                MovedDeal d s

                            Nothing ->
                                DismissedToast
                        )
                    , disabled (isMoving || prevStage == Nothing)
                    ]
                    [ text "←" ]
                , button
                    [ class "deal-move-btn"
                    , type_ "button"
                    , Attr.title "Move forward a stage"
                    , Attr.attribute "aria-label" ("Move " ++ d.title ++ " forward")
                    , onClick
                        (case nextStage of
                            Just s ->
                                MovedDeal d s

                            Nothing ->
                                DismissedToast
                        )
                    , disabled (isMoving || nextStage == Nothing)
                    ]
                    [ text "→" ]
                ]
            ]
        ]


dealColumn : List Contact -> Maybe String -> String -> List Deal -> Html Msg
dealColumn contacts movingId stageName deals =
    let
        total =
            deals |> List.map .value |> List.sum

        isEmpty =
            List.isEmpty deals

        totalClass =
            if isEmpty then
                "pipeline-col__total pipeline-col__total--muted"

            else
                "pipeline-col__total"

        colClass =
            "pipeline-col " ++ dealStageClass stageName
    in
    div [ class colClass ]
        [ div [ class "pipeline-col__header" ]
            [ div [ class "pipeline-col__title-wrap" ]
                [ span [ class "pipeline-col__dot" ] []
                , span [ class "pipeline-col__title" ] [ text stageName ]
                , span [ class "pipeline-col__count" ]
                    [ text (String.fromInt (List.length deals)) ]
                ]
            , button
                [ class "pipeline-col__add"
                , type_ "button"
                , Attr.title ("Add deal to " ++ stageName)
                , Attr.attribute "aria-label" ("Add deal to " ++ stageName)
                , onClick (OpenedAddDealWithStage stageName)
                ]
                [ svgIcon
                    [ Attr.attribute "viewBox" "0 0 24 24"
                    , Attr.attribute "width" "14"
                    , Attr.attribute "height" "14"
                    , Attr.attribute "fill" "none"
                    , Attr.attribute "stroke" "currentColor"
                    , Attr.attribute "stroke-width" "2.2"
                    , Attr.attribute "stroke-linecap" "round"
                    , Attr.attribute "stroke-linejoin" "round"
                    ]
                    [ svgPath "M12 5v14"
                    , svgPath "M5 12h14"
                    ]
                ]
            ]
        , div [ class totalClass ]
            [ text
                (if isEmpty then
                    "No value"

                 else
                    formatCurrency total
                )
            ]
        , if isEmpty then
            div [ class "pipeline-col__empty" ]
                [ div [ class "pipeline-col__empty-icon" ]
                    [ svgIcon
                        [ Attr.attribute "viewBox" "0 0 24 24"
                        , Attr.attribute "width" "14"
                        , Attr.attribute "height" "14"
                        , Attr.attribute "fill" "none"
                        , Attr.attribute "stroke" "currentColor"
                        , Attr.attribute "stroke-width" "1.8"
                        , Attr.attribute "stroke-linecap" "round"
                        , Attr.attribute "stroke-linejoin" "round"
                        ]
                        [ svgPath "M12 5v14"
                        , svgPath "M5 12h14"
                        ]
                    ]
                , text "No deals yet"
                ]

          else
            div [ class "pipeline-col__cards" ]
                (List.map (dealCard contacts movingId) deals)
        ]


pipelineBoard : List Contact -> Maybe String -> List Deal -> Html Msg
pipelineBoard contacts movingId deals =
    div [ class "pipeline-board" ]
        (dealStageOptions
            |> List.map
                (\stageName ->
                    dealColumn contacts
                        movingId
                        stageName
                        (List.filter (\d -> d.stage == stageName) deals)
                )
        )


matchesDealQuery : String -> Deal -> Bool
matchesDealQuery q d =
    let
        needle =
            q |> String.toLower |> String.trim
    in
    String.isEmpty needle
        || String.contains needle (String.toLower d.title)
        || String.contains needle (String.toLower d.contactName)
        || String.contains needle (String.toLower d.owner)


dealsView : Model -> Html Msg
dealsView model =
    case model.deals of
        NotAsked ->
            dealsSkeleton

        Loading ->
            dealsSkeleton

        Failure msg ->
            div [ class "content__empty-block" ] [ text ("Could not load deals: " ++ msg) ]

        Success data ->
            let
                filtered =
                    data.items

                total =
                    filtered |> List.map .value |> List.sum

                count =
                    List.length filtered

                avgValue =
                    if count == 0 then
                        0

                    else
                        total / toFloat count

                isQueryEmpty =
                    String.isEmpty (String.trim data.query)
            in
            div []
                [ div [ class "page-toolbar" ]
                    [ div [ class "page-toolbar__search" ]
                        [ svgIcon
                            [ Attr.attribute "viewBox" "0 0 24 24"
                            , Attr.attribute "width" "16"
                            , Attr.attribute "height" "16"
                            , Attr.attribute "fill" "none"
                            , Attr.attribute "stroke" "currentColor"
                            , Attr.attribute "stroke-width" "1.8"
                            , Attr.attribute "stroke-linecap" "round"
                            , Attr.attribute "stroke-linejoin" "round"
                            ]
                            [ Html.node "circle"
                                [ Attr.attribute "cx" "11"
                                , Attr.attribute "cy" "11"
                                , Attr.attribute "r" "8"
                                ]
                                []
                            , svgPath "M21 21l-4.35-4.35"
                            ]
                        , input
                            [ type_ "text"
                            , placeholder "Search deals…"
                            , value data.query
                            , onInput UpdatedDealsQuery
                            ]
                            []
                        ]
                    , button
                        [ class "ecc-btn ecc-btn--inline"
                        , type_ "button"
                        , onClick OpenedAddDeal
                        ]
                        [ text "Add deal" ]
                    ]
                , div [ class "deals-summary" ]
                    [ div [ class "deals-summary__item" ]
                        [ span [ class "deals-summary__label" ] [ text "Deals" ]
                        , span [ class "deals-summary__value" ]
                            [ text (String.fromInt count) ]
                        ]
                    , div [ class "deals-summary__divider" ] []
                    , div [ class "deals-summary__item" ]
                        [ span [ class "deals-summary__label" ] [ text "In view" ]
                        , span [ class "deals-summary__value" ]
                            [ text (formatCurrency total) ]
                        ]
                    , div [ class "deals-summary__divider" ] []
                    , div [ class "deals-summary__item" ]
                        [ span [ class "deals-summary__label" ] [ text "Avg deal" ]
                        , span [ class "deals-summary__value" ]
                            [ text
                                (if count == 0 then
                                    "—"

                                 else
                                    formatCurrency avgValue
                                )
                            ]
                        ]
                    , div [ class "deals-summary__spacer" ] []
                    ]
                , if List.isEmpty filtered then
                    div [ class "empty-state" ]
                        [ h3 [ class "empty-state__title" ]
                            [ text
                                (if isQueryEmpty then
                                    "No deals yet"

                                 else
                                    "No deals match your search"
                                )
                            ]
                        , p [ class "empty-state__desc" ]
                            [ text
                                (if isQueryEmpty then
                                    "Add your first deal to start tracking your pipeline."

                                 else
                                    "Try a different search term."
                                )
                            ]
                        , if isQueryEmpty then
                            div [ class "empty-state__action" ]
                                [ button
                                    [ class "ecc-btn ecc-btn--inline"
                                    , type_ "button"
                                    , onClick OpenedAddDeal
                                    ]
                                    [ text "Add your first deal" ]
                                ]

                          else
                            text ""
                        ]

                  else
                    pipelineBoard (contactList model) model.movingDealId filtered
                ]


-- ================= DEAL FORM =================


dealFormFieldError : String -> DealForm -> Maybe String
dealFormFieldError field df =
    df.errors
        |> List.filter (\( f, _ ) -> f == field)
        |> List.head
        |> Maybe.map Tuple.second


contactOptions : Model -> List Contact
contactOptions model =
    case model.contacts of
        Success data ->
            List.sortBy .name data.items

        _ ->
            []


dealContactSelect : Model -> DealForm -> Html Msg
dealContactSelect model df =
    let
        options =
            contactOptions model

        err =
            dealFormFieldError "contactId" df

        cls =
            case err of
                Just _ ->
                    "ecc-field ecc-field--error"

                Nothing ->
                    "ecc-field"
    in
    div [ class cls ]
        ([ select
            [ id "df-contactId"
            , onInput (UpdatedDealFormField "contactId")
            , disabled df.submitting
            ]
            (option [ value "", Attr.selected (df.contactId == "") ]
                [ text "No contact linked" ]
                :: List.map
                    (\c ->
                        option
                            [ value c.id, Attr.selected (df.contactId == c.id) ]
                            [ text c.name ]
                    )
                    options
            )
         , label [ for "df-contactId" ] [ text "Contact" ]
         ]
            ++ (case err of
                    Just msg ->
                        [ p [ class "ecc-field__message" ] [ text msg ] ]

                    Nothing ->
                        []
               )
        )


dealRichField : DealForm -> String -> String -> String -> Bool -> Html Msg
dealRichField df fieldId labelText inputType shouldFocus =
    let
        currentValue =
            case fieldId of
                "title" ->
                    df.title

                "value" ->
                    df.value

                "closeDate" ->
                    df.closeDate

                "owner" ->
                    df.owner

                _ ->
                    ""

        err =
            dealFormFieldError fieldId df

        cls =
            case err of
                Just _ ->
                    "ecc-field ecc-field--error"

                Nothing ->
                    "ecc-field"

        baseAttrs =
            [ id ("df-" ++ fieldId)
            , type_ inputType
            , placeholder " "
            , value currentValue
            , onInput (UpdatedDealFormField fieldId)
            , disabled df.submitting
            ]

        finalAttrs =
            if shouldFocus then
                baseAttrs ++ [ Attr.autofocus True ]

            else
                baseAttrs
    in
    div [ class cls ]
        ([ input finalAttrs []
         , label [ for ("df-" ++ fieldId) ] [ text labelText ]
         ]
            ++ (case err of
                    Just msg ->
                        [ p [ class "ecc-field__message" ] [ text msg ] ]

                    Nothing ->
                        []
               )
        )


dealStagePills : DealForm -> Html Msg
dealStagePills df =
    div [ class "ecc-field" ]
        [ span [ class "ecc-field__label" ] [ text "Stage" ]
        , div [ class "stage-pills" ]
            (List.map
                (\s ->
                    let
                        cls =
                            if df.stage == s then
                                "stage-pill stage-pill--active"

                            else
                                "stage-pill"
                    in
                    button
                        [ type_ "button"
                        , class cls
                        , onClick (UpdatedDealFormField "stage" s)
                        , disabled df.submitting
                        ]
                        [ text s ]
                )
                dealStageOptions
            )
        ]


dealNotesField : DealForm -> Html Msg
dealNotesField df =
    div [ class "ecc-field ecc-field--notes" ]
        [ span [ class "ecc-field__label" ] [ text "Notes" ]
        , textarea
            [ id "df-notes"
            , placeholder "Add context about this deal…"
            , value df.notes
            , onInput (UpdatedDealFormField "notes")
            , disabled df.submitting
            , Attr.rows 4
            ]
            []
        ]


discardDealConfirmView : Html Msg
discardDealConfirmView =
    div [ class "modal__confirm" ]
        [ p [ class "modal__confirm-text" ]
            [ text "Discard your changes? They won't be saved." ]
        , div [ class "modal__actions" ]
            [ button
                [ type_ "button"
                , class "ecc-btn ecc-btn--ghost ecc-btn--inline"
                , onClick CancelledCloseDealForm
                ]
                [ text "Keep editing" ]
            , button
                [ type_ "button"
                , class "ecc-btn ecc-btn--danger ecc-btn--inline"
                , onClick ConfirmedCloseDealForm
                ]
                [ text "Discard" ]
            ]
        ]


dealFormView : Model -> DealForm -> Bool -> Html Msg
dealFormView model df isEdit =
    let
        formError =
            dealFormFieldError "form" df

        submitLabel =
            if df.submitting then
                "Saving…"

            else if isEdit then
                "Save changes"

            else
                "Save deal"
    in
    form [ onSubmit SubmittedDealForm, Attr.novalidate True ]
        [ (case formError of
            Just msg ->
                div [ class "ecc-alert ecc-alert--error" ] [ text msg ]

            Nothing ->
                text ""
          )
        , div [ class "form-grid" ]
            [ dealRichField df "title" "Deal title" "text" True
            , dealContactSelect model df
            , dealRichField df "value" "Value (USD)" "number" False
            , dealRichField df "closeDate" "Expected close" "date" False
            , dealRichField df "owner" "Owner" "text" False
            ]
        , dealStagePills df
        , dealNotesField df
        , div [ class "modal__actions" ]
            [ button
                [ type_ "button"
                , class "ecc-btn ecc-btn--ghost ecc-btn--inline"
                , onClick RequestedCloseDealForm
                , disabled df.submitting
                ]
                [ text "Cancel" ]
            , button
                [ type_ "submit"
                , class "ecc-btn ecc-btn--inline"
                , disabled (df.submitting || not df.dirty)
                ]
                [ text submitLabel ]
            ]
        ]


dealFormModal : Model -> DealForm -> Html Msg
dealFormModal model df =
    let
        isEdit =
            model.editingDealId /= Nothing

        titleText =
            if isEdit then
                "Edit deal"

            else
                "Add deal"
    in
    div [ class "modal-backdrop", onClick RequestedCloseDealForm ]
        [ div
            [ class "modal modal--wide"
            , Attr.attribute "role" "dialog"
            , Attr.attribute "aria-modal" "true"
            , Attr.attribute "aria-label" titleText
            , Html.Events.stopPropagationOn "click"
                (D.succeed ( DismissedToast, True ))
            ]
            [ header [ class "modal__header" ]
                [ h2 [ class "modal__title" ] [ text titleText ]
                , button
                    [ class "modal__close"
                    , type_ "button"
                    , onClick RequestedCloseDealForm
                    , Attr.attribute "aria-label" "Close"
                    ]
                    [ svgIcon
                        [ Attr.attribute "viewBox" "0 0 24 24"
                        , Attr.attribute "width" "18"
                        , Attr.attribute "height" "18"
                        , Attr.attribute "fill" "none"
                        , Attr.attribute "stroke" "currentColor"
                        , Attr.attribute "stroke-width" "2"
                        , Attr.attribute "stroke-linecap" "round"
                        , Attr.attribute "stroke-linejoin" "round"
                        ]
                        [ svgPath "M18 6 6 18"
                        , svgPath "M6 6l12 12"
                        ]
                    ]
                ]
            , if df.confirmDiscard then
                discardDealConfirmView

              else
                dealFormView model df isEdit
            ]
        ]


deleteDealConfirmModal : Deal -> Html Msg
deleteDealConfirmModal deal =
    div [ class "modal-backdrop", onClick CancelledDeleteDeal ]
        [ div
            [ class "modal modal--narrow"
            , Attr.attribute "role" "alertdialog"
            , Attr.attribute "aria-modal" "true"
            , Attr.attribute "aria-label" "Delete deal"
            , Html.Events.stopPropagationOn "click"
                (D.succeed ( DismissedToast, True ))
            ]
            [ header [ class "modal__header" ]
                [ h2 [ class "modal__title" ] [ text "Delete deal" ]
                , button
                    [ class "modal__close"
                    , type_ "button"
                    , onClick CancelledDeleteDeal
                    , Attr.attribute "aria-label" "Close"
                    ]
                    [ svgIcon
                        [ Attr.attribute "viewBox" "0 0 24 24"
                        , Attr.attribute "width" "18"
                        , Attr.attribute "height" "18"
                        , Attr.attribute "fill" "none"
                        , Attr.attribute "stroke" "currentColor"
                        , Attr.attribute "stroke-width" "2"
                        , Attr.attribute "stroke-linecap" "round"
                        , Attr.attribute "stroke-linejoin" "round"
                        ]
                        [ svgPath "M18 6 6 18"
                        , svgPath "M6 6l12 12"
                        ]
                    ]
                ]
            , p [ class "modal__confirm-text" ]
                [ text "Delete "
                , strong [] [ text deal.title ]
                , text "? This cannot be undone."
                ]
            , div [ class "modal__actions" ]
                [ button
                    [ type_ "button"
                    , class "ecc-btn ecc-btn--ghost ecc-btn--inline"
                    , onClick CancelledDeleteDeal
                    ]
                    [ text "Cancel" ]
                , button
                    [ type_ "button"
                    , class "ecc-btn ecc-btn--danger ecc-btn--inline"
                    , onClick ConfirmedDeleteDeal
                    ]
                    [ text "Delete" ]
                ]
            ]
        ]


-- ================= SHARED DETAIL HELPERS =================


infoRow : Html Msg -> String -> String -> Html Msg
infoRow icon label valueText =
    div [ class "info-row" ]
        [ span [ class "info-row__icon" ] [ icon ]
        , div [ class "info-row__body" ]
            [ span [ class "info-row__label" ] [ text label ]
            , span [ class "info-row__value" ] [ text valueText ]
            ]
        ]


detailStat : String -> String -> String -> Html Msg
detailStat label valueText hint =
    div [ class "detail-stat" ]
        [ span [ class "detail-stat__label" ] [ text label ]
        , span [ class "detail-stat__value" ] [ text valueText ]
        , span [ class "detail-stat__hint" ] [ text hint ]
        ]


detailCard : String -> Maybe (Html Msg) -> Html Msg -> Html Msg
detailCard titleText action body =
    section [ class "detail-card" ]
        [ header [ class "detail-card__header" ]
            [ h3 [ class "detail-card__title" ] [ text titleText ]
            , case action of
                Just a ->
                    a

                Nothing ->
                    text ""
            ]
        , body
        ]


detailEmpty : Html Msg -> String -> String -> Html Msg
detailEmpty icon titleText desc =
    div [ class "detail-empty" ]
        [ div [ class "detail-empty__icon" ] [ icon ]
        , h4 [ class "detail-empty__title" ] [ text titleText ]
        , p [ class "detail-empty__desc" ] [ text desc ]
        ]


-- ================= ACTIVITY =================


activityKindLabel : String -> String
activityKindLabel kind =
    case kind of
        "email" ->
            "Email"

        "call" ->
            "Call"

        "meeting" ->
            "Meeting"

        "note" ->
            "Note"

        "task" ->
            "Task"

        _ ->
            "Activity"


activityItemView : Activity -> Html Msg
activityItemView a =
    div [ class "activity-item" ]
        [ div [ class "activity-item__marker", class ("activity-item__marker--" ++ a.kind) ] []
        , div [ class "activity-item__body" ]
            [ div [ class "activity-item__meta" ]
                [ span [ class "activity-item__kind" ]
                    [ text (activityKindLabel a.kind) ]
                , span [ class "activity-item__time" ]
                    [ text a.occurredAt ]
                , if String.isEmpty a.createdBy then
                    text ""

                  else
                    span [ class "activity-item__by" ]
                        [ text ("· " ++ a.createdBy) ]
                ]
            , div [ class "activity-item__title-row" ]
                [ h4 [ class "activity-item__title" ] [ text a.title ]
                , button
                    [ class "row-action row-action--danger row-action--tiny"
                    , type_ "button"
                    , Attr.title "Delete activity"
                    , Attr.attribute "aria-label" ("Delete " ++ a.title)
                    , onClick (RequestedDeleteActivity a)
                    ]
                    [ iconTrash ]
                ]
            , if String.isEmpty a.body then
                text ""

              else
                p [ class "activity-item__text" ] [ text a.body ]
            ]
        ]


activityFeed : Model -> Html Msg
activityFeed model =
    case model.activities of
        NotAsked ->
            div [ class "activity-loading" ] [ text "Loading activity…" ]

        Loading ->
            div [ class "activity-loading" ] [ text "Loading activity…" ]

        Failure msg ->
            div [ class "activity-loading" ] [ text ("Could not load activity: " ++ msg) ]

        Success [] ->
            detailEmpty
                iconTasks
                "No activity yet"
                "Log your first call, email, or meeting to keep the timeline up to date."

        Success items ->
            div [ class "activity-list" ]
                (List.map activityItemView items)


activityFormFieldError : String -> ActivityForm -> Maybe String
activityFormFieldError field af =
    af.errors
        |> List.filter (\( f, _ ) -> f == field)
        |> List.head
        |> Maybe.map Tuple.second


activityKindPills : ActivityForm -> Html Msg
activityKindPills af =
    div [ class "ecc-field" ]
        [ span [ class "ecc-field__label" ] [ text "Kind" ]
        , div [ class "stage-pills" ]
            (List.map
                (\k ->
                    let
                        cls =
                            if af.kind == k then
                                "stage-pill stage-pill--active"

                            else
                                "stage-pill"
                    in
                    button
                        [ type_ "button"
                        , class cls
                        , onClick (UpdatedActivityFormField "kind" k)
                        , disabled af.submitting
                        ]
                        [ text (activityKindLabel k) ]
                )
                activityKinds
            )
        , case activityFormFieldError "kind" af of
            Just msg ->
                p [ class "ecc-field__message" ] [ text msg ]

            Nothing ->
                text ""
        ]


activityFormView : ActivityForm -> Html Msg
activityFormView af =
    let
        formError =
            activityFormFieldError "form" af

        titleError =
            activityFormFieldError "title" af

        titleCls =
            case titleError of
                Just _ ->
                    "ecc-field ecc-field--error"

                Nothing ->
                    "ecc-field"

        submitLabel =
            if af.submitting then
                "Saving…"

            else
                "Log activity"
    in
    form [ onSubmit SubmittedActivityForm, Attr.novalidate True ]
        [ (case formError of
            Just msg ->
                div [ class "ecc-alert ecc-alert--error" ] [ text msg ]

            Nothing ->
                text ""
          )
        , activityKindPills af
        , div [ class titleCls ]
            [ input
                [ id "af-title"
                , type_ "text"
                , placeholder " "
                , value af.title
                , onInput (UpdatedActivityFormField "title")
                , disabled af.submitting
                , Attr.autofocus True
                ]
                []
            , label [ for "af-title" ] [ text "Title" ]
            , case titleError of
                Just msg ->
                    p [ class "ecc-field__message" ] [ text msg ]

                Nothing ->
                    text ""
            ]
        , div [ class "ecc-field" ]
            [ input
                [ id "af-occurredAt"
                , type_ "date"
                , placeholder " "
                , value af.occurredAt
                , onInput (UpdatedActivityFormField "occurredAt")
                , disabled af.submitting
                ]
                []
            , label [ for "af-occurredAt" ] [ text "Date" ]
            ]
        , div [ class "ecc-field ecc-field--notes" ]
            [ span [ class "ecc-field__label" ] [ text "Details" ]
            , textarea
                [ id "af-body"
                , placeholder "What happened?"
                , value af.body
                , onInput (UpdatedActivityFormField "body")
                , disabled af.submitting
                , Attr.rows 4
                ]
                []
            ]
        , div [ class "modal__actions" ]
            [ button
                [ type_ "button"
                , class "ecc-btn ecc-btn--ghost ecc-btn--inline"
                , onClick ClosedActivityForm
                , disabled af.submitting
                ]
                [ text "Cancel" ]
            , button
                [ type_ "submit"
                , class "ecc-btn ecc-btn--inline"
                , disabled af.submitting
                ]
                [ text submitLabel ]
            ]
        ]


activityFormModal : ActivityForm -> Html Msg
activityFormModal af =
    div [ class "modal-backdrop", onClick ClosedActivityForm ]
        [ div
            [ class "modal modal--wide"
            , Attr.attribute "role" "dialog"
            , Attr.attribute "aria-modal" "true"
            , Attr.attribute "aria-label" "Log activity"
            , Html.Events.stopPropagationOn "click"
                (D.succeed ( DismissedToast, True ))
            ]
            [ header [ class "modal__header" ]
                [ h2 [ class "modal__title" ] [ text "Log activity" ]
                , button
                    [ class "modal__close"
                    , type_ "button"
                    , onClick ClosedActivityForm
                    , Attr.attribute "aria-label" "Close"
                    ]
                    [ svgIcon
                        [ Attr.attribute "viewBox" "0 0 24 24"
                        , Attr.attribute "width" "18"
                        , Attr.attribute "height" "18"
                        , Attr.attribute "fill" "none"
                        , Attr.attribute "stroke" "currentColor"
                        , Attr.attribute "stroke-width" "2"
                        , Attr.attribute "stroke-linecap" "round"
                        , Attr.attribute "stroke-linejoin" "round"
                        ]
                        [ svgPath "M18 6 6 18"
                        , svgPath "M6 6l12 12"
                        ]
                    ]
                ]
            , activityFormView af
            ]
        ]


deleteActivityConfirmModal : Activity -> Html Msg
deleteActivityConfirmModal a =
    div [ class "modal-backdrop", onClick CancelledDeleteActivity ]
        [ div
            [ class "modal modal--narrow"
            , Attr.attribute "role" "alertdialog"
            , Attr.attribute "aria-modal" "true"
            , Attr.attribute "aria-label" "Delete activity"
            , Html.Events.stopPropagationOn "click"
                (D.succeed ( DismissedToast, True ))
            ]
            [ header [ class "modal__header" ]
                [ h2 [ class "modal__title" ] [ text "Delete activity" ]
                , button
                    [ class "modal__close"
                    , type_ "button"
                    , onClick CancelledDeleteActivity
                    , Attr.attribute "aria-label" "Close"
                    ]
                    [ svgIcon
                        [ Attr.attribute "viewBox" "0 0 24 24"
                        , Attr.attribute "width" "18"
                        , Attr.attribute "height" "18"
                        , Attr.attribute "fill" "none"
                        , Attr.attribute "stroke" "currentColor"
                        , Attr.attribute "stroke-width" "2"
                        , Attr.attribute "stroke-linecap" "round"
                        , Attr.attribute "stroke-linejoin" "round"
                        ]
                        [ svgPath "M18 6 6 18"
                        , svgPath "M6 6l12 12"
                        ]
                    ]
                ]
            , p [ class "modal__confirm-text" ]
                [ text "Delete "
                , strong [] [ text a.title ]
                , text "? This cannot be undone."
                ]
            , div [ class "modal__actions" ]
                [ button
                    [ type_ "button"
                    , class "ecc-btn ecc-btn--ghost ecc-btn--inline"
                    , onClick CancelledDeleteActivity
                    ]
                    [ text "Cancel" ]
                , button
                    [ type_ "button"
                    , class "ecc-btn ecc-btn--danger ecc-btn--inline"
                    , onClick ConfirmedDeleteActivity
                    ]
                    [ text "Delete" ]
                ]
            ]
        ]


-- ================= CONTACT DETAIL =================


contactDetailView : Model -> Contact -> Html Msg
contactDetailView model c =
    let
        displayCompany =
            if String.isEmpty c.company then
                "—"

            else
                c.company

        displayTitle =
            if String.isEmpty c.title then
                ""

            else
                c.title

        displayLocation =
            if String.isEmpty c.location then
                "—"

            else
                c.location

        displayPhone =
            if String.isEmpty c.phone then
                "—"

            else
                c.phone

        displayOwner =
            if String.isEmpty c.owner then
                "Unassigned"

            else
                c.owner

        displayCreated =
            if String.isEmpty c.createdAt then
                "—"

            else
                c.createdAt

        roleLine =
            if String.isEmpty displayTitle then
                displayCompany

            else
                displayTitle ++ " · " ++ displayCompany

        activityCount =
            case model.activities of
                Success items ->
                    List.length items

                _ ->
                    0
    in
    div [ class "detail" ]
        [ button
            [ class "detail__back"
            , type_ "button"
            , onClick (NavigatedTo Contacts)
            ]
            [ iconBack
            , span [] [ text "Back to contacts" ]
            ]
        , header [ class "detail-hero" ]
            [ div [ class "detail-hero__avatar" ] [ text (initials c.name) ]
            , div [ class "detail-hero__body" ]
                [ div [ class "detail-hero__title-row" ]
                    [ h1 [ class "detail-hero__name" ] [ text c.name ]
                    , stageBadge c.stage
                    ]
                , p [ class "detail-hero__role" ] [ text roleLine ]
                , div [ class "detail-hero__contact" ]
                    [ a
                        [ class "detail-hero__chip"
                        , Attr.href ("mailto:" ++ c.email)
                        ]
                        [ iconMail
                        , span [] [ text c.email ]
                        ]
                    , if String.isEmpty c.phone then
                        text ""

                      else
                        a
                            [ class "detail-hero__chip"
                            , Attr.href ("tel:" ++ c.phone)
                            ]
                            [ iconPhone
                            , span [] [ text c.phone ]
                            ]
                    , if String.isEmpty c.location then
                        text ""

                      else
                        span [ class "detail-hero__chip" ]
                            [ iconPin
                            , span [] [ text c.location ]
                            ]
                    ]
                ]
            , div [ class "detail-hero__actions" ]
                [ button
                    [ class "ecc-btn ecc-btn--ghost ecc-btn--inline"
                    , type_ "button"
                    , onClick (OpenedEditContact c)
                    ]
                    [ iconEdit
                    , span [] [ text "Edit" ]
                    ]
                , button
                    [ class "ecc-btn ecc-btn--danger ecc-btn--inline"
                    , type_ "button"
                    , onClick (RequestedDeleteContact c)
                    ]
                    [ iconTrash
                    , span [] [ text "Delete" ]
                    ]
                ]
            ]
        , div [ class "detail-stats" ]
            [ detailStat "Open deals" "0" "No deals yet"
            , detailStat "Activities"
                (String.fromInt activityCount)
                "Logged"
            , detailStat "Tasks due" "0" "All clear"
            , detailStat "Last contact" c.lastContact "Last touch"
            ]
        , div [ class "detail__grid" ]
            [ aside [ class "detail__sidebar" ]
                [ detailCard "About"
                    Nothing
                    (div [ class "info-list" ]
                        [ infoRow iconMail "Email" c.email
                        , infoRow iconPhone "Phone" displayPhone
                        , infoRow iconPin "Location" displayLocation
                        , infoRow iconCalendar "Created" displayCreated
                        , infoRow iconContacts "Owner" displayOwner
                        ]
                    )
                , detailCard "Tags"
                    Nothing
                    (if List.isEmpty c.tags then
                        p [ class "detail-muted" ] [ text "No tags yet." ]

                     else
                        div [ class "tag-list" ]
                            (List.map (\t -> span [ class "tag" ] [ text t ]) c.tags)
                    )
                , detailCard "Notes"
                    Nothing
                    (if String.isEmpty c.notes then
                        p [ class "detail-muted" ]
                            [ text "No notes yet. Record what matters about this relationship." ]

                     else
                        p [ class "detail-notes" ] [ text c.notes ]
                    )
                ]
            , div [ class "detail__main" ]
                [ detailCard "Activity"
                    (Just
                        (button
                            [ class "detail-card__action"
                            , type_ "button"
                            , onClick OpenedActivityForm
                            ]
                            [ text "Log activity" ]
                        )
                    )
                    (activityFeed model)
                , detailCard "Open deals"
                    (Just
                        (button
                            [ class "detail-card__action"
                            , type_ "button"
                            , disabled True
                            , Attr.title "Coming soon"
                            ]
                            [ text "New deal" ]
                        )
                    )
                    (detailEmpty
                        iconDeals
                        "No deals yet"
                        "Link this contact to a deal to see pipeline value and stage."
                    )
                , detailCard "Tasks"
                    (Just
                        (button
                            [ class "detail-card__action"
                            , type_ "button"
                            , disabled True
                            , Attr.title "Coming soon"
                            ]
                            [ text "New task" ]
                        )
                    )
                    (detailEmpty
                        iconTasks
                        "No tasks yet"
                        "Add a follow-up to make sure nothing slips through the cracks."
                    )
                ]
            ]
        ]


-- ================= DEAL DETAIL =================


dealStagePillsDetail : Bool -> Deal -> Html Msg
dealStagePillsDetail isMoving d =
    div [ class "stage-pills stage-pills--detail" ]
        (List.map
            (\s ->
                let
                    cls =
                        if d.stage == s then
                            "stage-pill stage-pill--active"

                        else
                            "stage-pill"
                in
                button
                    [ type_ "button"
                    , class cls
                    , onClick (MovedDeal d s)
                    , disabled isMoving
                    ]
                    [ text s ]
            )
            dealStageOptions
        )


dealDetailView : Model -> Deal -> Html Msg
dealDetailView model d =
    let
        contacts =
            contactList model

        linkedContact =
            contactById contacts d.contactId

        isMoving =
            model.movingDealId == Just d.id

        closeDateDisplay =
            if String.isEmpty d.closeDate then
                "—"

            else
                d.closeDate

        ownerDisplay =
            if String.isEmpty d.owner then
                "Unassigned"

            else
                d.owner

        createdDisplay =
            if String.isEmpty d.createdAt then
                "—"

            else
                d.createdAt
    in
    div [ class "detail" ]
        [ button
            [ class "detail__back"
            , type_ "button"
            , onClick (NavigatedTo Deals)
            ]
            [ iconBack
            , span [] [ text "Back to deals" ]
            ]
        , header [ class "detail-hero" ]
            [ div [ class "detail-hero__avatar detail-hero__avatar--deal" ]
                [ text (formatCurrency d.value) ]
            , div [ class "detail-hero__body" ]
                [ div [ class "detail-hero__title-row" ]
                    [ h1 [ class "detail-hero__name" ] [ text d.title ]
                    , stageBadge d.stage
                    ]
                , p [ class "detail-hero__role" ]
                    [ text
                        (if String.isEmpty d.contactName then
                            "No contact linked"

                         else
                            "Linked to " ++ d.contactName
                        )
                    ]
                , div [ class "detail-hero__contact" ]
                    [ if String.isEmpty d.closeDate then
                        text ""

                      else
                        span [ class "detail-hero__chip" ]
                            [ iconCalendar
                            , span [] [ text ("Closes " ++ d.closeDate) ]
                            ]
                    , if String.isEmpty d.owner then
                        text ""

                      else
                        span [ class "detail-hero__chip" ]
                            [ iconUserTiny
                            , span [] [ text d.owner ]
                            ]
                    ]
                ]
            , div [ class "detail-hero__actions" ]
                [ button
                    [ class "ecc-btn ecc-btn--ghost ecc-btn--inline"
                    , type_ "button"
                    , onClick (OpenedEditDeal d)
                    ]
                    [ iconEdit
                    , span [] [ text "Edit" ]
                    ]
                , button
                    [ class "ecc-btn ecc-btn--danger ecc-btn--inline"
                    , type_ "button"
                    , onClick (RequestedDeleteDeal d)
                    ]
                    [ iconTrash
                    , span [] [ text "Delete" ]
                    ]
                ]
            ]
        , div [ class "detail-stats" ]
            [ detailStat "Value" (formatCurrency d.value) "Deal value"
            , detailStat "Stage" d.stage "Current stage"
            , detailStat "Close date" closeDateDisplay "Expected"
            , detailStat "Owner" ownerDisplay "Assigned to"
            ]
        , div [ class "detail__grid" ]
            [ aside [ class "detail__sidebar" ]
                [ detailCard "Contact"
                    Nothing
                    (case linkedContact of
                        Just c ->
                            div
                                [ class "deal-contact-card"
                                , Attr.attribute "role" "button"
                                , Attr.attribute "tabindex" "0"
                                , Attr.title ("Open " ++ c.name)
                                , onClick (OpenedContactDetail c)
                                ]
                                [ div [ class "deal-contact-card__avatar" ]
                                    [ text (initials c.name) ]
                                , div [ class "deal-contact-card__body" ]
                                    [ span [ class "deal-contact-card__name" ]
                                        [ text c.name ]
                                    , span [ class "deal-contact-card__email" ]
                                        [ text c.email ]
                                    ]
                                , span [ class "deal-contact-card__chevron" ]
                                    [ text "→" ]
                                ]

                        Nothing ->
                            if String.isEmpty d.contactName then
                                p [ class "detail-muted" ]
                                    [ text "No contact linked to this deal." ]

                            else
                                p [ class "detail-muted" ]
                                    [ text d.contactName ]
                    )
                , detailCard "Stage"
                    Nothing
                    (dealStagePillsDetail isMoving d)
                , detailCard "Deal info"
                    Nothing
                    (div [ class "info-list" ]
                        [ infoRow iconCalendar "Close date" closeDateDisplay
                        , infoRow iconUserTiny "Owner" ownerDisplay
                        , infoRow iconCalendar "Created" createdDisplay
                        ]
                    )
                , detailCard "Notes"
                    Nothing
                    (if String.isEmpty d.notes then
                        p [ class "detail-muted" ]
                            [ text "No notes yet. Record what matters about this deal." ]

                     else
                        p [ class "detail-notes" ] [ text d.notes ]
                    )
                ]
            , div [ class "detail__main" ]
                [ detailCard "Recent activity"
                    (Just
                        (button
                            [ class "detail-card__action"
                            , type_ "button"
                            , disabled True
                            , Attr.title "Coming soon"
                            ]
                            [ text "Log activity" ]
                        )
                    )
                    (detailEmpty
                        iconTasks
                        "No activity yet"
                        "Activity on this deal will appear here once it's linked to a contact."
                    )
                ]
            ]
        ]


-- ================= CONTACT FORM MODAL =================


stageOptions : List String
stageOptions =
    [ "Lead", "Qualified", "Proposal", "Customer" ]


contactFormFieldError : String -> ContactForm -> Maybe String
contactFormFieldError field cf =
    cf.errors
        |> List.filter (\( f, _ ) -> f == field)
        |> List.head
        |> Maybe.map Tuple.second


richField : ContactForm -> String -> String -> String -> Bool -> Html Msg
richField cf fieldId labelText inputType shouldFocus =
    let
        currentValue =
            case fieldId of
                "name" ->
                    cf.name

                "email" ->
                    cf.email

                "company" ->
                    cf.company

                "title" ->
                    cf.title

                "phone" ->
                    cf.phone

                "location" ->
                    cf.location

                _ ->
                    ""

        err =
            contactFormFieldError fieldId cf

        cls =
            case err of
                Just _ ->
                    "ecc-field ecc-field--error"

                Nothing ->
                    "ecc-field"

        baseAttrs =
            [ id ("cf-" ++ fieldId)
            , type_ inputType
            , placeholder " "
            , value currentValue
            , onInput (UpdatedContactFormField fieldId)
            , disabled cf.submitting
            ]

        finalAttrs =
            if shouldFocus then
                baseAttrs ++ [ Attr.autofocus True ]

            else
                baseAttrs
    in
    div [ class cls ]
        ([ input finalAttrs []
         , label [ for ("cf-" ++ fieldId) ] [ text labelText ]
         ]
            ++ (case err of
                    Just msg ->
                        [ p [ class "ecc-field__message" ] [ text msg ] ]

                    Nothing ->
                        []
               )
        )


stagePills : ContactForm -> Html Msg
stagePills cf =
    div [ class "ecc-field" ]
        [ span [ class "ecc-field__label" ] [ text "Stage" ]
        , div [ class "stage-pills" ]
            (List.map
                (\s ->
                    let
                        cls =
                            if cf.stage == s then
                                "stage-pill stage-pill--active"

                            else
                                "stage-pill"
                    in
                    button
                        [ type_ "button"
                        , class cls
                        , onClick (UpdatedContactFormField "stage" s)
                        , disabled cf.submitting
                        ]
                        [ text s ]
                )
                stageOptions
            )
        ]


tagsField : ContactForm -> Html Msg
tagsField cf =
    div [ class "ecc-field ecc-field--tags" ]
        [ span [ class "ecc-field__label" ] [ text "Tags" ]
        , div [ class "tag-input-row" ]
            [ input
                [ type_ "text"
                , id "cf-tagInput"
                , placeholder "Add a tag…"
                , value cf.tagInput
                , onInput (UpdatedContactFormField "tagInput")
                , onEnter AddedContactTag
                , disabled cf.submitting
                ]
                []
            , button
                [ type_ "button"
                , class "tag-add-btn"
                , onClick AddedContactTag
                , disabled cf.submitting
                ]
                [ text "Add" ]
            ]
        , if List.isEmpty cf.tags then
            text ""

          else
            div [ class "tag-chip-list" ]
                (List.map
                    (\t ->
                        span [ class "tag-chip" ]
                            [ text t
                            , button
                                [ type_ "button"
                                , class "tag-chip__remove"
                                , onClick (RemovedContactTag t)
                                , disabled cf.submitting
                                , Attr.attribute "aria-label" ("Remove tag " ++ t)
                                ]
                                [ text "×" ]
                            ]
                    )
                    cf.tags
                )
        ]


notesField : ContactForm -> Html Msg
notesField cf =
    div [ class "ecc-field ecc-field--notes" ]
        [ span [ class "ecc-field__label" ] [ text "Notes" ]
        , textarea
            [ id "cf-notes"
            , placeholder "Record what matters about this relationship…"
            , value cf.notes
            , onInput (UpdatedContactFormField "notes")
            , disabled cf.submitting
            , Attr.rows 4
            ]
            []
        ]


discardConfirmView : Html Msg
discardConfirmView =
    div [ class "modal__confirm" ]
        [ p [ class "modal__confirm-text" ]
            [ text "Discard your changes? They won't be saved." ]
        , div [ class "modal__actions" ]
            [ button
                [ type_ "button"
                , class "ecc-btn ecc-btn--ghost ecc-btn--inline"
                , onClick CancelledCloseContactForm
                ]
                [ text "Keep editing" ]
            , button
                [ type_ "button"
                , class "ecc-btn ecc-btn--danger ecc-btn--inline"
                , onClick ConfirmedCloseContactForm
                ]
                [ text "Discard" ]
            ]
        ]


contactFormView : ContactForm -> Bool -> Html Msg
contactFormView cf isEdit =
    let
        formError =
            contactFormFieldError "form" cf

        submitLabel =
            if cf.submitting then
                "Saving…"

            else if isEdit then
                "Save changes"

            else
                "Save contact"
    in
    form [ onSubmit SubmittedContactForm, Attr.novalidate True ]
        [ (case formError of
            Just msg ->
                div [ class "ecc-alert ecc-alert--error" ]
                    [ text msg ]

            Nothing ->
                text ""
          )
        , div [ class "form-grid" ]
            [ richField cf "name" "Full name" "text" True
            , richField cf "email" "Email address" "email" False
            , richField cf "company" "Company" "text" False
            , richField cf "title" "Job title" "text" False
            , richField cf "phone" "Phone" "tel" False
            , richField cf "location" "Location" "text" False
            ]
        , stagePills cf
        , tagsField cf
        , notesField cf
        , div [ class "modal__actions" ]
            [ button
                [ type_ "button"
                , class "ecc-btn ecc-btn--ghost ecc-btn--inline"
                , onClick RequestedCloseContactForm
                , disabled cf.submitting
                ]
                [ text "Cancel" ]
            , button
                [ type_ "submit"
                , class "ecc-btn ecc-btn--inline"
                , disabled (cf.submitting || not cf.dirty)
                ]
                [ text submitLabel ]
            ]
        ]


contactFormModal : Model -> ContactForm -> Html Msg
contactFormModal model cf =
    let
        isEdit =
            model.editingId /= Nothing

        titleText =
            if isEdit then
                "Edit contact"

            else
                "Add contact"
    in
    div [ class "modal-backdrop", onClick RequestedCloseContactForm ]
        [ div
            [ class "modal modal--wide"
            , Attr.attribute "role" "dialog"
            , Attr.attribute "aria-modal" "true"
            , Attr.attribute "aria-label" titleText
            , Html.Events.stopPropagationOn "click"
                (D.succeed ( DismissedToast, True ))
            ]
            [ header [ class "modal__header" ]
                [ h2 [ class "modal__title" ] [ text titleText ]
                , button
                    [ class "modal__close"
                    , type_ "button"
                    , onClick RequestedCloseContactForm
                    , Attr.attribute "aria-label" "Close"
                    ]
                    [ svgIcon
                        [ Attr.attribute "viewBox" "0 0 24 24"
                        , Attr.attribute "width" "18"
                        , Attr.attribute "height" "18"
                        , Attr.attribute "fill" "none"
                        , Attr.attribute "stroke" "currentColor"
                        , Attr.attribute "stroke-width" "2"
                        , Attr.attribute "stroke-linecap" "round"
                        , Attr.attribute "stroke-linejoin" "round"
                        ]
                        [ svgPath "M18 6 6 18"
                        , svgPath "M6 6l12 12"
                        ]
                    ]
                ]
            , if cf.confirmDiscard then
                discardConfirmView

              else
                contactFormView cf isEdit
            ]
        ]


-- ================= DELETE CONFIRMATION =================


deleteConfirmModal : Contact -> Html Msg
deleteConfirmModal contact =
    div [ class "modal-backdrop", onClick CancelledDeleteContact ]
        [ div
            [ class "modal modal--narrow"
            , Attr.attribute "role" "alertdialog"
            , Attr.attribute "aria-modal" "true"
            , Attr.attribute "aria-label" "Delete contact"
            , Html.Events.stopPropagationOn "click"
                (D.succeed ( DismissedToast, True ))
            ]
            [ header [ class "modal__header" ]
                [ h2 [ class "modal__title" ] [ text "Delete contact" ]
                , button
                    [ class "modal__close"
                    , type_ "button"
                    , onClick CancelledDeleteContact
                    , Attr.attribute "aria-label" "Close"
                    ]
                    [ svgIcon
                        [ Attr.attribute "viewBox" "0 0 24 24"
                        , Attr.attribute "width" "18"
                        , Attr.attribute "height" "18"
                        , Attr.attribute "fill" "none"
                        , Attr.attribute "stroke" "currentColor"
                        , Attr.attribute "stroke-width" "2"
                        , Attr.attribute "stroke-linecap" "round"
                        , Attr.attribute "stroke-linejoin" "round"
                        ]
                        [ svgPath "M18 6 6 18"
                        , svgPath "M6 6l12 12"
                        ]
                    ]
                ]
            , p [ class "modal__confirm-text" ]
                [ text "Delete "
                , strong [] [ text contact.name ]
                , text "? This cannot be undone."
                ]
            , div [ class "modal__actions" ]
                [ button
                    [ type_ "button"
                    , class "ecc-btn ecc-btn--ghost ecc-btn--inline"
                    , onClick CancelledDeleteContact
                    ]
                    [ text "Cancel" ]
                , button
                    [ type_ "button"
                    , class "ecc-btn ecc-btn--danger ecc-btn--inline"
                    , onClick ConfirmedDeleteContact
                    ]
                    [ text "Delete" ]
                ]
            ]
        ]


-- ================= TOAST =================


toastView : String -> Html Msg
toastView message =
    div [ class "toast", Attr.attribute "role" "status" ]
        [ svgIcon
            [ Attr.attribute "viewBox" "0 0 24 24"
            , Attr.attribute "width" "16"
            , Attr.attribute "height" "16"
            , Attr.attribute "fill" "none"
            , Attr.attribute "stroke" "currentColor"
            , Attr.attribute "stroke-width" "2.5"
            , Attr.attribute "stroke-linecap" "round"
            , Attr.attribute "stroke-linejoin" "round"
            ]
            [ svgPath "M20 6 9 17l-5-5" ]
        , span [] [ text message ]
        ]


-- ================= PLACEHOLDER PAGES =================



taskStatusLabel : String -> String
taskStatusLabel s =
    case s of
        "todo" ->
            "To do"

        "in_progress" ->
            "In progress"

        "done" ->
            "Done"

        _ ->
            s


taskStatusClass : String -> String
taskStatusClass s =
    case s of
        "todo" ->
            "badge badge--muted"

        "in_progress" ->
            "badge badge--info"

        "done" ->
            "badge badge--success"

        _ ->
            "badge"


tasksView : Model -> Html Msg
tasksView model =
    case model.tasks of
        NotAsked ->
            tasksSkeleton

        Loading ->
            tasksSkeleton

        Failure msg ->
            div [ class "content__empty-block" ] [ text ("Could not load tasks: " ++ msg) ]

        Success data ->
            div []
                [ div [ class "page-toolbar" ]
                    [ div [ class "page-toolbar__search" ]
                        [ input
                            [ type_ "text"
                            , placeholder "Search tasks…"
                            , value data.query
                            , onInput UpdatedTasksQuery
                            ]
                            []
                        ]
                    , div [ class "stage-pills" ]
                        (List.map
                            (\s ->
                                let
                                    label =
                                        if s == "" then
                                            "All"

                                        else
                                            taskStatusLabel s

                                    cls =
                                        if data.statusFilter == s then
                                            "stage-pill stage-pill--active"

                                        else
                                            "stage-pill"
                                in
                                button [ type_ "button", class cls, onClick (UpdatedTasksStatusFilter s) ] [ text label ]
                            )
                            [ "", "todo", "in_progress", "done" ]
                        )
                    , button [ class "ecc-btn ecc-btn--inline", type_ "button", onClick OpenedAddTask ] [ text "Add task" ]
                    ]
                , if List.isEmpty data.items then
                    div [ class "content__empty-block" ] [ text "No tasks match. Add one to track follow-ups." ]

                  else
                    div [ class "table-wrap" ]
                        [ table [ class "data-table" ]
                            [ thead []
                                [ tr []
                                    [ th [] [ text "Task" ]
                                    , th [] [ text "Status" ]
                                    , th [] [ text "Due" ]
                                    , th [] [ text "Contact" ]
                                    , th [] [ text "" ]
                                    ]
                                ]
                            , tbody [] (List.map (taskRow model) data.items)
                            ]
                        , p [ class "page-toolbar__summary" ]
                            [ text (String.fromInt data.total ++ " task" ++ (if data.total == 1 then "" else "s")) ]
                        ]
                ]


taskRow : Model -> Task -> Html Msg
taskRow model task =
    tr []
        [ td []
            [ div [ class "cell-primary" ]
                [ strong [] [ text task.title ]
                , if String.isEmpty task.description then
                    text ""

                  else
                    span [ class "cell-secondary" ] [ text task.description ]
                ]
            ]
        , td []
            [ button
                [ type_ "button"
                , class (taskStatusClass task.status)
                , onClick
                    (ToggledTaskStatus task
                        (case task.status of
                            "todo" ->
                                "in_progress"

                            "in_progress" ->
                                "done"

                            _ ->
                                "todo"
                        )
                    )
                , Attr.title "Click to cycle status"
                ]
                [ text (taskStatusLabel task.status) ]
            ]
        , td []
            [ text (if String.isEmpty task.dueDate then "—" else task.dueDate) ]
        , td [] [ contactLinkForTask model task ]
        , td [ class "cell-actions" ]
            [ button [ type_ "button", class "row-action", onClick (OpenedEditTask task), Attr.attribute "aria-label" "Edit" ] [ iconEdit ]
            , button [ type_ "button", class "row-action row-action--danger", onClick (RequestedDeleteTask task), Attr.attribute "aria-label" "Delete" ] [ iconTrash ]
            ]
        ]


contactLinkForTask : Model -> Task -> Html Msg
contactLinkForTask model task =
    if String.isEmpty task.contactId then
        text "—"

    else
        let
            found =
                case model.contacts of
                    Success d ->
                        List.filter (\c -> c.id == task.contactId) d.items |> List.head

                    _ ->
                        Nothing
        in
        case found of
            Just c ->
                button
                    [ type_ "button"
                    , class "ecc-link ecc-link--strong"
                    , onClick (OpenedContactDetail c)
                    ]
                    [ text
                        (if String.isEmpty task.contactName then
                            c.name

                         else
                            task.contactName
                        )
                    ]

            Nothing ->
                text (if String.isEmpty task.contactName then "—" else task.contactName)


taskFormFieldError : String -> TaskForm -> Maybe String
taskFormFieldError field tf =
    tf.errors |> List.filter (\( f, _ ) -> f == field) |> List.head |> Maybe.map Tuple.second


taskFormModal : Model -> TaskForm -> Html Msg
taskFormModal model tf =
    let
        isEdit =
            model.editingTaskId /= Nothing

        titleText =
            if isEdit then
                "Edit task"

            else
                "Add task"

        contactOptions =
            case model.contacts of
                Success d ->
                    d.items

                _ ->
                    []
    in
    div [ class "modal-backdrop", onClick RequestedCloseTaskForm ]
        [ div
            [ class "modal modal--wide"
            , Attr.attribute "role" "dialog"
            , Html.Events.stopPropagationOn "click" (D.succeed ( DismissedToast, True ))
            ]
            [ header [ class "modal__header" ]
                [ h2 [ class "modal__title" ] [ text titleText ]
                , button [ class "modal__close", type_ "button", onClick RequestedCloseTaskForm ] [ text "×" ]
                ]
            , if tf.confirmDiscard then
                div [ class "modal__confirm" ]
                    [ p [ class "modal__confirm-text" ] [ text "Discard changes?" ]
                    , div [ class "modal__actions" ]
                        [ button [ type_ "button", class "ecc-btn ecc-btn--ghost ecc-btn--inline", onClick CancelledCloseTaskForm ] [ text "Keep editing" ]
                        , button [ type_ "button", class "ecc-btn ecc-btn--danger ecc-btn--inline", onClick ConfirmedCloseTaskForm ] [ text "Discard" ]
                        ]
                    ]

              else
                form [ onSubmit SubmittedTaskForm, Attr.novalidate True ]
                    [ case taskFormFieldError "form" tf of
                        Just msg ->
                            div [ class "ecc-alert ecc-alert--error" ] [ text msg ]

                        Nothing ->
                            text ""
                    , div [ class "form-grid" ]
                        [ div
                            [ class
                                (if taskFormFieldError "title" tf /= Nothing then
                                    "ecc-field ecc-field--error"

                                 else
                                    "ecc-field"
                                )
                            ]
                            [ input
                                [ id "tf-title"
                                , type_ "text"
                                , placeholder " "
                                , value tf.title
                                , onInput (UpdatedTaskFormField "title")
                                , disabled tf.submitting
                                , Attr.autofocus True
                                ]
                                []
                            , label [ for "tf-title" ] [ text "Title" ]
                            ]
                        , div [ class "ecc-field" ]
                            [ input
                                [ id "tf-due"
                                , type_ "date"
                                , placeholder " "
                                , value tf.dueDate
                                , onInput (UpdatedTaskFormField "dueDate")
                                , disabled tf.submitting
                                ]
                                []
                            , label [ for "tf-due" ] [ text "Due date" ]
                            ]
                        ]
                    , div [ class "ecc-field" ]
                        [ span [ class "ecc-field__label" ] [ text "Contact" ]
                        , select
                            [ id "tf-contact"
                            , onInput (UpdatedTaskFormField "contactId")
                            , disabled tf.submitting
                            ]
                            (option [ value "", Attr.selected (tf.contactId == "") ] [ text "— None —" ]
                                :: List.map
                                    (\c -> option [ value c.id, Attr.selected (tf.contactId == c.id) ] [ text c.name ])
                                    contactOptions
                            )
                        ]
                    , div [ class "ecc-field" ]
                        [ span [ class "ecc-field__label" ] [ text "Status" ]
                        , div [ class "stage-pills" ]
                            (List.map
                                (\s ->
                                    button
                                        [ type_ "button"
                                        , class (if tf.status == s then "stage-pill stage-pill--active" else "stage-pill")
                                        , onClick (UpdatedTaskFormField "status" s)
                                        , disabled tf.submitting
                                        ]
                                        [ text (taskStatusLabel s) ]
                                )
                                taskStatuses
                            )
                        ]
                    , div [ class "ecc-field ecc-field--notes" ]
                        [ span [ class "ecc-field__label" ] [ text "Description" ]
                        , textarea
                            [ value tf.description
                            , onInput (UpdatedTaskFormField "description")
                            , disabled tf.submitting
                            , Attr.rows 3
                            , placeholder "What needs to be done?"
                            ]
                            []
                        ]
                    , div [ class "modal__actions" ]
                        [ button [ type_ "button", class "ecc-btn ecc-btn--ghost ecc-btn--inline", onClick RequestedCloseTaskForm, disabled tf.submitting ] [ text "Cancel" ]
                        , button
                            [ type_ "submit"
                            , class "ecc-btn ecc-btn--inline"
                            , disabled (tf.submitting || not tf.dirty)
                            ]
                            [ text (if tf.submitting then "Saving…" else "Save task") ]
                        ]
                    ]
            ]
        ]


deleteTaskConfirmModal : Task -> Html Msg
deleteTaskConfirmModal task =
    div [ class "modal-backdrop", onClick CancelledDeleteTask ]
        [ div
            [ class "modal modal--narrow"
            , Attr.attribute "role" "alertdialog"
            , Html.Events.stopPropagationOn "click" (D.succeed ( DismissedToast, True ))
            ]
            [ header [ class "modal__header" ]
                [ h2 [ class "modal__title" ] [ text "Delete task" ]
                ]
            , p [ class "modal__confirm-text" ]
                [ text "Delete "
                , strong [] [ text task.title ]
                , text "?"
                ]
            , div [ class "modal__actions" ]
                [ button [ type_ "button", class "ecc-btn ecc-btn--ghost ecc-btn--inline", onClick CancelledDeleteTask ] [ text "Cancel" ]
                , button [ type_ "button", class "ecc-btn ecc-btn--danger ecc-btn--inline", onClick ConfirmedDeleteTask ] [ text "Delete" ]
                ]
            ]
        ]


placeholderView : String -> String -> Html Msg
placeholderView heading message =
    div []
        [ h1 [ class "content__heading" ] [ text heading ]
        , p [ class "content__lede" ] [ text message ]
        , div [ class "content__empty-block" ]
            [ text "Coming soon." ]
        ]


-- ================= SETTINGS =================


settingsFieldError : String -> List ( String, String ) -> Maybe String
settingsFieldError field errors =
    errors
        |> List.filter (\( f, _ ) -> f == field)
        |> List.head
        |> Maybe.map Tuple.second


settingsTextField :
    String
    -> String
    -> String
    -> String
    -> Bool
    -> (String -> Msg)
    -> Maybe String
    -> Html Msg
settingsTextField fieldId labelText inputType currentValue isDisabled toMsg err =
    let
        cls =
            case err of
                Just _ ->
                    "ecc-field ecc-field--error"

                Nothing ->
                    "ecc-field"
    in
    div [ class cls ]
        ([ input
            [ id fieldId
            , type_ inputType
            , placeholder " "
            , value currentValue
            , onInput toMsg
            , disabled isDisabled
            ]
            []
         , label [ for fieldId ] [ text labelText ]
         ]
            ++ (case err of
                    Just msg ->
                        [ p [ class "ecc-field__message" ] [ text msg ] ]

                    Nothing ->
                        []
               )
        )


settingsStatus : Maybe String -> List ( String, String ) -> Html Msg
settingsStatus success errors =
    case ( success, settingsFieldError "form" errors ) of
        ( Just msg, _ ) ->
            div [ class "settings-status settings-status--ok" ] [ text msg ]

        ( _, Just msg ) ->
            div [ class "settings-status settings-status--error" ] [ text msg ]

        _ ->
            text ""


settingsProfileCard : Model -> Html Msg
settingsProfileCard model =
    let
        pf =
            model.profileForm

        nameErr =
            settingsFieldError "name" pf.errors

        emailErr =
            settingsFieldError "email" pf.errors

        submitLabel =
            if pf.submitting then
                "Saving…"

            else
                "Save changes"

        canSubmit =
            not pf.submitting
                && (case model.user of
                        Just u ->
                            (String.trim pf.name /= u.name)
                                || (String.trim pf.email /= u.email)

                        Nothing ->
                            False
                   )
    in
    detailCard "Profile"
        Nothing
        (div [ class "settings-form" ]
            [ settingsTextField "pf-name"
                "Full name"
                "text"
                pf.name
                pf.submitting
                (UpdatedProfileField "name")
                nameErr
            , settingsTextField "pf-email"
                "Email address"
                "email"
                pf.email
                pf.submitting
                (UpdatedProfileField "email")
                emailErr
            , settingsStatus pf.success pf.errors
            , div [ class "settings-actions" ]
                [ button
                    [ type_ "button"
                    , class "ecc-btn ecc-btn--inline"
                    , onClick SubmittedProfile
                    , disabled (not canSubmit)
                    ]
                    [ text submitLabel ]
                ]
            ]
        )


settingsPasswordCard : Model -> Html Msg
settingsPasswordCard model =
    let
        pf =
            model.passwordForm

        submitLabel =
            if pf.submitting then
                "Updating…"

            else
                "Change password"
    in
    detailCard "Password"
        Nothing
        (div [ class "settings-form" ]
            [ settingsTextField "pw-current"
                "Current password"
                "password"
                pf.current
                pf.submitting
                (UpdatedPasswordField "current")
                (settingsFieldError "current" pf.errors)
            , settingsTextField "pw-next"
                "New password"
                "password"
                pf.next
                pf.submitting
                (UpdatedPasswordField "next")
                (settingsFieldError "next" pf.errors)
            , settingsTextField "pw-confirm"
                "Confirm new password"
                "password"
                pf.confirm
                pf.submitting
                (UpdatedPasswordField "confirm")
                (settingsFieldError "confirm" pf.errors)
            , settingsStatus pf.success pf.errors
            , div [ class "settings-actions" ]
                [ button
                    [ type_ "button"
                    , class "ecc-btn ecc-btn--inline"
                    , onClick SubmittedPassword
                    , disabled pf.submitting
                    ]
                    [ text submitLabel ]
                ]
            ]
        )


settingsSessionsCard : Model -> Html Msg
settingsSessionsCard _ =
    detailCard "Sessions"
        Nothing
        (div [ class "settings-session" ]
            [ div [ class "settings-session__copy" ]
                [ h4 [ class "settings-session__title" ]
                    [ text "Sign out of all devices" ]
                , p [ class "settings-session__desc" ]
                    [ text "Every token issued for this account will be revoked. You'll need to sign in again everywhere, including here." ]
                ]
            , button
                [ type_ "button"
                , class "ecc-btn ecc-btn--danger ecc-btn--inline"
                , onClick RequestedLogoutAll
                ]
                [ text "Sign out all devices" ]
            ]
        )


settingsView : Model -> Html Msg
settingsView model =
    div [ class "settings" ]
        [ header [ class "settings__header" ]
            [ h1 [ class "content__heading" ] [ text "Settings" ]
            , p [ class "content__lede" ]
                [ text "Manage your account and security preferences." ]
            ]
        , div [ class "settings__grid" ]
            [ settingsProfileCard model
            , settingsPasswordCard model
            , settingsSessionsCard model
            ]
        ]


logoutAllConfirmModal : Html Msg
logoutAllConfirmModal =
    div [ class "modal-backdrop", onClick CancelledLogoutAll ]
        [ div
            [ class "modal modal--narrow"
            , Attr.attribute "role" "alertdialog"
            , Attr.attribute "aria-modal" "true"
            , Attr.attribute "aria-label" "Sign out all devices"
            , Html.Events.stopPropagationOn "click"
                (D.succeed ( DismissedToast, True ))
            ]
            [ header [ class "modal__header" ]
                [ h2 [ class "modal__title" ] [ text "Sign out all devices" ]
                , button
                    [ class "modal__close"
                    , type_ "button"
                    , onClick CancelledLogoutAll
                    , Attr.attribute "aria-label" "Close"
                    ]
                    [ svgIcon
                        [ Attr.attribute "viewBox" "0 0 24 24"
                        , Attr.attribute "width" "18"
                        , Attr.attribute "height" "18"
                        , Attr.attribute "fill" "none"
                        , Attr.attribute "stroke" "currentColor"
                        , Attr.attribute "stroke-width" "2"
                        , Attr.attribute "stroke-linecap" "round"
                        , Attr.attribute "stroke-linejoin" "round"
                        ]
                        [ svgPath "M18 6 6 18"
                        , svgPath "M6 6l12 12"
                        ]
                    ]
                ]
            , p [ class "modal__confirm-text" ]
                [ text "Every active session will be signed out, including this one. Continue?" ]
            , div [ class "modal__actions" ]
                [ button
                    [ type_ "button"
                    , class "ecc-btn ecc-btn--ghost ecc-btn--inline"
                    , onClick CancelledLogoutAll
                    ]
                    [ text "Cancel" ]
                , button
                    [ type_ "button"
                    , class "ecc-btn ecc-btn--danger ecc-btn--inline"
                    , onClick ConfirmedLogoutAll
                    ]
                    [ text "Sign out everywhere" ]
                ]
            ]
        ]


-- ================= PAGE CONTENT =================


pageContent : Model -> User -> Html Msg
pageContent model user =
    div [ class "content__body" ]
        [ case model.route of
            Home ->
                homeView model user

            Contacts ->
                contactsView model

            ContactDetail _ ->
                case model.viewingContact of
                    Just c ->
                        contactDetailView model c

                    Nothing ->
                        div [ class "content__empty-block" ]
                            [ text "Contact not found." ]

            Deals ->
                dealsView model

            DealDetail _ ->
                case model.viewingDeal of
                    Just d ->
                        dealDetailView model d

                    Nothing ->
                        div [ class "content__empty-block" ]
                            [ text "Deal not found." ]

            Tasks ->
                tasksView model

            Reports ->
                placeholderView "Reports" "Analytics and reports will appear here."

            Settings ->
                settingsView model
        , case model.contactForm of
            Just cf ->
                contactFormModal model cf

            Nothing ->
                text ""
        , case model.deletingContact of
            Just contact ->
                deleteConfirmModal contact

            Nothing ->
                text ""
        , case model.dealForm of
            Just df ->
                dealFormModal model df

            Nothing ->
                text ""
        , case model.deletingDeal of
            Just deal ->
                deleteDealConfirmModal deal

            Nothing ->
                text ""
        , case model.activityForm of
            Just af ->
                activityFormModal af

            Nothing ->
                text ""
        , case model.deletingActivity of
            Just a ->
                deleteActivityConfirmModal a

            Nothing ->
                text ""
        , if model.logoutAllConfirm then
            logoutAllConfirmModal

          else
            text ""
        , case model.toast of
            Just msg ->
                toastView msg

            Nothing ->
                text ""
        ]


-- ================= APP SHELL =================


appShell : Model -> User -> Html Msg
appShell model user =
    div [ class "app-shell" ]
        [ sidebar model user
        , div [ class "app-main" ]
            [ topbar model user
            , main_ [ class "content" ]
                [ div [ class "content__header" ]
                    [ h1 [ class "content__title" ]
                        [ text (pageTitle model) ]
                    ]
                , pageContent model user
                ]
            ]
        ]


-- ================= LOADING =================


loadingView : Html Msg
loadingView =
    div [ class "ecc-dashboard" ]
        [ div [ class "ecc-loading" ]
            [ div [ class "ecc-loading__spinner" ] []
            , p [ class "ecc-loading__text" ]
                [ text "Restoring your session…" ]
            ]
        ]


-- ================= ROOT VIEW =================


view : Model -> Html Msg
view model =
    main_ [ class "ecc-shell" ]
        [ if model.bootstrapping then
            loadingView

          else
            case model.user of
                Just user ->
                    appShell model user

                Nothing ->
                    div [ class "ecc-split" ]
                        [ brandPanel
                        , loginCard model
                        ]
        ]
