local placeID = game.PlaceId
 
Players = game:GetService("Players")
for i, player in pairs(Players:GetPlayers()) do
    game:GetService("ReplicatedStorage").DefaultChatSystemChatEvents.SayMessageRequest:FireServer("dsc.gg/djbg ~ Cheapest jailbreak accounts on the market.","All")
    wait(0.2)
    game:GetService("ReplicatedStorage").DefaultChatSystemChatEvents.SayMessageRequest:FireServer("dsc.gg/djbg ~ Cheapest jailbreak accounts on the market.","All")
    wait(0.2)
    game:GetService("ReplicatedStorage").DefaultChatSystemChatEvents.SayMessageRequest:FireServer("dsc.gg/djbg ~ Cheapest jailbreak accounts on the market.","All")
    wait(0.2)
    game:GetService("ReplicatedStorage").DefaultChatSystemChatEvents.SayMessageRequest:FireServer("dsc.gg/djbg ~ Cheapest jailbreak accounts on the market.","All")
    wait(0.2)
    game:GetService("ReplicatedStorage").DefaultChatSystemChatEvents.SayMessageRequest:FireServer("dsc.gg/djbg ~ Cheapest jailbreak accounts on the market.","All")
    wait(0.2)
    game:GetService("ReplicatedStorage").DefaultChatSystemChatEvents.SayMessageRequest:FireServer("dsc.gg/djbg ~ Cheapest jailbreak accounts on the market.","All")
    wait(0.2)
    game:GetService("ReplicatedStorage").DefaultChatSystemChatEvents.SayMessageRequest:FireServer("dsc.gg/djbg ~ Cheapest jailbreak accounts on the market.","All")
    wait(0.2)
end
 
wait(1)
local Servers = game.HttpService:JSONDecode(game:HttpGet("https://games.roblox.com/v1/games/"..placeID.."/servers/Public?sortOrder=Asc&limit=100"))
for i,v in pairs(Servers.data) do
  if v.playing ~= v.maxPlayers then
      game:GetService('TeleportService'):TeleportToPlaceInstance(game.PlaceId, v.id)
  end
end