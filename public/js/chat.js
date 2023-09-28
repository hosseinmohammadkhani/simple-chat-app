//initializes socket.io on user's browser
const chatNamespace = io("/chat"); 

//Query DOM
const messageInput = document.getElementById("messageInput"),
    chatForm = document.getElementById("chatForm"),
    chatBox = document.getElementById("chat-box"),
    feedback = document.getElementById("feedback"),
    onlineUsers = document.getElementById("online-users-list"),
    chatContainer = document.getElementById("chatContainer"),
    pvChatForm = document.getElementById("pvChatForm"),
    pvMessageInput = document.getElementById("pvMessageInput"),
    modalTitle = document.getElementById("modalTitle"),
    pvMessage = document.getElementById("pvMessage")

// Options for formatting the date and time
const options = {
  timeZone: 'Asia/Tehran',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: false, // Set to true if you want 12-hour format with AM/PM
};

//Emit events
const username = localStorage.getItem("username"),
    chatRoom = localStorage.getItem("chatroom")
let receiverId;

//Emits login event to server
chatNamespace.emit("login" , { username , chatRoom })

//Listens to online-users event sent by server
chatNamespace.on("online-users" , users => {
    onlineUsers.innerHTML = ""
    
    //Access the value by its key
    for(let socketId in users){
        if(chatRoom === users[socketId].chatRoom){
           onlineUsers.innerHTML += `
            <li>
                <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pvChat" data-id=${socketId} data-user=${users[socketId].username} 
                ${users[socketId].username === username ? "disabled" : ""}>
                    ${users[socketId].username}
                    <span class="badge badge-success"> </span>
                </button>
            </li>
            ` 
        }
    }
    
    
})

chatForm.addEventListener("submit" , e => {
    e.preventDefault() //prevents from page refresh
    if(messageInput.value){
        
        //Emits chat-message event to server
        chatNamespace.emit("chat-message" , {
            message : messageInput.value,
            username : username,
            chatRoom : chatRoom ,
            date : new Date().toLocaleString('en-US', options).slice(18)
        })
    }
    messageInput.value = ""
})

//Listens to "chat-message" event sent by server(for all users)
chatNamespace.on("chat-message" , data => {
    chatBox.innerHTML += `
        <li class="alert alert-light">
        <span
            class="text-dark font-weight-normal"
            style="font-size: 13pt"
            >${data.username}</span
        >
        <span
            class="
                text-muted
                font-italic font-weight-light
                m-2
            "
            style="font-size: 9pt"
            >${data.date}</span
        >
        <p
            class="alert alert-info mt-2"
            style="font-family: persian01"
        >
        ${data.message}
        </p>
        </li>
    `
    feedback.innerHTML = ""
    chatContainer.scrollTop = chatContainer.scrollHeight - chatContainer.clientHeight
    
})

//Emits typing event to server
messageInput.addEventListener("keypress" , () => chatNamespace.emit("typing" , { username : username  , chatRoom  : chatRoom}))

//Listens to "typing" event sent by the server(for all users)
chatNamespace.on("typing" , 
    data => {
        if(chatRoom === data.chatRoom) feedback.innerHTML = `<p class="alert alert-warning w-25"><em>${data.username} is typing...</em></p>`
    }
)
pvChatForm.addEventListener("submit" , e => {
    e.preventDefault()

    //1- Emits pvChat event to server
    chatNamespace.emit("pvChat" , {
        message : pvMessageInput.value,
        sender : username,
        receiverId : receiverId,
        senderId : chatNamespace.id
    })
    $("#pvChat").modal("hide")
    pvMessageInput.value = ""
    
})

//Listens to pvChat event sent by server
chatNamespace.on("pvChat" , data => {
    $("#pvChat").modal("show")
    receiverId = data.senderId
    pvMessage.style = "display: block;"
    modalTitle.innerHTML = `ارسال پیام به : ${data.sender}`
    pvMessage.innerHTML += `${data.sender} : ${data.message}<br>`
})

$('#pvChat').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var user = button.data('user') // Extract info from data-* attributes
    receiverId = button.data('id')
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    
    modalTitle.innerHTML = "ارسال پیام به : " + user
    pvMessage.style = "display: none;"
})