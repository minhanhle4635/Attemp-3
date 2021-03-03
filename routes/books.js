const express = require('express')
const router = express.Router()
// const multer = require('multer')
// const path = require('path')
const Book = require('../models/book')
const Author = require('../models/author')
// const uploadPath = path.join('public', Book.fileBasePath)
const imageMimeTypes = ['image/jpeg','image/png','images/gif']
const fileMimeTypes = ['application/msword', 'application/pdf']
// const storage = multer.diskStorage({
//     destination: function(req,file,callback){
//         callback(null,'./public/uploads/files')
//     },
//     filename: (req, file, callback) => {
//         callback(null, file.originalname)
//     }
// })

// var upload = multer({ storage: storage })

//All books route
router.get('/', async (req,res) =>{
    let query = Book.find()
    if(req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try{
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    }catch{
        res.redirect('/homepage')
    }    
})

//New book route
router.get('/new', checkAuthenticated,async (req, res)=>{
    renderNewPage(res, new Book())
})



//Create new book
router.post('/', checkAuthenticated, async (req,res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        description: req.body.description
    })
    saveCover(book, req.body.cover)
    saveFile(book, req.body.file)
    try{
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
    }catch{
        renderNewPage(res, book, true)
    }
})

//show book route
router.get('/:id', async (req,res)=>{
    try{
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show',{book: book})

    } catch (err){
        console.log(err)
        res.redirect('/homepage')
    }
})


// //download book route
// router.get('/:id/download', (req,res)=>{  
//     Book.find({ _id : req.params.id },(err,data)=>{  
//         if(err){  
//             console.log(err)  
//         }   
//         else{
//             var path = __dirname + '/public/'+ book.filePath
//             res.download(path)
//         }  
//     })  
// })  

//edit book route
router.get('/:id/edit', checkAuthenticated, async (req,res)=>{
    try{
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    } catch {
        res.redirect('/:id')
    }    
})

//Update book route
router.put('/:id', checkAuthenticated, async (req,res)=>{
   let book
    try{
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.description = req.body.description
        if(req.body.cover != null && req.body.cover !==''){
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    }catch(err){
        console.log(err)
        if(book != null)
        {
            renderEditPage(res, book, true)
        } else {
            res.redirect('/:id')
        }
    }
})

//Delete book page
router.delete('/:id', checkAuthenticated,async (req,res)=>{
    let book
    try{
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch {
        if(book != null){
            res.render('books/show',{
                book: book,
                errorMessage: 'Could not delete the book'
            })
        } else {
            res.redirect('/:id')
        }
    }
})

async function renderNewPage(res, book, hasError = false){
    renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false){
    renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false){
    try{
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError){
            if(form === 'edit'){
                params.errorMessage = 'Error Updating Book'
            }else{
                params.errorMessage = 'Error Editing Book'
            }
        }
        res.render(`books/${form}`, params)
    } catch {
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded){
    if(coverEncoded == null) return 
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

function saveFile(book, fileEncoded){
    if(fileEncoded == null) return 
    const file = JSON.parse(fileEncoded)
    if (file != null && fileMimeTypes.includes(file.type)){
        book.file = new Buffer.from(file.data, 'base64')
        book.fileType = file.type
    }
}

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/')
}


module.exports = router