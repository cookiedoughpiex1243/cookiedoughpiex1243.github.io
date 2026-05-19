












- To-Do
Add indicator for selected reply message
Better UI :/



- Day  marker
Calc using existing Msg IDs (Derive date from the milis())
let lastMsgDate
if messageSendDate != lastMsgDate {
    do something.
} 

- Reply logic

Rid = message to reply to.getAttribute(msg-id)
socket.send message - sends Rmsg
messageElement has <h6><i>${if (Rid) "Replying to " + Rid.p.innertext }
Rendermsg Renders <p> if (Rid) "Rid.innertext" </p>

