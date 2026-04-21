User = User or {}
local json = require("json")

function UpdateNotifications(user,message)
  if User[user] == nil then return end
  local decodedMessage = json.decode(User[user].notification)
  if type(decodedMessage) ~= "table" then
    decodedMessage = {}
  end
  table.insert(decodedMessage, {
    status = "unread",
    message = message,
    timestamp = os.time()
  })
  User[user].notification = json.encode(decodedMessage)
end

function UpdateUser()
  Send({
    Target = ao.id,
    device = 'patch@1.0',
    user = User
  })
end

Handlers.add(
  "register_user",
  Handlers.utils.hasMatchingTag("Action", "register_user"),
  function(message)
    -- public key in Data
    local pub, txid = message.Tags.Publickey, message.Tags.Txid
    if type(pub) ~= "string" or #pub < 680 or #pub > 690 then
      return message.reply({
        Action = "registration_failed_publickey_invalid",
        Data = json.encode({
          Message = "Public key missing or invalid in message tags",
          Success = "false"
        })
      })
    end

    -- tx id tag
    if type(txid) ~= "string" or #txid ~= 43 then
      return message.reply({
        Action = "registration_failed_txid_invalid",
        Data = json.encode({
          Message = "Txid missing or invalid in message tags",
          Success = "false"
        })
      })
    end

    if User[message.From] ~= nil then
      return message.reply({
        Data = json.encode({
          Message = "User already registered",
          Success = "false"
        }),
        Action = "registration_failed_user_exists"
      })
    end

    User[message.From] = {
      publickey = pub,
      txid = txid,
      notification = "[]"
    }

    UpdateNotifications(message.From, "Welcome to the metalinks!")
    UpdateUser()

    ao.log("Registered user: " .. message.From .. " with public key: " .. pub .. " and txid: " .. txid)

    return message.reply({
      Action = "registered_user_success",
      Data = json.encode({
        Message = "User registered successfully",
        Success = "true"
      })
    })
  end
)

Handlers.add("readallnotification",Handlers.utils.hasMatchingTag("Action", "readallnotification"), function(message)
  if User[message.From] == nil then return end
  local decodedMessage = json.decode(User[message.From].notification)
  if type(decodedMessage) ~= "table" then
    decodedMessage = {}
  end
  for _, notification in ipairs(decodedMessage) do
    notification.status = "read"
  end
  User[message.From].notification = json.encode(decodedMessage)
  UpdateUser()
end)
