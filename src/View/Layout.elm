module View.Layout exposing (pageDescription, pageTitle, sidebar, topbar)

{-| App chrome: sidebar, topbar, page title.
-}

import Html exposing (..)
import Html.Attributes as Attr exposing (class, type_)
import Html.Events exposing (onClick)
import Svg
import Types exposing (..)
import View.Icons exposing (iconAgent, iconContacts, iconDeals, iconHome, iconLead, iconMoon, iconReports, iconSchool, iconSettings, iconSignOut, iconStudent, iconSun, iconTasks)
import View.Search exposing (searchView)


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
        , Attr.attribute "aria-current"
            (if current == target then
                "page"

             else
                "false"
            )
        , onClick (NavigatedTo target)
        ]
        [ span [ class "nav-item__icon" ] [ icon ]
        , span [ class "nav-item__label" ] [ text label ]
        ]


hamburgerIcon : Html Msg
hamburgerIcon =
    Svg.node "svg"
        [ Attr.attribute "viewBox" "0 0 24 24"
        , Attr.attribute "width" "20"
        , Attr.attribute "height" "20"
        , Attr.attribute "fill" "none"
        , Attr.attribute "stroke" "currentColor"
        , Attr.attribute "stroke-width" "2"
        , Attr.attribute "stroke-linecap" "round"
        , Attr.attribute "stroke-linejoin" "round"
        ]
        [ Svg.node "path" [ Attr.attribute "d" "M3 12h18" ] []
        , Svg.node "path" [ Attr.attribute "d" "M3 6h18" ] []
        , Svg.node "path" [ Attr.attribute "d" "M3 18h18" ] []
        ]


isLoading : RemoteData a -> Bool
isLoading rd =
    case rd of
        Loading ->
            True

        _ ->
            False


anyLoading : Model -> Bool
anyLoading model =
    isLoading model.contacts
        || isLoading model.deals
        || isLoading model.activities
        || isLoading model.tasks
        || isLoading model.schools
        || isLoading model.students
        || isLoading model.agents
        || isLoading model.leads
        || isLoading model.cases
        || isLoading model.invoices
        || isLoading model.partners
        || isLoading model.studentDossier
        || isLoading model.caseDocuments
        || isLoading model.invoicePayments


