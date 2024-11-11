// const express= require('express');
// const router=express.Router();
// const auth=require('../middlewares/authMiddleware')
// const message_controllers=requir')

// router.post("/",auth,message_controllers.);

// module.exports=router;

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const message_controllers = require("../controllers/message_controller");

router.post("/", auth, message_controllers.sendMessage);
router.get("/:chatId",auth,message_controllers.allMessages);



module.exports = router;