document.addEventListener("DOMContentLoaded", () => {
    //uzywam abortcontroller aby anulowac zapytania asynchroniczne
    let controller = new AbortController()
    //wlasciwosc signal, która pozwala
    // powiązać konkretne zapytanie do serwera z odpowiednim sygnałem
    let signal = controller.signal

    let nick = ""
    while (nick.trim() == "")
        nick = prompt("Podaj nick")

    login(nick, signal)

    const messageInput = document.getElementById("message")
    messageInput.addEventListener("keydown", e => {
        //po nacisnieciu enter, wywolujemy funkcje sendMessage, getMessages
        //oraz czyscimy pole do wprowadzania 
        if (e.keyCode == 13) {
            //anulowanie obslugi sygnalu
            controller.abort()
            sendMessage(messageInput.value, nick)
            controller = new AbortController()
            signal = controller.signal
            getMessages(nick, signal)
            clearMessageInput()
        }
    })

    const messagesTextArea = document.getElementById("messages")
    messagesTextArea.value = "<span style='color: red;'>test</span>"
    messagesTextArea.value += "<span style='color: blue;'>test2</span>"
})

async function login(nick, signal) {
    const res = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "Application/json"
        },
        body: JSON.stringify({ nick }),
        signal
    })

    if (!res.ok)
        throw new Error("Błąd zapytania - " + res.status)

    const data = await res.json()
    if (data.status == "USER_EXIST") {
        alert("Użytkownik o takim nicku już istnieje!")
        window.location.reload()
        return
    }

    getMessages(nick, signal)
}

async function getMessages(nick, signal) {
    const res = await fetch("/messages?nick=" + nick, { signal })
    if (!res.ok)
        throw new Error("Błąd zapytania - " + res.status)

    const data = await res.json() //messages {user, color, time, message}
    console.log(data)
    updateMessagesDiv(data)
    getMessages(nick, signal)
}

async function sendMessage(message, nick) {
    //funkcja odpowiadajaca za wysylanie 
    const res = await fetch("/message", {
        method: "POST",
        headers: {
            "Content-Type": "Application/json"
        },
        body: JSON.stringify({ nick, message }),
    })

    if (!res.ok)
        throw new Error("Błąd zapytania - " + res.status)

    const data = await res.json()
    //update diva
    updateMessagesDiv(data)
}

function updateMessagesDiv(messageObj) {
    //aktualizacja wiadomosci
    const messagesDiv = document.getElementById("messages")
    const line = `<p>[${messageObj.time}]<<span style='color:#${messageObj.color}'>@${messageObj.nick}</span>> ${messageObj.message}</p>`
    messagesDiv.innerHTML += line
    //emotikonki
    $("#messages").emoticonize();
}

function clearMessageInput() {
    //no i czyszczenie inputa
    const messageInput = document.getElementById("message")
    messageInput.value = ""
}