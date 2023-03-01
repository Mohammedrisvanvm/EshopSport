import multer from "multer";

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'public/image/productImage')
    },
    filename:function(req,file,cb){
        const uniqueSuffix=Date.now()+'-'+Math.round(Math.random() * 1E9)
        cb(null,file.fieldname+'-'+ uniqueSuffix +'.jpg')
    }
})

export const upload=multer({storage:storage})

export const multiupload=upload.fields([{name:'mainImage', maxCount:1},{name:'subImages',maxCount:5}])