// // Authentication Validator middleware for (Logging-in) 

const validator = require("../util/AuthValidator");

module.exports = (req,res,nxt)=>{
let isValid= validator(req.body);
if(isValid){
    req.valid=true;
    nxt();
}
else{
    res.status(403).send("Logging-in data forbidden: not valid data for Logging-in")
}
}