export function ifuser(req,res,next){
    if(req.session.user){
        user:true
        next()
    }else{
        user:false
        res.redirect('/login')
    }
 
}