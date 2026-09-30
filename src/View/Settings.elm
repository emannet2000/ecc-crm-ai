module View.Settings exposing (logoutAllConfirmModal, settingsView)

{-| Settings page. -}

import Html exposing (..)
import Html.Attributes as Attr exposing (class, id, type_, placeholder, value, disabled, for)
import Html.Events exposing (onClick, onInput)
import Json.Decode as D
import Types exposing (..)
import View.Helpers exposing (detailCard, svgIcon, svgPath)


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
