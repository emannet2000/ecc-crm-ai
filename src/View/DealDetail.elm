module View.DealDetail exposing (dealDetailView)

{-| Deal detail page. -}

import Html exposing (..)
import Html.Attributes as Attr exposing (class, type_, disabled)
import Html.Events exposing (onClick)
import Types exposing (..)
import View.Contacts exposing (contactById, contactList, stageBadge)
import View.Deals exposing (dealStageOptions)
import View.Format exposing (dealAgeDays, dealAgeLabel, formatCurrencyWith)
import View.Helpers exposing (detailCard, detailEmpty, detailStat, infoRow, initials)
import View.Icons exposing (iconBack, iconCalendar, iconDeals, iconEdit, iconTasks, iconTrash, iconUserTiny)


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

        ageDays =
            dealAgeDays model.today d.createdAt

        ageLabel =
            dealAgeLabel ageDays
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
                [ text (formatCurrencyWith d.currency d.value) ]
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
            [ detailStat "Value" (formatCurrencyWith d.currency d.value) "Deal value"
            , detailStat "Stage" d.stage "Current stage"
            , detailStat "Close date" closeDateDisplay "Expected"
            , detailStat "Age" ageLabel "Since created"
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
                        , infoRow iconDeals "Currency" d.currency
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
