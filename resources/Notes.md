- Reply logic

Rid = message to reply to.getAttribute(msg-id)
socket.send message - sends Rmsg
messageElement has <h6><i>${if (Rid) "Replying to " + Rid.p.innertext }
Rendermsg Renders <p> if (Rid) "Rid.innertext" </p>