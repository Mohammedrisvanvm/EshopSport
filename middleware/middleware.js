export function ifuser(req,res,next){
    if(req.session.user){
        user:true
    }else{
        user:false
    }
    next();
}