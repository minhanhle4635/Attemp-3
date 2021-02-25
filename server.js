if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const app = express()

require('./passport-config')(passport)

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended:false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(methodOverride('_method'))

app.use(passport.initialize())
app.use(passport.session())

//connect DB
mongoose.connect(
    process.env.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true }
)

//middleware
app.use(express.json())

//Import Route
const indexRoute = require('./routes/index')

//Route middlewares
app.use('/', indexRoute)

app.listen(3000)