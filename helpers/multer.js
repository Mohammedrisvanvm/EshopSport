import multer from "multer";
const fileFilter = function(req, file, cb) {
    console.log(file.mimetype);
    // check if uploaded file is an image
    if (!file.mimetype.startsWith('image/')) {
      return cb(console.log('Only image files are allowed!'), false);
    }
    cb(null, true);
  };
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'public/image/productImage')
    },
    filename:function(req,file,cb){
        const uniqueSuffix=Date.now()+'-'+Math.round(Math.random() * 1E9)
        cb(null,file.fieldname+'-'+ uniqueSuffix +'.jpg')
    },
})
const storagecaro=multer.diskStorage({
  destination:function(req,file,cb){
      cb(null,'public/image/carousel image')
  },
  filename:function(req,file,cb){
      const uniqueSuffix=Date.now()+'-'+Math.round(Math.random() * 1E9)
      cb(null,file.fieldname+'-'+ uniqueSuffix +'.jpg')
  },
})

export const upload=multer({storage:storage,fileFilter:fileFilter})
export const uploadcaro=multer({storage:storagecaro,fileFilter:fileFilter})
export const multiuploadcaro=upload.fields([{name:'mainImage', maxCount:1}])

export const multiupload=upload.fields([{name:'mainImage', maxCount:1},{name:'subImages',maxCount:5}])