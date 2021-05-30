const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000;

const id = 1
const users = []

const messages = []


app.use(express.json())
app.use(express.static("public"))

// let inreval
const dataJson = ""

app.post("/login", (req, res) => {
    const { nick } = req.body
    if (nick == null || (nick != null && nick.trim() == "")) {
        res.sendStatus(400)
        return;
    }

    const color = randomColor()

    const index = users.findIndex(u => u.nick.toLowerCase() == nick.toLowerCase())
    if (index > 0) {
        res.json({ status: "USER_EXIST" })
        return;
    }
    users.push({ nick, color })
    res.json({ status: "OK" })
})

app.get("/messages", (req, res) => {
    let length = messages.length
    const inreval = setInterval(() => {
        if (messages.length != length) {
            // console.log(nick)
            res.json(messages[messages.length - 1])
            length = messages.length
            clearInterval(inreval)
        }
    }, 1000);
})

//{nick, color, time, message}
app.post("/message", (req, res) => {
    const { nick, message } = req.body
    const user = users.find(u => u.nick == nick)
    const messageObj = { nick, color: user.color, time: new Date().toLocaleTimeString(), message }
    messages.push(messageObj)
    res.json(messageObj)
})

app.listen(PORT, () => {
    console.log("Server " + PORT)
})

function randomColor() {
    return Math.floor(Math.random() * 16777215).toString(16);
}