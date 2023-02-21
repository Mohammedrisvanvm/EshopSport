import express  from "express";
import userRouter from './routes/user.js'
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import logger from "morgan";
import session from "express-session";
const app=express()





const __dirname=path.resolve()

//ejs engine
app.set('view engine','ejs')

app.use(logger('dev'))
app.use(express.static(__dirname+"/public"))
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));
app.use((req,res,next) =>{
    res.set(
      "cache-control",
      "no-cache,private,no-store,must-revalidate"
    );
    next();
  })

  app.use('/',userRouter)




app.listen(3000,()=>console.log("server started!!!"))