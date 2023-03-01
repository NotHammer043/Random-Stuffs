repeat
    task.wait()
until game:IsLoaded()

local WSConnect = syn and syn.websocket.connect or Krnl and Krnl.WebSocket.connect or WebSocket and WebSocket.connect
if not WSConnect then return end

function AttemptConnection ()
    local Success, Socket = pcall(WSConnect, ('ws://localhost:6431/?username=%s'):format(game.Players.LocalPlayer.Name))
    return Success
end

local WSSConnection

repeat
    WSSConnection = AttemptConnection ()
until WSSConnection == true