//expres
const express = require('express');
const app = express();
//mongojs
const mongojs = require('mongojs');
const db = mongojs('mongodb+srv://admin:Pyare132605@ucsbooks.t0qcvni.mongodb.net/Books', ['books'],{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
//bodyparser
const bodyParser = require('body-parser');
//express-validator
const{ body,param,validationResult } = require('express-validator');
const port=3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/api/books/',(req,res)=>{
    const options=req.query;
    const sort=options.sort || {};
    const filter=options.filter || {} ;
    const limit=parseInt(options.limit) || 15;
    const page= parseInt(options.page) || 1;
    const skip =(page-1)*limit;
    for(i in sort){
        sort[i]=parseInt(sort[i])
    }
    db.books.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit,function(err,data){
        if(err){
            res.sendStatus(500)
        }else{
            res.status(200).json({meta:{total:data.length},data})
        }
    })
})
app.post('/api/books',[
    body("name").not().isEmpty(),
    body("year").not().isEmpty(),
    body("img").not().isEmpty(),
    body("url").not().isEmpty(),
],(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    db.books.insert(req.body,(err,data)=>{
        if(err){
            res.sendStatus(500)
        }else{
            const _id =data._id;
            res.append('Location',`/api/books/${_id}`);
            return res.status(201).json({meta:{_id},data})
        }
    })
})
app.listen(port,()=>{
    console.log(`Server is starting at https://localhost:${port}`);
})