const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')
const passport = require('passport')


router.get('/',checkAuthenticated,(req,res)=> {
    res.render('index.ejs',{name: req.user.name})
})

router.get('/login',checkNotAuthenticated,(req,res)=>{
    res.render('login.ejs')
})

router.post('/login',checkNotAuthenticated, passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

router.get('/register',checkNotAuthenticated,(req,res)=>{
    res.render('register.ejs')
})

router.post('/register',checkNotAuthenticated, async (req,res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        await user.save()
        res.redirect('/login')
    }catch{
        res.redirect('/register')
    }
})

router.delete('/logout',(req,res)=>{
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

module.exports = router