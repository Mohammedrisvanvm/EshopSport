import { admins } from "../models/adminSchema.js";

let emailerr = null;

export function getAdminPage(req, res) {
  res.render("adminLogin", { error: emailerr });
  console.log(emailerr);
  emailerr = null;
}

export async function postAdminPage(req, res) {
  console.log(req.body);
  const { name, email, password } = req.body;
  const userinfo = await admins.findOne({ email });
  console.log(userinfo);
  if (!userinfo) {
    emailerr = "admin is not found";
    res.redirect("/admin");
  } else {
    if (
      name === userinfo.name &&
      email === userinfo.email &&
      password === userinfo.password
    ) {
      console.log(200, "success");
      res.render("index");
    } else {
      emailerr = "password error";
      res.redirect("/admin");
    }
  }
}
