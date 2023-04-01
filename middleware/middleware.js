export function ifuser(req, res, next) {
 
  if (req.session.user) {
    
    next();
  } else {
    res.redirect("/login");
  
  }
}
export function ifadmin(req, res, next) {
  if (req.session.admin) {
   
    next();
  } else {
    res.redirect("/admin");
   
  }
}
