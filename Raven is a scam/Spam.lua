task.spawn(function()
    repeat
        local ChatMessages = {
            " Expensive jailbreak cash at dsc.gg/djbg",
            " Most scam and overpriced jailbreak cash at dsc.gg/djbg",
        }
        game:GetService("ReplicatedStorage").DefaultChatSystemChatEvents.SayMessageRequest:FireServer(ChatMessages[ math.random( 1,#ChatMessages ) ], "All")
        task.wait(1.5)
    until Bread
end)
