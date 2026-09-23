module Types exposing (..)

import Browser
import Browser.Navigation as Nav
import Url


type Mode
    = Login
    | Register


type Route
    = Home
    | Contacts
    | ContactDetail String
    | Deals
    | DealDetail String
    | Tasks
    | Reports
    | Settings


type AlertType
    = AlertError
    | AlertSuccess


type alias Alert =
    { kind : AlertType
    , message : String
    }


type alias User =
    { id : String
    , name : String
    , email : String
    }


type alias Contact =
    { id : String
    , name : String
    , email : String
    , company : String
    , title : String
    , phone : String
    , location : String
    , stage : String
    , lastContact : String
    , owner : String
    , tags : List String
    , notes : String
    , createdAt : String
    }


type RemoteData a
    = NotAsked
    | Loading
    | Success a
    | Failure String


type alias ContactsData =
    { items : List Contact
    , query : String
    , total : Int
    , offset : Int
    , limit : Int
    }


type alias ContactForm =
    { name : String
    , email : String
    , company : String
    , title : String
    , phone : String
    , location : String
    , stage : String
    , tags : List String
    , tagInput : String
    , notes : String
    , errors : List ( String, String )
    , submitting : Bool
    , dirty : Bool
    , confirmDiscard : Bool
    }


emptyContactForm : ContactForm
emptyContactForm =
    { name = ""
    , email = ""
    , company = ""
    , title = ""
    , phone = ""
    , location = ""
    , stage = "Lead"
    , tags = []
    , tagInput = ""
    , notes = ""
    , errors = []
    , submitting = False
    , dirty = False
    , confirmDiscard = False
    }


contactToForm : Contact -> ContactForm
contactToForm c =
    { name = c.name
    , email = c.email
    , company = c.company
    , title = c.title
    , phone = c.phone
    , location = c.location
    , stage = c.stage
    , tags = c.tags
    , tagInput = ""
    , notes = c.notes
    , errors = []
    , submitting = False
    , dirty = False
    , confirmDiscard = False
    }


type alias Deal =
    { id : String
    , title : String
    , contactId : String
    , contactName : String
    , value : Float
    , stage : String
    , closeDate : String
    , owner : String
    , notes : String
    , createdAt : String
    }


type alias DealsData =
    { items : List Deal
    , query : String
    , total : Int
    , offset : Int
    , limit : Int
    }


type alias DealForm =
    { title : String
    , contactId : String
    , value : String
    , stage : String
    , closeDate : String
    , owner : String
    , notes : String
    , errors : List ( String, String )
    , submitting : Bool
    , dirty : Bool
    , confirmDiscard : Bool
    }


emptyDealForm : DealForm
emptyDealForm =
    { title = ""
    , contactId = ""
    , value = ""
    , stage = "Lead"
    , closeDate = ""
    , owner = ""
    , notes = ""
    , errors = []
    , submitting = False
    , dirty = False
    , confirmDiscard = False
    }


dealToForm : Deal -> DealForm
dealToForm d =
    { title = d.title
    , contactId = d.contactId
    , value = String.fromFloat d.value
    , stage = d.stage
    , closeDate = d.closeDate
    , owner = d.owner
    , notes = d.notes
    , errors = []
    , submitting = False
    , dirty = False
    , confirmDiscard = False
    }


type alias Activity =
    { id : String
    , contactId : String
    , dealId : String
    , kind : String
    , title : String
    , body : String
    , occurredAt : String
    , createdBy : String
    , createdAt : String
    }


type alias Task =
    { id : String
    , title : String
    , description : String
    , status : String
    , dueDate : String
    , contactId : String
    , contactName : String
    , owner : String
    , createdAt : String
    }


type alias TasksData =
    { items : List Task
    , query : String
    , statusFilter : String
    , total : Int
    }


type alias TaskForm =
    { title : String
    , description : String
    , status : String
    , dueDate : String
    , contactId : String
    , owner : String
    , errors : List ( String, String )
    , submitting : Bool
    , dirty : Bool
    , confirmDiscard : Bool
    }


emptyTaskForm : TaskForm
emptyTaskForm =
    { title = ""
    , description = ""
    , status = "todo"
    , dueDate = ""
    , contactId = ""
    , owner = ""
    , errors = []
    , submitting = False
    , dirty = False
    , confirmDiscard = False
    }


taskToForm : Task -> TaskForm
taskToForm task =
    { title = task.title
    , description = task.description
    , status = task.status
    , dueDate = task.dueDate
    , contactId = task.contactId
    , owner = task.owner
    , errors = []
    , submitting = False
    , dirty = False
    , confirmDiscard = False
    }


taskStatuses : List String
taskStatuses =
    [ "todo", "in_progress", "done" ]


type alias ActivityForm =
    { kind : String
    , title : String
    , body : String
    , occurredAt : String
    , errors : List ( String, String )
    , submitting : Bool
    }


emptyActivityForm : ActivityForm
emptyActivityForm =
    { kind = "note"
    , title = ""
    , body = ""
    , occurredAt = ""
    , errors = []
    , submitting = False
    }


activityKinds : List String
activityKinds =
    [ "note", "call", "email", "meeting", "task" ]


type alias ProfileForm =
    { name : String
    , email : String
    , errors : List ( String, String )
    , submitting : Bool
    , success : Maybe String
    }


emptyProfileForm : ProfileForm
emptyProfileForm =
    { name = ""
    , email = ""
    , errors = []
    , submitting = False
    , success = Nothing
    }


profileFromUser : User -> ProfileForm
profileFromUser u =
    { name = u.name
    , email = u.email
    , errors = []
    , submitting = False
    , success = Nothing
    }


