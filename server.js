if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const app = express()

require('./passport-config')(passport)

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false}))

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
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', ()=> console.log('Connected to DB'))

//middleware
app.use(express.json())

//Import Route
const indexRoute = require('./routes/index')
const authorRoute = require('./routes/authors')
const bookRoute = require('./routes/books')

//Route middlewares
app.use('/', indexRoute)
app.use('/authors',authorRoute)
app.use('/books',bookRoute)

app.listen(process.env.PORT || 3000)