
export { asyncHandler };

const asyncHandler = (fn) => (req,res,next) =>{
      try {
        
      } catch (error) {
          res.status(500).json({
              success:false,
              message: error.message
          })
      }
}