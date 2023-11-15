const express = require('express');
const router = express.Router();
const mongojs = require('mongojs');
const bodyParser = require('body-parser');
const { body, param, validationResult } = require('express-validator')
const db = mongojs('mongodb+srv://admin:Pyare132605@ucsbooks.t0qcvni.mongodb.net/Books', ['books','users'],{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const jwt=require('jsonwebtoken');
const secret="universityofComputerStudies Sittwe Books Drake";
router.post('/login',(req,res)=>{
    const {usname,psw}=req.body;
    db.users.find({username:usname,password:psw},(err,data)=>{
        if(err){
            res.sendStatus(500)
        }else{
            if(data.length){
                const user=data[0];
                const token=jwt.sign(user,secret);
                return res.status(200).json({token})
            }else{
                return res.sendStatus(403)
            }
        }
    })
  
})
function auth(req,res,next){
    const authHeader=req.headers['authorization'];
    if(!authHeader) return res.sendStatus(401);
    const [type,token]= authHeader.split(':');
    if( type !== "Bearer") return res.sendStatus(401);
    jwt.verify(token,secret,(err,data)=>{
        if(err) return res.sendStatus(403);
        else next();
    })
  }
function onlyAdmin(req,res,next){
    const [type,token]= req.headers['authorization'].split(':');
    jwt.verify(token,secret,(err,user)=>{
        if(user.role==="admin") next();
        else res.sendStatus(403);
    })
}
router.post('/register',(req,res)=>{
    const {usname,psw}=req.body;
    const rl="user";
    db.users.find({username:usname},(err,data)=>{
        if(err){
            res.sendStatus(500)
        }else{
            if(data.length){
                return res.sendStatus(403)
            }else{
                db.users.insert({username:usname,password:psw,role:rl},(err,data)=>{
                    if(err){
                        res.sendStatus(500)
                    }else{
                        const _id =data._id;
                        res.append('Location',`/api/users/${_id}`);
                        return res.status(201).json({meta:{_id},data})
                    }
                })
            }
        }
    })
   
})
router.post('/registerAdmin',(req,res)=>{
    const {usname,psw}=req.body;
    const rl = "admin";
    db.users.find({username:usname},(err,data)=>{
        if(err){
            res.sendStatus(500)
        }else{
            if(data.length){
                return res.sendStatus(403)
            }else{
                db.users.insert({username:usname,password:psw,role:rl},(err,data)=>{
                    if(err){
                        res.sendStatus(500)
                    }else{
                        const _id =data._id;
                        res.append('Location',`/api/users/${_id}`);
                        return res.status(201).json({meta:{_id},data})
                    }
                })
            }
        }
    })
})
router.get('/books/',auth,(req,res)=>{
    const options=req.query;
    const sort=options.sort || {};
    const filter=options.filter || {} ;
    const limit=parseInt(options.limit) || 100;
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
//adding to DB
router.post('/books',auth,onlyAdmin,[
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
//put to DB
router.put('/books/:id',auth,onlyAdmin,[
    param('id').isMongoId(),
],(req,res)=>{
    const _id=req.params.id;
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    db.books.count({_id:mongojs.ObjectId(_id)},(err,count)=>{
        if(count){
            const book={
                _id:mongojs.ObjectId(_id),
                ...req.body
            };
            db.books.save(book,(err,data)=>{
                if(err){
                    res.sendStatus(500)
                }else{
                    res.status(200).json({meta:{_id},data})
                }
            })
        }else{
            db.books.save(req.body,(err,data)=>{
                return res.status(201).json({
                    meta:{_id:data._id},
                    data
                })
                })
            };
    })
})

//Patch to DB
router.patch('/books/:id',auth,onlyAdmin,[
    param('id').isMongoId(),
],(req,res)=>{
    const _id=req.params.id;
    db.books.count({
        _id:mongojs.ObjectId(_id)
    },(err,count)=>{
        if(count){
            db.books.update(
                {_id:mongojs.ObjectId(_id)},
                {$set:req.body},
                {multi:false},
                (data,err)=>{
                    db.books.find({
                        id:mongojs.ObjectID(_id)
                    },(err,data)=>{
                        return res.status(200).json({
                            meta:{_id},data
                        })
                    })
                }
            )
        }else{
            return res.sendStatus(404);
        }
    })
})

//Remove data from db
router.delete('/books/:id',auth,onlyAdmin,[
    param('id').isMongoId(),
],(req,res)=>{
    const _id=req.params.id;
    db.books.count({
        _id:mongojs.ObjectID(_id)
    },(err,count)=>{
        if(count){
            db.books.remove({_id:mongojs.ObjectID(_id)},(err,data)=>{
                return res.sendStatus(204);
            })
        }else{
            return res.sendStatus(404);
        }
    })
})
module.exports=router;