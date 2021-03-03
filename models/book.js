const mongoose = require('mongoose')

// const  fileBasePath = 'uploads/files'

const bookSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    publishDate:{
        type: Date,
        required: true
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now
    },
    coverImage:{
        type: Buffer,
        required: true
    },
    coverImageType: {
        type: String,
        required: true
    },
    file:{
        type: Buffer,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    }
})

bookSchema.virtual('coverImagePath').get(function(){
    if(this.coverImage != null && this.coverImageType != null){
        return `data: ${this.coverImageType}; charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
})

bookSchema.virtual('filePath').get(function(){
    if(this.file != null && this.fileType != null){
        return `data:${this.fileType}; charset=utf-8;base64,${this.file.toString('base64')}`
    }
})

module.exports = mongoose.model('Book', bookSchema)
// module.exports.fileBasePath = fileBasePath