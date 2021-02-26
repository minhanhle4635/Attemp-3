const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')
const passport = require('passport')
const Book = require('../models/book')


router.get('/homepage',checkAuthenticated,(req,res)=> {
    res.render('homepage.ejs',{name: req.user.name})
})

router.get('/',checkNotAuthenticated, async (req,res)=> {
    let books
    try{
        books = await Book.find().sort({createdAt: 'desc' }).limit(10).exec()
    } catch{
        books = []
    }
    res.render('index.ejs', {books: books})
})

router.get('/login',checkNotAuthenticated,(req,res)=>{
    res.render('login.ejs')
})

router.post('/login',checkNotAuthenticated, passport.authenticate('local',{
    successRedirect: '/homepage',
    failureRedirect: '/',
    failureFlash: true
}))

router.get('/register',checkNotAuthenticated,(req,res)=>{
    res.render('register.ejs')
})

router.post('/index/register',checkNotAuthenticated, async (req,res)=>{
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
    res.redirect('/')
})

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/')
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/homepage')
    }
    next()
}

module.exports = router