alertCount : Model -> Int
alertCount model =
    let
        fromCases =
            case model.cases of
                Success d ->
                    List.length (List.filter (\c -> c.priority == "Urgent") d.items)

                _ ->
                    0

        fromSchools =
            case model.schools of
                Success d ->
                    List.length (List.filter (\s -> s.contractStatus == "Pending") d.items)

                _ ->
                    0

        fromAgents =
            case model.agents of
                Success d ->
                    List.length (List.filter (\a -> a.contractStatus == "Not Signed") d.items)

                _ ->
                    0
    in
    fromCases + fromSchools + fromAgents


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

        cls =
            if model.sidebarOpen then
                "sidebar is-open"

            else
                "sidebar"
    in
    aside [ class cls, Attr.id "workspace-navigation", Attr.attribute "aria-label" "Workspace navigation" ]
        [ div [ class "sidebar__brand" ]
            [ div [ class "sidebar-brand-mark" ] [ text "E" ]
            , div [ class "sidebar__wordmark" ]
                [ strong [ class "sidebar__name" ] [ text "ECC" ]
                , span [ class "sidebar__product" ] [ text "Client workspace" ]
                ]
            ]
        , nav [ class "sidebar__nav", Attr.attribute "aria-label" "CRM modules" ]
            [ span [ class "sidebar__section-label" ] [ text "Workspace" ]
            , navItem effectiveRoute Home "Overview" iconHome
            , navItem effectiveRoute Tasks "Tasks" iconTasks
            , navItem effectiveRoute Reports "Reports" iconReports
            , span [ class "sidebar__section-label" ] [ text "Relationships" ]
            , navItem effectiveRoute Contacts "Contacts" iconContacts
            , navItem effectiveRoute Leads "Leads" iconLead
            , navItem effectiveRoute Students "Students" iconStudent
            , navItem effectiveRoute Schools "Schools" iconSchool
            , navItem effectiveRoute Agents "Agents" iconAgent
            , navItem effectiveRoute Partners "Partners" iconSchool
            , span [ class "sidebar__section-label" ] [ text "Operations" ]
            , navItem effectiveRoute Deals "Deals" iconDeals
            , navItem effectiveRoute Cases "Cases" iconTasks
            , navItem effectiveRoute Invoices "Invoices" iconDeals
            ]
        , nav [ class "sidebar__nav sidebar__nav--bottom" ]
            [ navItem effectiveRoute Workspace "Workspace tools" iconSettings
            , navItem effectiveRoute Settings "Settings" iconSettings
            ]
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
topbar model user =
    let
        alerts =
            model.unreadNotifications
    in
    header [ class "topbar" ]
        [ div [ class "header-left" ]
            [ button
                [ class "topbar__menu-btn"
                , type_ "button"
                , onClick ToggledSideBar
                , Attr.attribute "aria-controls" "workspace-navigation"
                , Attr.attribute "aria-label" "Toggle navigation"
                , Attr.attribute "aria-expanded"
                    (if model.sidebarOpen then
                        "true"

                     else
                        "false"
                    )
                ]
                [ hamburgerIcon ]
            , div [ class "workspace-breadcrumb" ]
                [ span [] [ text "Workspace" ]
                , span [ class "workspace-breadcrumb__divider", Attr.attribute "aria-hidden" "true" ] [ text "/" ]
                , strong [] [ text (pageTitle model) ]
                ]
            ]
        , searchView model
        , div [ class "header-right" ]
            [ if anyLoading model then
                div
                    [ class "topbar__loading"
                    , Attr.attribute "role" "status"
                    , Attr.attribute "aria-label" "Loading data"
                    ]
                    []

              else
                text ""
            , div [ class "live-pill" ]
                [ span [ class "dot" ] []
                , text "System live"
                ]
            , button
                [ class "ecc-btn ecc-btn--ghost ecc-btn--inline"
                , type_ "button"
                , onClick (NavigatedTo Workspace)
                ]
                [ text "Notifications"
                , if alerts > 0 then
                    span [ class "badge-count" ]
                        [ text (String.fromInt alerts) ]

                  else
                    text ""
                ]
            , button
                [ class "icon-button theme-toggle"
                , type_ "button"
                , onClick ToggledTheme
                , Attr.title
                    (if model.theme == LightTheme then
                        "Switch to dark theme"

                     else
                        "Switch to light theme"
                    )
                , Attr.attribute "aria-label"
                    (if model.theme == LightTheme then
                        "Switch to dark theme"

                     else
                        "Switch to light theme"
                    )
                ]
                [ if model.theme == LightTheme then
                    iconMoon

                  else
                    iconSun
                ]
            , button [ class "user-chip", type_ "button", onClick (NavigatedTo Settings), Attr.attribute "aria-label" "Open profile settings" ]
                [ div [ class "avatar" ]
                    [ text (String.left 1 user.name) ]
                , span [ class "user-chip__name" ] [ text user.name ]
                ]
            ]
        ]


pageTitle : Model -> String
pageTitle model =
    case model.route of
        Home ->
            "Overview"

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

        Workspace ->
            "Workspace tools"

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


pageDescription : Model -> String
pageDescription model =
    case model.route of
        Home ->
            "Your pipeline, priorities, and recent activity in one place."

        Contacts ->
            "Manage client relationships and keep every conversation connected."

        Leads ->
            "Track new enquiries from first contact to conversion."

        Students ->
            "Manage student profiles, applications, and progress."

        Schools ->
            "Keep school partnerships and enrolment details up to date."

        Agents ->
            "Manage your agent network and referral relationships."

        Partners ->
            "Organise partner agreements, contacts, and compliance."

        Deals ->
            "Move opportunities forward and track your sales pipeline."

        Tasks ->
            "Stay on top of follow-ups, deadlines, and next steps."

        Cases ->
            "Track applications, documents, and decisions."

        Invoices ->
            "Manage fees, payments, and outstanding balances."

        Workspace ->
            "Manage your team, security, communication, and daily workflows."

        Reports ->
            "Understand performance, export records, and review changes."

        Settings ->
            "Manage your profile, password, and account sessions."

        _ ->
            "Review this record and manage its related activity."
