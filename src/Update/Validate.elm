module Update.Validate exposing (validate, validateActivityForm, validateAgentForm, validateCaseForm, validateContactForm, validateDealForm, validateLeadForm, validateSchoolForm, validateStudentForm)

{-| Form validation.
-}

import Types exposing (..)


validate : Form -> Mode -> List ( Field, String )
validate form mode =
    let
        nameErr =
            if mode == Register && String.isEmpty (String.trim form.name) then
                [ ( NameField, "Please enter your name." ) ]

            else
                []

        emailErr =
            if not (String.contains "@" form.email && String.contains "." form.email) then
                [ ( EmailField, "Please enter a valid email." ) ]

            else
                []

        passErr =
            if
                String.length form.password
                    < (if mode == Register then
                        12

                       else
                        8
                      )
            then
                [ ( PasswordField, "Password must be at least 12 characters when registering." ) ]

            else
                []
    in
    nameErr ++ emailErr ++ passErr


validateDealForm : DealForm -> ( DealForm, Bool )
validateDealForm df =
    let
        titleErr =
            if String.isEmpty (String.trim df.title) then
                [ ( "title", "Title is required." ) ]

            else
                []

        valueErr =
            case String.toFloat df.value of
                Just v ->
                    if v < 0 then
                        [ ( "value", "Value can't be negative." ) ]

                    else
                        []

                Nothing ->
                    if String.isEmpty (String.trim df.value) then
                        [ ( "value", "Deal value is required." ) ]

                    else
                        [ ( "value", "Enter a valid number." ) ]

        allErrors =
            titleErr ++ valueErr
    in
    ( { df | errors = allErrors }, List.isEmpty allErrors )


validateContactForm : ContactForm -> ( ContactForm, Bool )
validateContactForm cf =
    let
        nameErr =
            if String.isEmpty (String.trim cf.name) then
                [ ( "name", "Name is required." ) ]

            else
                []

        emailErr =
            if String.isEmpty (String.trim cf.email) then
                [ ( "email", "Email is required." ) ]

            else if not (String.contains "@" cf.email && String.contains "." cf.email) then
                [ ( "email", "Please enter a valid email." ) ]

            else
                []

        allErrors =
            nameErr ++ emailErr
    in
    ( { cf | errors = allErrors }, List.isEmpty allErrors )


validateActivityForm : ActivityForm -> ( ActivityForm, Bool )
validateActivityForm af =
    let
        kindErr =
            if List.member af.kind activityKinds then
                []

            else
                [ ( "kind", "Pick a kind." ) ]

        titleErr =
            if String.isEmpty (String.trim af.title) then
                [ ( "title", "Title is required." ) ]

            else
                []

        allErrors =
            kindErr ++ titleErr
    in
    ( { af | errors = allErrors }, List.isEmpty allErrors )


validateSchoolForm : SchoolForm -> ( SchoolForm, Bool )
validateSchoolForm sf =
    let
        nameErr =
            if String.isEmpty (String.trim sf.name) then
                [ ( "name", "School name is required." ) ]

            else
                []

        statusErr =
            if List.member sf.contractStatus [ "Signed", "Pending", "Follow-up Required" ] then
                []

            else
                [ ( "contractStatus", "Pick a contract status." ) ]

        enrolledErr =
            case String.toInt sf.studentsEnrolled of
                Just n ->
                    if n < 0 then
                        [ ( "studentsEnrolled", "Can't be negative." ) ]

                    else
                        []

                Nothing ->
                    if String.isEmpty (String.trim sf.studentsEnrolled) then
                        [ ( "studentsEnrolled", "Enter a number." ) ]

                    else
                        [ ( "studentsEnrolled", "Enter a valid number." ) ]

        allErrors =
            nameErr ++ statusErr ++ enrolledErr
    in
    ( { sf | errors = allErrors }, List.isEmpty allErrors )


validateStudentForm : StudentForm -> ( StudentForm, Bool )
validateStudentForm sf =
    let
        nameErr =
            if String.isEmpty (String.trim sf.name) then
                [ ( "name", "Student name is required." ) ]

            else
                []

        acceptanceErr =
            if List.member sf.acceptanceStatus acceptanceStatuses then
                []

            else
                [ ( "acceptanceStatus", "Pick an acceptance status." ) ]

        visaErr =
            if List.member sf.visaStatus visaStatuses then
                []

            else
                [ ( "visaStatus", "Pick a visa status." ) ]

        invoiceErr =
            if List.member sf.invoiceStatus invoiceStatuses then
                []

            else
                [ ( "invoiceStatus", "Pick an invoice status." ) ]

        allErrors =
            nameErr ++ acceptanceErr ++ visaErr ++ invoiceErr
    in
    ( { sf | errors = allErrors }, List.isEmpty allErrors )


validateAgentForm : AgentForm -> ( AgentForm, Bool )
validateAgentForm af =
    let
        nameErr =
            if String.isEmpty (String.trim af.name) then
                [ ( "name", "Agent name is required." ) ]

            else
                []

        contractErr =
            if List.member af.contractStatus agentContractStatuses then
                []

            else
                [ ( "contractStatus", "Pick a contract status." ) ]

        statusErr =
            if List.member af.agentStatus agentStatuses then
                []

            else
                [ ( "agentStatus", "Pick an agent status." ) ]

        referredErr =
            case String.toInt af.studentsReferred of
                Just n ->
                    if n < 0 then
                        [ ( "studentsReferred", "Can't be negative." ) ]

                    else
                        []

                Nothing ->
                    [ ( "studentsReferred", "Enter a valid number." ) ]

        allErrors =
            nameErr ++ contractErr ++ statusErr ++ referredErr
    in
    ( { af | errors = allErrors }, List.isEmpty allErrors )


validateLeadForm : LeadForm -> ( LeadForm, Bool )
validateLeadForm lf =
    let
        nameErr =
            if String.isEmpty (String.trim lf.name) then
                [ ( "name", "Lead name is required." ) ]

            else
                []

        sourceErr =
            if List.member lf.source leadSources then
                []

            else
                [ ( "source", "Pick a source." ) ]

        statusErr =
            if List.member lf.status leadStatuses then
                []

            else
                [ ( "status", "Pick a status." ) ]

        allErrors =
            nameErr ++ sourceErr ++ statusErr
    in
    ( { lf | errors = allErrors }, List.isEmpty allErrors )


validateCaseForm : CaseForm -> ( CaseForm, Bool )
validateCaseForm cf =
    let
        clientErr =
            if String.isEmpty (String.trim cf.clientId) then
                [ ( "clientId", "Client is required." ) ]

            else
                []

        serviceErr =
            if String.isEmpty (String.trim cf.serviceCategory) then
                [ ( "serviceCategory", "Service category is required." ) ]

            else
                []

        stageErr =
            if List.member cf.currentStage caseStages then
                []

            else
                [ ( "currentStage", "Pick a stage." ) ]

        prioErr =
            if List.member cf.priority casePriorities then
                []

            else
                [ ( "priority", "Pick a priority." ) ]

        allErrors =
            clientErr ++ serviceErr ++ stageErr ++ prioErr
    in
    ( { cf | errors = allErrors }, List.isEmpty allErrors )
