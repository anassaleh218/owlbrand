const validator = require("../util/UserValidator");

module.exports = (req,res,nxt)=>{
let isValid= validator(req.body);
if(isValid){
    req.valid=true;
    nxt();
}
else{
    res.status(403).send("Registration data forbidden: invalid data for a user");
}
}