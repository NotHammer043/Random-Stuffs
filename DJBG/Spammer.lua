task.spawn(function()
    repeat
        local ChatMessages = {
            " Cheap jailbreak cash at dsc.gg/djbg",
            " Cheapest and most legit jailbreak cash at dsc.gg/djbg",
        }
        game:GetService("ReplicatedStorage").DefaultChatSystemChatEvents.SayMessageRequest:FireServer(ChatMessages[ math.random( 1,#ChatMessages ) ], "All")
        task.wait(1.5)
    until Bread
end)
