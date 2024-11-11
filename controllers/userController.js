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
        
       
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


