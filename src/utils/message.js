const message = (message)=>{
 return {
     message , 
    createdAt : new Date().getTime()
 }
}

const url = (url)=>{
    return {
        url , 
       createdAt : new Date().getTime()
    }
   }


module.exports = {
    message , 
    url
}