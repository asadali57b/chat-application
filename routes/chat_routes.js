const express=require('express');
const router=express.Router();
const chat_controllers=require('../controllers/chat_controllers')
const auth=require('../middlewares/authMiddleware')

router.post("/",auth,chat_controllers.accessChat);
router.get("/",auth,chat_controllers.fetchChats);
router.post("/group",auth,chat_controllers.createGroupChat);
router.put("/rename",auth,chat_controllers.renameGroup);
router.put("/groupadd",auth,chat_controllers.addToGroup);
router.put('/groupremove',auth,chat_controllers.removeFromGroup);
module.exports=router