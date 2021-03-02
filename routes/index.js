const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')
const passport = require('passport')
const Book = require('../models/book')


router.get('/homepage',checkAuthenticated, async (req,res)=> {
    let books 
    try{
        books = await Book.find().sort({createdAt:'desc'}).limit(10).exec()
    }catch{
        books = []
    }
    res.render('homepage.ejs',{name: req.user.name, books: books})
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

router.post('/login',checkNotAuthenticated, (req,res,next)=>{
    passport.authenticate('local',{
        successRedirect: '/homepage',
        failureRedirect: '/login',
        failureFlash: true
    }) (req,res,next)
})

router.get('/register',checkNotAuthenticated,(req,res)=>{
    res.render('register.ejs')
})

router.post('/register',checkNotAuthenticated, async (req,res)=>{
    
    try{
        const similarEmail = await User.findOne({email: req.body.email})
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        if(user.email != similarEmail){
            await user.save()
            res.redirect('/login')
        } else {
            res.render('/register',{
                errorMessage: 'Email has been used'
            })
        }
    }catch(e){
        console.log(e)
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