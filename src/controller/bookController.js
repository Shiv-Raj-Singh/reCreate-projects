const bookModel = require("../models/booksModel")
const {isValid , isValidObjectIds ,checkDate , isValidBookTitle } = require("../validator/valid")
const moment = require('moment')

const createBook = async (req, res) => {
    try {
        const {title , ISBN , userId , decodedToken} = req.body
        if(userId !== decodedToken.userId) {
            return res.status(401).send({ status: false, message: "Not Authorized to Create Book!" })  
        }
        const checkTitle =await bookModel.findOne({title:title})
        if(checkTitle){
            return res.status(400).send({status: false, message :"Title Already Exist !"})
        } 
        const isbn=await bookModel.findOne({ISBN:ISBN})
        if(isbn){
            return res.status(400).send({status: false, message :"ISBN Should be Unique !"})
        } 
        const result = await bookModel.create(req.body)
        return res.status(201).send({ status: true, message: 'Success', data: result })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

// ************************************  Get Book ***********************************************

const getBook = async (req, res) => {
    try {
        const { category, subcategory, userId } = req.query
        req.query.isDeleted = false 

        if(subcategory){
            if (!isValid(subcategory)) {
                return res.status(400).send({status :false , msg: "Enter A Valid Sub-Category !" })
             }}        
        if(category){
            if (!isValid(category)) {
                return res.status(400).send({status :false , msg: "Enter A Valid Category ! " }) 
            }}                  
        if(userId){
             if (!isValidObjectIds(userId)) {
                return res.status(400).send({status :false , msg: "Enter Valid User-Id !" }) 
            }}
        
    const getAllBooks = await bookModel.find(req.query).select(
        { ISBN: 0, subcategory: 0, deletedAt: 0, isDeleted: 0, createdAt: 0, updatedAt: 0, __v:0 }).sort({title:1})                          
        
        if (getAllBooks.length == 0) {
            return res.status(404).send({ status: false , msg: 'Books not found !'})
        }
        res.status(200).send({ status: true, message: 'Success', data: getAllBooks })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

// **************************************************** get book by bookid ***********************************

const getBookById = async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const bookData = await bookModel.findOne({_id : bookId ,isDeleted: false  })
        if(bookData) {
           return res.status(200).send({ status: true, message: 'Success', data: bookData })
        }
        res.status(404).send({status :false , message: "Book Not found 1" })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


// **************************************************** Update book by bookid ***********************************

const updateBook = async (req, res) => {
    try {
        if (Object.keys(req.body).length < 2){
            return res.status(400).send({ status: false, message: "No data given for updation" })
        } 
        const bookId = req.params.bookId;
        const {title , excerpt ,ISBN , releasedAt } = req.body;

        if(excerpt){
            if (!isValidName(excerpt)) {
                return res.status(400).send({status : false , message: "Enter a Valid excerpt !" })
            } 
        }
        if(title) {
            if (!isValidBookTitle(title)) {            
                return res.status(400).send({ status : false , message: "Enter a Valid title ! " }) 
            }
            const checkTitle =await bookModel.findOne({title:title})
            if(checkTitle){
                return res.status(400).send({status: false, message :"Title Already Exist !"}) 
            }
        }
        if(ISBN) {
            if(!/^[0-9]{8,15}$/.test(ISBN)){
                return res.status(400).send({ status : false , message: "Please Enter valid ISBN Number !" })
            } 
            const isbn=await bookModel.findOne({ISBN:ISBN})
            if(isbn){
                return res.status(400).send({status: false, message :"ISBN Should be Unique !"}) 
            } 
        }
        if(releasedAt){
            if(!checkDate(releasedAt)) {
                return res.status(400).send({ status : false , message: "Please Enter valid Release-Date Format- /YYYY/MM/DD !" }) }
            }

        const result = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $set: req.body }, { new: true })
        res.status(200).send({ status: true, message: 'Success', data: result })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message }) 
    }
}


// **************************************************** Delete book by bookid ***********************************

const deleteBook = async (req, res) => {
    try {
    const bookId = req.params.bookId;
    const result = await bookModel.findByIdAndUpdate(bookId, { $set: { isDeleted: true, deletedAt: moment().format('YYYY-MM-DD') } })
      return  res.status(200).send({ status: true, message: "Deleted Successfully" })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { createBook , getBook , getBookById , deleteBook ,updateBook  } 