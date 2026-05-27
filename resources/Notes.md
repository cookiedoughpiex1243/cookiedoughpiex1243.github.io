












- To-Do
Connect to esp32
Better UI :/

---------------------------
 GET SOLE USER BACK.     |
---------------------------

- ESP32 Connection logic - refined
Frontend: send hasFocus along with message data
Backend - Sender != josh && !hasFocus ? writetoFile Newmsgcounter
ESP32 - Websockets onrender.com/newmsgcounter---Buzzer+LCD
Backend - hasFocus ? clear newmsgcounter + Websockets to ESP32


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

