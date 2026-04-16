User = User or {}
local json = require("json")

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
      txid = txid
    }

    Send({
      Target = ao.id,
      device = 'patch@1.0',
      user = User
    })

    return message.reply({
      Action = "registered_user_success",
      Data = json.encode({
        Message = "User registered successfully",
        Success = "true"
      })
    })
  end
)
