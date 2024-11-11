const User= require('../models/userModel')
const jwt=require('jsonwebtoken');
const asyncHandler=require('express-async-handler');

const bcrypt=require('bcrypt')

const Joi=require('joi');
const SignupSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required(),
   });
   const signinSchema=Joi.object({
    email:Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
});

// const allUsers = asyncHandler(async (req, res) => {
//     const keyword = req.query.search
//       ? {
        //   $or: [
        //     { name: { $regex: req.query.search, $options: "i" } },
        //     { email: { $regex: req.query.search, $options: "i" } },
        //   ],
//         }
//       : {};
  
//     const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
//     res.send(users);
//   });

//   const registerUser = asyncHandler(async (req, res) => {
//     const { name, email, password, pic } = req.body;
  
//     if (!name || !email || !password) {
//       res.status(400);
//       throw new Error("Please Enter all the Feilds");
//     }
  
//     const userExists = await User.findOne({ email });
  
//     if (userExists) {
//       res.status(400);
//       throw new Error("User already exists");
//     }
  
//     const user = await User.create({
//       name,
//       email,
//       password,
//       pic,
//     });
  
//     if (user) {
//       res.status(201).json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         isAdmin: user.isAdmin,
//         pic: user.pic,
//         token: generateToken(user._id),
//       });
//     } else {
//       res.status(400);
//       throw new Error("User not found");
//     }
//   });
//   const authUser = asyncHandler(async (req, res) => {
//     const { email, password } = req.body;
  
//     const user = await User.findOne({ email });
  
//     if (user && (await user.matchPassword(password))) {
//       res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         isAdmin: user.isAdmin,
//         pic: user.pic,
//         token: generateToken(user._id),
//       });
//     } else {
//       res.status(401);
//       throw new Error("Invalid Email or Password");
//     }
//   });
  
//   module.exports = { allUsers, registerUser, authUser };
  
exports.registerUser= async(req,res)=>{
    
    const { name, email, password,is_online,} = req.body;
    const image = req.file ? req.file.filename : null; 


    try {
        const {error}=SignupSchema.validate(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        let user= await User.findOne({email: req.body.email});
    if(user) return res.status(400).json({"message":"User Already resgistered"});
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            ...(image && { image }) ,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' , newUser});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
  exports.login = async (req, res, next) => {
    const { error } = signinSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid email or password');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid email or password');

    const token = jwt.sign({
        _id: user._id,
        name: user.name,
        email: user.email,
       image:user.image,
    }, 'userData', { expiresIn: '24hr' });

    user.token = token; 
    user.is_online='1';
    await user.save(); 
    

    res.send({
        success: true,
        msg: "User Login Successfully",
        token: token,
        data: [{
            name: user.name,
            email: user.email,
            token: token,
            id: user._id,
            image:user.image
            
        }]
    });

    console.log(`${token}`);
};


exports.loadDashboard = async (req, res, next) => {
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } },
                  ],
            }
            : {};
            const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
            res.send(users);
        
        // const currentUserId = req.user._id; 

        
        // const users = await User.find({ _id: { $ne: currentUserId } });

        // res.status(200).json({ users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


