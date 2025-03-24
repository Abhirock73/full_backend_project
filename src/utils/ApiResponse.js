class ApiResponse{
     constructor(
          data , statusCode, message= "Success"
       ){
               this.data = data,
               this.message = message,
               this.statusCode = statusCode
      }   
}

export {ApiResponse}