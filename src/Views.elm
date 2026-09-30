module Views exposing (view)

{-| Root view: routing between pages and app shell. -}

import Html exposing (..)
import Html.Attributes as Attr exposing (class)
import Set
import Types exposing (..)
import View.Activity exposing (activityFormModal, deleteActivityConfirmModal)
import View.Agents exposing (agentDetailView, agentFormModal, agentsView, deleteAgentConfirmModal)
import View.Cases exposing (caseDetailView, caseFormModal, casesView, deleteCaseConfirmModal, deleteDocumentConfirmModal, documentFormModal)
import View.ContactDetail exposing (contactDetailView)
import View.ContactForm exposing (contactFormModal, deleteConfirmModal)
import View.Contacts exposing (contactsView)
import View.DealDetail exposing (dealDetailView)
import View.DealForm exposing (bulkDeleteConfirmModal, bulkMoveConfirmModal, dealFormModal, deleteDealConfirmModal)
import View.Deals exposing (dealsView)
import View.Helpers exposing (toastView)
import View.Home exposing (homeView)
import View.Invoices exposing (deleteInvoiceConfirmModal, deletePaymentConfirmModal, invoiceDetailView, invoiceFormModal, invoicesView, paymentFormModal, refundConfirmModal)
import View.Layout exposing (pageTitle, sidebar, topbar)
import View.Leads exposing (deleteLeadConfirmModal, leadDetailView, leadFormModal, leadsView)
import View.Login exposing (brandPanel, loginCard)
import View.Partners exposing (deletePartnerConfirmModal, partnerDetailView, partnerFormModal, partnersView)
import View.Schools exposing (deleteSchoolConfirmModal, schoolDetailView, schoolFormModal, schoolsView)
import View.Settings exposing (logoutAllConfirmModal, settingsView)
import View.Students exposing (deleteStudentConfirmModal, studentDetailView, studentFormModal, studentsView)
import View.Tasks exposing (deleteTaskConfirmModal, taskFormModal, tasksView)


placeholderView : String -> String -> Html Msg
placeholderView heading message =
    div []
        [ h1 [ class "content__heading" ] [ text heading ]
        , p [ class "content__lede" ] [ text message ]
        , div [ class "content__empty-block" ]
            [ text "Coming soon." ]
        ]


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

            Schools ->
                schoolsView model

            SchoolDetail _ ->
                case model.viewingSchool of
                    Just s ->
                        schoolDetailView model s

                    Nothing ->
                        div [ class "content__empty-block" ]
                            [ text "School not found." ]

            Students ->
                studentsView model

            StudentDetail _ ->
                case model.viewingStudent of
                    Just s ->
                        studentDetailView model s

                    Nothing ->
                        div [ class "content__empty-block" ]
                            [ text "Student not found." ]

            Agents ->
                agentsView model

            AgentDetail _ ->
                case model.viewingAgent of
                    Just a ->
                        agentDetailView model a

                    Nothing ->
                        div [ class "content__empty-block" ]
                            [ text "Agent not found." ]

            Leads ->
                leadsView model

            LeadDetail _ ->
                case model.viewingLead of
                    Just l ->
                        leadDetailView model l

                    Nothing ->
                        div [ class "content__empty-block" ]
                            [ text "Lead not found." ]

            Cases ->
                casesView model

            CaseDetail _ ->
                case model.viewingCase of
                    Just c ->
                        caseDetailView model c

                    Nothing ->
                        div [ class "content__empty-block" ]
                            [ text "Case not found." ]

            Invoices ->
                invoicesView model

            InvoiceDetail _ ->
                case model.viewingInvoice of
                    Just inv ->
                        invoiceDetailView model inv

                    Nothing ->
                        div [ class "content__empty-block" ]
                            [ text "Invoice not found." ]

            Partners ->
                partnersView model

            PartnerDetail _ ->
                case model.viewingPartner of
                    Just p ->
                        partnerDetailView model p

                    Nothing ->
                        div [ class "content__empty-block" ]
                            [ text "Partner not found." ]
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
        , if model.bulkDeleteConfirm then
            bulkDeleteConfirmModal (Set.size model.selectedDeals)

          else
            text ""
        , if not (String.isEmpty model.bulkMoveStage) then
            bulkMoveConfirmModal model.bulkMoveStage (Set.size model.selectedDeals)

          else
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
        , case model.taskForm of
            Just tf ->
                taskFormModal model tf

            Nothing ->
                text ""
        , case model.deletingTask of
            Just task ->
                deleteTaskConfirmModal task

            Nothing ->
                text ""
        , case model.schoolForm of
            Just sf ->
                schoolFormModal model sf

            Nothing ->
                text ""
        , case model.deletingSchool of
            Just school ->
                deleteSchoolConfirmModal school

            Nothing ->
                text ""
        , case model.studentForm of
            Just sf ->
                studentFormModal model sf

            Nothing ->
                text ""
        , case model.deletingStudent of
            Just student ->
                deleteStudentConfirmModal student

            Nothing ->
                text ""
        , case model.agentForm of
            Just af ->
                agentFormModal model af

            Nothing ->
                text ""
        , case model.deletingAgent of
            Just agent ->
                deleteAgentConfirmModal agent

            Nothing ->
                text ""
        , case model.leadForm of
            Just lf ->
                leadFormModal model lf

            Nothing ->
                text ""
        , case model.deletingLead of
            Just lead ->
                deleteLeadConfirmModal lead

            Nothing ->
                text ""
        , case model.caseForm of
            Just cf ->
                caseFormModal model cf

            Nothing ->
                text ""
        , case model.deletingCase of
            Just c ->
                deleteCaseConfirmModal c

            Nothing ->
                text ""
        , case model.documentForm of
            Just df ->
                documentFormModal model df

            Nothing ->
                text ""
        , case model.deletingDocument of
            Just d ->
                deleteDocumentConfirmModal d

            Nothing ->
                text ""
        , case model.invoiceForm of
            Just inv ->
                invoiceFormModal model inv

            Nothing ->
                text ""
        , case model.deletingInvoice of
            Just inv ->
                deleteInvoiceConfirmModal inv

            Nothing ->
                text ""
        , case model.paymentForm of
            Just pf ->
                paymentFormModal pf

            Nothing ->
                text ""
        , case model.deletingPayment of
            Just p ->
                deletePaymentConfirmModal p

            Nothing ->
                text ""
        , case model.refundConfirmInvoice of
            Just inv ->
                refundConfirmModal inv

            Nothing ->
                text ""
        , case model.partnerForm of
            Just pf ->
                partnerFormModal model pf

            Nothing ->
                text ""
        , case model.deletingPartner of
            Just p ->
                deletePartnerConfirmModal p

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


loadingView : Html Msg
loadingView =
    div [ class "ecc-dashboard" ]
        [ div [ class "ecc-loading" ]
            [ div [ class "ecc-loading__spinner" ] []
            , p [ class "ecc-loading__text" ]
                [ text "Restoring your session…" ]
            ]
        ]


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
