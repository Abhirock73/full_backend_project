class ApiError extends Error{
     constructor(
          statusCode,
          message= "something Went Wrong",
          errors =[],
          stack= ""
     ){
        super(message)
        this.statusCode= statusCode
        this.data = null
        this.errors  = errors
        this.message = message
        this.success = false

        if(stack){

        }

     }
}

export {ApiError};