const authorization = (req,res,next)=>{
    const {apikey}= req.query;
    let key="uCsBoOkSaPI2026Batch"
    if(apikey===key){
        next();
    }else{
        res.status(401).json({
            message:"Unauthorized"
        })
    }
}
module.exports={authorization}