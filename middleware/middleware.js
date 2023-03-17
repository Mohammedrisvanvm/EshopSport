export function ifuser(req,res,next){
    if(req.session.user){
        user:true
        next()
    }else{
        user:false
        res.redirect('/login')
    }
 
}
export function ifadmin(req,res,next){
    if(req.session.admin){
        admin:true
        next()
    }else{
        admin:false
        res.redirect('/admin')
    }

}