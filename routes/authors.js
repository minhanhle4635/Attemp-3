const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')

//All authors route
router.get('/',async (req,res) =>{
    let searchOptions = {}
    if(req.query.name != null && req.query.name !==''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try{
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query
        })
    }catch{
        res.redirect('/homepage')
    }
})

//New author route
router.get('/new',checkAuthenticated,(req,res)=>{
    res.render('authors/new', { author: new Author() })
})

//Create Author
router.post('/', checkAuthenticated,async (req,res) => {
    const author = new Author({
        name: req.body.name
    })
    try{
        const newAuthor = await author.save()
        res.redirect(`authors/${newAuthor.id}`)       
    }catch{
        res.render('authors/new',{
            author: author,
            errorMessage: 'Error creating Author'
        })
    }
})

router.get('/:id', async (req,res) => {
    try{
        const author = await Author.findById(req.params.id)
        const books = await Book.find({ author: author.id }). limit(6).exec()
        res.render('authors/show',{
            author: author,
            booksByAuthor: books
        })
    }catch(err){
        console.log(err)
        res.redirect('/homepage')
    }
})

router.get('/:id/edit',checkAuthenticated ,async (req,res)=>{
    try{
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', {author: author})
    } catch{
        res.redirect('/authors')
    }
})

router.put('/:id', checkAuthenticated,async (req,res)=>{
    let author
    try{
        author = await Author.findById(req.params.id)
        author.name = req.body.name
    await author.save()
        res.redirect(`/authors/${author.id}`)
    }catch{
        if(author == null){
            res.redirect('/homepage')
        }
        res.render('authors/edit',{
            author: author,
            errorMessage: 'Error updating Author'
        })
    }
})

router.delete('/:id', checkAuthenticated,async (req,res)=>{
    let author
    try{
        author = await Author.findById(req.params.id)
    await author.remove()
        res.redirect('/authors')
    }catch{
        if(author == null){
            res.redirect('/homepage')
        } else {
            res.redirect(`/authors/${author.id}`)
        }
    }
})

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/')
}

module.exports = router