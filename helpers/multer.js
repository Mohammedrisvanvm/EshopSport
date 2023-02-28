import multer from "multer";

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'/public/image/productImage')
    },
    filename:function(req,file,cb){
        const uniqueSuffix=Date.now+'-'+Math.round(math.random() * 1e9)
        cb(null,file.fieldname+'-'+uniqueSuffix+'.jpg')
    }
})

const upload=multer({storage:storage})

export const multiupload=upload.fields([{name:'mainImage', maxCount:1},{name:'subImage',maxCount:5}])