type alias PasswordForm =
    { current : String
    , next : String
    , confirm : String
    , errors : List ( String, String )
    , submitting : Bool
    , success : Maybe String
    }


emptyPasswordForm : PasswordForm
emptyPasswordForm =
    { current = ""
    , next = ""
    , confirm = ""
    , errors = []
    , submitting = False
    , success = Nothing
    }


type alias ProfileUpdateResponse =
    { user : User
    , token : String
    }


type ApiError
    = FieldErrors (List ( String, String ))
    | GenericError String


type alias Form =
    { name : String
    , email : String
    , password : String
    , remember : Bool
    }


type alias AuthResponse =
    { token : String
    , user : User
    }


type Field
    = NameField
    | EmailField
    | PasswordField


type alias Model =
    { mode : Mode
    , form : Form
    , errors : List ( Field, String )
    , alert : Maybe Alert
    , submitting : Bool
    , token : Maybe String
    , user : Maybe User
    , showPassword : Bool
    , bootstrapping : Bool
    , route : Route
    , contacts : RemoteData ContactsData
    , viewingContact : Maybe Contact
    , contactForm : Maybe ContactForm
    , editingId : Maybe String
    , deletingContact : Maybe Contact
    , toast : Maybe String
    , deals : RemoteData DealsData
    , viewingDeal : Maybe Deal
    , dealForm : Maybe DealForm
    , editingDealId : Maybe String
    , deletingDeal : Maybe Deal
    , movingDealId : Maybe String
    , activities : RemoteData (List Activity)
    , activityForm : Maybe ActivityForm
    , deletingActivity : Maybe Activity
    , tasks : RemoteData TasksData
    , taskForm : Maybe TaskForm
    , editingTaskId : Maybe String
    , deletingTask : Maybe Task
    , pendingContactsQuery : Maybe String
    , pendingDealsQuery : Maybe String
    , pendingTasksQuery : Maybe String
    , profileForm : ProfileForm
    , passwordForm : PasswordForm
    , logoutAllConfirm : Bool
    , navKey : Nav.Key
    }


emptyForm : Form
emptyForm =
    { name = ""
    , email = ""
    , password = ""
    , remember = True
    }


type Msg
    = UpdatedField Field String
    | ToggledRemember Bool
    | ToggledShowPassword
    | Submitted
    | SwitchedMode Mode
    | GotAuth (Result String AuthResponse)
    | GotUser (Result String User)
    | LoggedOut
    | NavigatedTo Route
    | GotContacts (Result String ( List Contact, Int ))
    | UpdatedContactsQuery String
    | OpenedContactDetail Contact
    | OpenedAddContact
    | OpenedEditContact Contact
    | RequestedCloseContactForm
    | ConfirmedCloseContactForm
    | CancelledCloseContactForm
    | UpdatedContactFormField String String
    | AddedContactTag
    | RemovedContactTag String
    | SubmittedContactForm
    | GotSavedContact (Result ApiError Contact)
    | RequestedDeleteContact Contact
    | CancelledDeleteContact
    | ConfirmedDeleteContact
    | GotDeletedContact (Result String String)
    | GotDeals (Result String ( List Deal, Int ))
    | OpenedAddDeal
    | OpenedAddDealWithStage String
    | OpenedEditDeal Deal
    | OpenedDealDetail Deal
    | RequestedCloseDealForm
    | ConfirmedCloseDealForm
    | CancelledCloseDealForm
    | UpdatedDealFormField String String
    | SubmittedDealForm
    | GotSavedDeal (Result ApiError Deal)
    | UpdatedDealsQuery String
    | MovedDeal Deal String
    | GotMovedDeal (Result ApiError Deal)
    | RequestedDeleteDeal Deal
    | CancelledDeleteDeal
    | ConfirmedDeleteDeal
    | GotDeletedDeal (Result String String)
    | GotActivities (Result String (List Activity))
    | OpenedActivityForm
    | ClosedActivityForm
    | UpdatedActivityFormField String String
    | SubmittedActivityForm
    | GotSavedActivity (Result ApiError Activity)
    | RequestedDeleteActivity Activity
    | CancelledDeleteActivity
    | ConfirmedDeleteActivity
    | GotDeletedActivity (Result String String)
    | UpdatedProfileField String String
    | SubmittedProfile
    | GotUpdatedProfile (Result ApiError ProfileUpdateResponse)
    | UpdatedPasswordField String String
    | SubmittedPassword
    | GotChangedPassword (Result String String)
    | RequestedLogoutAll
    | CancelledLogoutAll
    | ConfirmedLogoutAll
    | GotLogoutAll (Result String String)
    | GotTasks (Result String ( List Task, Int ))
    | UpdatedTasksQuery String
    | UpdatedTasksStatusFilter String
    | OpenedAddTask
    | OpenedEditTask Task
    | RequestedCloseTaskForm
    | ConfirmedCloseTaskForm
    | CancelledCloseTaskForm
    | UpdatedTaskFormField String String
    | SubmittedTaskForm
    | GotSavedTask (Result ApiError Task)
    | ToggledTaskStatus Task String
    | GotToggledTask (Result ApiError Task)
    | RequestedDeleteTask Task
    | CancelledDeleteTask
    | ConfirmedDeleteTask
    | GotDeletedTask (Result String String)
    | ContactsPageChanged Int
    | FlushContactsSearch
    | FlushDealsSearch
    | FlushTasksSearch
    | LinkClicked Browser.UrlRequest
    | UrlChanged Url.Url
    | DismissedToast
    | EscapePressed
