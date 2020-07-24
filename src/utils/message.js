const message = (username , message)=>{
 return {
     username,
     message , 
    createdAt : new Date().getTime()
 }
}

const url = (username , url)=>{
    return {
       username,
        url , 
       createdAt : new Date().getTime()
    }
   }


module.exports = {
    message , 
    url
}