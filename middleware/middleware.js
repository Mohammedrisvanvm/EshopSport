export function ifuser(req, res, next) {
  console.log(req.session.user);
  if (req.session.user) {
    ifuser:true
    next();
  } else {
    res.redirect("/login");
    ifuser:false
  }
}
export function ifadmin(req, res, next) {
  if (req.session.admin) {
    ifadmin:true
    next();
  } else {
    res.redirect("/admin");
    ifadmin:false
  }
}
