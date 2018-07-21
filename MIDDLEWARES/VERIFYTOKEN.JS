var jwt = require('jsonwebtoken');

module.exports = function(req,res,next) {
    // console.log(req);
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
   if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') { // Authorization: Bearer g1jipjgi1ifjioj
      // Handle token presented as a Bearer token in the Authorization header
    var token = req.headers.authorization.split(' ')[1];
    } 
    else if (req.cookies && req.cookies.token) {
      // Handle token presented as a cookie parameter
      var token =req.cookies.token;
    }
    if (token) {
    // verifies secret and checks exp
        jwt.verify(token,'supersecretkey', function(err, decoded) {
            if (err) { //failed verification.
                return res.json({"error": true});
            }
            req.decoded = decoded;
            req.token=token;
            next(); //no error, proceed
        });
    } else {
        // forbidden without token
        return res.status(403).send({
            "error": true
        });
    }
}