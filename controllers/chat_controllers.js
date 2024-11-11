const chat=require('../models/chatModel');
const User=require('../models/userModel');
const message=require('../models/message_model');
const asyncHandler=require('express-async-handler');
 


const accessChat=asyncHandler(async(req,res)=>{
    const {userId}=req.body;
    if(!userId){
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    var isChat=await chat.find({
        isGroupChat:false,
        $and:[
            {users:{$elemMatch:{$eq:req.user._id}}},
            {users:{$elemMatch:{$eq:userId}}}
        ],
    }).populate("users","-password").populate("latestMessage");

    isChat=await User.populate(isChat, {
        path:'latestMessage.sender',
        select:'name image email'
    });

    if(isChat.length>0){
        res.send(isChat[0]);
    }else{        
        var chatData={
            chatName:"sender",
            isGroupChat:false,
            users:[req.user._id,userId],
        };
        try{
            const createdChat=await chat.create(chatData);
            const FullChat=await chat.findOne({_id:createdChat._id}).populate("users","-password");
            res.status(200).send(FullChat);
        }catch(error){
            res.status(400);
            throw new Error(`Request: ${error.message}`);
        }

    }

});
const fetchChats=asyncHandler(async(req,res)=>{
    try {
         chat.find({users:{$elemMatch:{$eq:req.user._id}}}).populate("users","-password").populate("groupAdmin","-password").populate("latestMessage").sort({updatedAt:-1}).then(async(results)=>{
            results=await User.populate(results, {
                path:'latestMessage.sender',
                select:'name image email'
            });
            res.status(200).send(results);
        })
        
    } catch (error) {
        res.status(400);
        throw new Error(`Request: ${error.message}`);
    }
});
const createGroupChat=asyncHandler(async(req,res)=>{
    if(!req.body.users || !req.body.name){
        return res.status(400).send({message:"Please Fill all the fields"});
    }
    var users=JSON.parse(req.body.users);
    if(users.length<2){
        return res.status(400).send("More than 2 users are required to form a group chat");
    }
    try {
        const groupChat=new chat({
            chatName:req.body.name,
            users:users,
            isGroupChat:true,
            groupAdmin:req.user,
        });
        const createdChat=await groupChat.save();
        const FullGroupChat=await chat.findOne({_id:createdChat._id}).populate("users","-password").populate("groupAdmin","-password");
        res.status(200).send(FullGroupChat);
        
    } catch (error) {
        res.status(400);
        throw new Error(`Request: ${error.message}`);
        
    }

});

const renameGroup=asyncHandler(async(req,res)=>{
    const {chatId,chatName}=req.body;
    const updatedChat=await chat.findByIdAndUpdate(chatId,{chatName},{new:true}).populate("users","-password").populate("groupAdmin","-password");
    if(!updatedChat){
        res.status(404);
        throw new Error("Chat Not Found");
    }else{
        res.json(updatedChat);
    }
    
});
const addToGroup=asyncHandler(async(req,res)=>{
    const {chatId,userId}=req.body;
    const added=await chat.findByIdAndUpdate(chatId,{$push:{users:userId}},{new:true}).populate("users","-password").populate("groupAdmin","-password");
    if(!added){
        res.status(404);
        throw new Error("Chat Not Found");
    }else{
        res.json(added);
    }
});
const removeFromGroup=asyncHandler(async(req,res)=>{
    const {chatId,userId}=req.body;
    const removed=await chat.findByIdAndUpdate(chatId,{$pull:{users:userId}},{new:true}).populate("users","-password").populate("groupAdmin","-password");
    if(!removed){
        res.status(404);
        throw new Error("Chat Not Found");
    }else{
        res.json(removed);
    }
});
module.exports={accessChat,fetchChats,createGroupChat,renameGroup,addToGroup,removeFromGroup}