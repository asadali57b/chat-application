 const Message=require('../models/message_model');
 const User=require('../models/userModel');
 const asyncHandler=require('express-async-handler')
 const chat=require('../models/chatModel');


 const sendMessage=asyncHandler(async(req,res)=>{
    const {content,chatId}=req.body;

    if(!content || !chatId){
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage={
        sender:req.user._id,
        content:content,
        chat:chatId
    }

    try {
        var message=await Message.create(newMessage);
        // message=await message.populate("sender","name image")
        message=await message.populate("sender","name image");
        message=await message.populate("chat");
        message=await User.populate(message, {
            path:"chat.users",
            select:"name image email"
        });
        await chat.findByIdAndUpdate(req.body.chatId,{$set:{latestMessage:message}});
        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }     
    }
 );
 const allMessages=asyncHandler(async(req,res)=>{
    try {
        const messages=await Message.find({chat:req.params.chatId}).populate("sender","name image email").populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
 });

 module.exports={sendMessage,allMessages};

