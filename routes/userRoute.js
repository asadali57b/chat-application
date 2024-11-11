const express=require("express");
 const router=express();
 const upload=require('../middlewares/uploadFileMiddleware')
 const auth=require('../middlewares/authMiddleware')
 const userController=require('../controllers/userController');

const {registerUser,login,loadDashboard}=require('../controllers/userController')


router.post('/register',upload.single('image'),registerUser)

router.post('/login',login)
router.get('/dashboard',auth,loadDashboard)






module.exports=router;