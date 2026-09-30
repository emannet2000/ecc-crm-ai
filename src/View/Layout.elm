module View.Layout exposing (pageTitle, sidebar, topbar)

{-| App chrome: sidebar, topbar, page title. -}

import Html exposing (..)
import Html.Attributes as Attr exposing (class, type_)
import Html.Events exposing (onClick)
import Types exposing (..)
import View.Icons exposing (eccMark, iconAgent, iconContacts, iconDeals, iconHome, iconLead, iconReports, iconSchool, iconSettings, iconSignOut, iconStudent, iconTasks)


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

                SchoolDetail _ ->
                    Schools

                StudentDetail _ ->
                    Students

                AgentDetail _ ->
                    Agents

                LeadDetail _ ->
                    Leads

                CaseDetail _ ->
                    Cases

                InvoiceDetail _ ->
                    Invoices

                PartnerDetail _ ->
                    Partners

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
            , navItem effectiveRoute Leads "Leads" iconLead
            , navItem effectiveRoute Students "Students" iconStudent
            , navItem effectiveRoute Schools "Schools" iconSchool
            , navItem effectiveRoute Agents "Agents" iconAgent
            , navItem effectiveRoute Contacts "Contacts" iconContacts
            , navItem effectiveRoute Deals "Deals" iconDeals
            , navItem effectiveRoute Tasks "Tasks" iconTasks
            , navItem effectiveRoute Cases "Cases" iconTasks
            , navItem effectiveRoute Invoices "Invoices" iconDeals
            , navItem effectiveRoute Partners "Partners" iconSchool
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


topbar : Model -> User -> Html Msg
topbar _ user =
    header [ class "topbar" ]
        [ div [ class "topbar__brand-mobile" ] []
        , div [ class "topbar__right" ]
            [ div [ class "topbar__avatar" ]
                [ text (String.left 1 user.name) ]
            ]
        ]


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

        Schools ->
            "Schools"

        SchoolDetail _ ->
            "School"

        Students ->
            "Students"

        StudentDetail _ ->
            "Student"

        Agents ->
            "Agents"

        AgentDetail _ ->
            "Agent"

        Leads ->
            "Leads"

        LeadDetail _ ->
            "Lead"

        Cases ->
            "Cases"

        CaseDetail _ ->
            "Case"

        Invoices ->
            "Invoices"

        InvoiceDetail _ ->
            "Invoice"

        Partners ->
            "Partners"

        PartnerDetail _ ->
            "Partner"
