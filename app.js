const express = require('express');
const app=express();
const {books}=require('./books');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const port=3000;
app.use(cors({
    origin: '*',
}))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.get('/',(req,res)=>{
    res.json(books)
})
app.get('/books/year/:year',(req,res)=>{
    const {year}=req.params;
    const bookes=books.filter((bk)=>{
        if(bk.year===year){
            return bk;
        }
    });
    res.json(bookes)
})
app.all('*',(req,res,next)=>{
    res.status(404).json({
        message:"Page not found"
    })
})
app.listen( port,()=>{
    console.log(`Server is Listening at port ${port}`);
})