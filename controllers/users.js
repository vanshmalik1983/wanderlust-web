const Listing = require("../models/listing");
const User = require("../models/user");

module.exports.renderSignUpForm=(req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signUp = async(req,res)=>{
    try{
    let {username , email ,password} = req.body;
    const newUser = new User({email , username});
    let registeredUser = await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next();
        }
        req.flash("success" , "new user registerd successfully");
        res.redirect("/listings");
    })
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login = async(req, res) => {
    req.flash("success", "Welcome! You are logged in.");
    res.redirect(res.locals.redirectUrl); // ✅ Now safe
};

module.exports.logout = (req,res)=>{
    req.logOut((err)=>{
        if(err){
           return next(err);
        }
        req.flash("success","u r logged out now !!!");
        res.redirect("/listings");
    });
};