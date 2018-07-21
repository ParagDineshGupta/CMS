




_________________________________________________________________________________
//this is post for forgot password which requires user's email id
router.post('/forgot', function(req, res){
    var email = req.body.email;
    //sql connection
      // connection.connect(function(err){
   //if(err) throw err;
   var sql="select * from  customer_master where EmailId='"+email+"'";
   console.log(email);
   connection.query(sql,function(err,result){
       //console.log(result);
        if(err){
            return handleError(err, null, res)
        }
        if(result.length<1){
            return handleError(null, "no user with this username exists", res);
        }
        crypto.randomBytes(20, function(err, buf){
            if(err){
                return handleError(err, null, res);
            }
            var token = buf.toString('hex');
            result[0].PasswordToken = token;
            result[0].PasswordExpire = Date.now() + 3600000; //1hour
            console.log(result);
            //user.save(function(err){
               

		     // connection.connect(function(err){
		   //if(err) throw err;
		   var sql="update customer_master set TokenTime='"+result[0].PasswordExpire+"', PasswordToken='"+result[0].PasswordToken+"' where email='"+email+"'";
		   console.log(email);
		   connection.query(sql,function(err,result){

               
                if(err){
                    return handleError(err, null, res);
                }
            

            var smtpTransport = nodemailer.createTransport({
                service:'SendGrid',
                auth:{
                    user:'jarvis123',
                    pass:'abhansh@123'
                }
            });
            var mailOptions = {
                to:email,
                from:'passwordreset@demo.com',
                subject:'concrete password reset',
                text:'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err){
                if(err){
                    return handleError(err,"error me", res);
                }
                res.json({
                    success:true,
                    msg:"a mail has been sent to your registered mail id"
                });
            })
        })
    // });
})
});
// });
  });

//this route will verify the password token hasn't expire and returns a json response
router.get('/reset/:token', function(req, res) {
   // User.findOneForResetPassword(req.params.token, function(err, user) {
    
     connection.connect(function(err){
    console.log("Connected form resetpasswordget");
    connection.query("select * from user where resetPasswordToken='"+req.params.token+"' &  resetPasswordExpire <'"+Date.now()+"'",function(err,result,fields){
   if(err) throw err;

      if (result.length<=0) {
          var result = {
              err:true,
              msg:'Password reset token is invalid or has expired.'
          }
        return res.status(200).json(result);
      }
      var result = {
          msg:"reset your password", 
          user:result
      }
      res.status(200).json(result);
    });
});
 });

//POST for password reset and if token hasn't expired, the password of user is reset.
router.post('/reset/:token', function(req, res){
    //User.findOneForResetPassword(req.params.token, function(err, user){
        
    // connection.connect(function(err){
    console.log("Connected form resetpasswordget");
    connection.query("select * from customer_master where PasswordToken='"+req.params.token+"' &  TokenTime <='"+Date.now()+"'",function(err,result,fields){

        if(err){
            return handleError(err);
        }
        if(result.length<=0){
            var result = {
                msg:"this token has expired"
            }
            return res.status(200).json(result);
        }
        result[0].Password = req.body.password;
        result[0].TokenTime = undefined;
        result[0].PasswordToken = undefined;

        //User.saveUserResetPassword(user, function(err){
          
        bcrypt.hash(result[0].Password, 10, function(err, hash){
        if(err)throw err;
        result[0].Password = hash;
        //user.save(callback); 
          
             connection.query("update customer_master set Password='"+result[0].Password+"',PasswordToken='"+result[0].PasswordToken+"' &  TokenTime='"+result[0].TokenTime
              +"' where EmailId='"+result[0].EmailId+"'",function(err,result,fields){

            if(err){
                return handleError(err, null, res);
            }
            //previous user in place of result in below line 
            req.logIn(result, function(err){
                res.status(200).json("password has been reset successfully");
            });
        });
    });
});
// });
});