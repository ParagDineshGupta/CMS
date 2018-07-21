console.log(__dirname);
var dateTime = require('node-datetime');
var mysql = require('mysql');
var admin = require('./app/admin');
var mf = require('./app/mf');
var dbquery = require('./app/dbquery');
var path = require('path');
var dbcon = require('./app/dbcon');
var connection = mysql.createConnection(dbcon.connection);
var dt = dateTime.create();
var mydateTime = dt.format('Y-m-d H:M:S');
var mydate = dt.format('Y-m-d');
var mydomin='http://localhost:8080/';
// var mydomin=req.headers.host;
var expressValidator = require('express-validator');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
//this is used for generating SVG Captchas
var svgCaptcha = require('svg-captcha');
var async = require('async');
var jwt = require('jsonwebtoken');
const secret = "supersecretkey";
let verifyToken = require('./middlewares/verifyToken');
// var mysql= require('mysql');
var bcrypt = require('bcrypt');
//for qr image matrix to pixels
var savePixels = require("save-pixels")
//importing passport and its local strategy
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//qr packages
var qr = require('qr-image');
var fs = require('fs');
var extend = require('util')._extend;
//var LocalStrategy = require('passport-local').Strategy;
var fs = require("fs");
var csv = require('fast-csv');
module.exports = function(app, passport) {
// var isAuthenticated = jwt.isAuthenticated(secret);
 app.use(expressValidator());


 app.get('/',function(req, res, next){

  res.render('home',{title:'Equipshare CMS'})
 });
 app.get('/vendor',verifyToken,function(req, res, next){
  
   res.render('vendor',{title:'vender',token:req.decoded});
 });
  app.get('/contractor',verifyToken,function(req, res, next){
    console.log("11111111111111111"+req.token);
    res.render('contractor',{title:'vendor',token:req.token,AllUserDashboardDetails:''});
 });

app.get('/user_login',function(req, res, next){

  res.render('user_login.ejs' , {msg : 'Enter the following details', login_para : 1});
 });


app.post('/user_login', function(req, res, next){

    //extracting all the info from request parameters
    var username = req.body.username;
    var password = req.body.password;
    
    
    //checking all the form-data is right
    req.checkBody('username', 'please enter a valid username').isEmail();
    req.checkBody('password', 'please enter a valid password').notEmpty();
   
    console.log('login hit');
    
    //getting all the validation errors
    var errors = req.validationErrors();
    if(errors){
       // res.send(errors);
         // return handleError(errors,'username or password is not valid', res);
         res.render('user_login.ejs' , {msg : 'Email-Id or password is not valid', login_para : 1});
    }else{
        //console.log('else called');
        console.log(username,password);
        //checking the user credentials for loggin him in with session
      
               //sql db
          connection.query("select *  from customer_master where EmailId='"+username+"'",function(err,result,fields){
         if(err){
          console.log(err);
                return handleError(err, null, res);
            }
         else if(result.length<=0)
         {
                console.log("user with username : " + username + " not found");
                msg = "user with this username does not exist";
                // return handleError(null, msg, res);
                res.render('user_login.ejs' , {msg : 'user with this Email-Id does not exist', login_para : 1});
            }
            else{
                // console.log(result[0].user_id);
                 // result[0].password is password field in database
                 bcrypt.compare(password, result[0].Password , function(err, isMatch){
             if(err){
                    return handleError(err, null, res);
                }
                if(!isMatch){
                    // return handleError(null, "wrong password", res);
                res.render('user_login.ejs' , {msg : 'Wrong password', login_para : 1});
  
                }
                //make session
                jwt.sign({id: result[0].CompanyId}, secret,{ expiresIn: '1h' }, function(err, token){
                    if(err)handleError(err, null, res);
                   // return mf.getAllUserDashboardDetails(req, res, result[0].CompanyId, token);
                //     res.json({
                //     success:true,
                //     msg: 'login successful ',
                //     token:token,
                //     // response:result
                // });

                // res.cookie('tokenKey', 'ajsbjabcjcTOKENajbdcjabdcjdc');    
                res.render('user',{title:'user',token:token,data:result});
                })
  
             
              });}

        });
   }
});

//auth token and set req.user  or  return 401 code
app.get('/getWithAuth',verifyToken, function(req, res) {
  res.send(req.decoded);
});
app.get('/getWith', function(req, res) {
  jwt.verify(req.headers.authorization, secret, function(err, decoded){
    if(err){
      console.log(req.headers.authorization)
      console.log("%%%%%%%%%%%%%%%%%%%" + err);
      res.json({
        success:false,
        msg:"some error occured"
      })
      return;
    }
  res.send(req.user);
});});
app.post('/user_signup',mf.varification,function(req, res, next){
           console.log(req.body);  
                bcrypt.hash(req.body.password, 10, function(err, hash){
        if(err)throw err;
        req.body.password = hash;
          var sql="Insert into customer_master SET ? ;";
          connection.query(sql,req.body,function(err,result){
     
      if(err){
        console.log(sql,err);
                res.json({
                    success:false,
                    msg: 'user not created',
                    // response:result
                });
            }else{

               res.render('./user_login.ejs',{msg:'Signup successful! Login to continue', login_para:1}); 
                //console.log(user);
                // res.json({
                //     success:true,
                //     msg: 'user created',
                //     // response:result
                // });
            }
   });
        
    });
    
    });

app.post('/rfq',varifyToken,function(req, res, next){
 
 
  var rfq = extend({}, req.body);
    delete rfq.equipmentList;
    var sql="Insert into rfq SET ? ;";
         connection.query(sql,rfq,function(err,result){
     
      if(err){
        console.log(sql,err);
                res.json({
                    success:false,
                    msg: 'Rfq fail',
                    // response:result
                });
            }else{

              console.log(result.insertId);
              // console.log(result);
              // console.log(result[0]);

              if(result.insertId)
              {
                var sql="";
                console.log(req.body);
                var eqlen =req.body.equipmentList.length;
                 var arr=[];
                for(var i=0;i<eqlen;i++)
                {
                    req.body.equipmentList[i].RFQId=result.insertId;
                  
                  var sql=sql+"Insert into equipment_request set ? ;";
                  arr[i]=req.body.equipmentList[i];
                }
                 connection.query(sql,arr,function(err,result){
     
      if(err){
        console.log(sql,err);
                res.json({
                    success:false,
                    msg: 'Equipment Entry Fail',
                    // response:result
                });
            }else{
              res.json({
                    success:true,
                    msg: 'Thanks for your enquiry',
                    // response:result
                });

            }

              });
                //console.log(user);
                
            }
            else{
              //
              return handleError(errors,'something went wrong', res);
            }
   }
 });


});



//this function is a general error handler
function handleError(err, msg, res){
    console.log(err);
    if(msg == undefined){
        msg = "there was some error at the server";
    }
    return res.json({
        success:false,
        msg: msg,
        err:err
    });
}

function isAuthenticated(req, res, next){
    if(req.headers['authorization']){
        jwt.verify(req.headers['authorization'], secret, function(err, decoded){
            if(err){
                console.log(err);
                return handleError(err, null, res);
            }
            res.locals.userId = decoded.id;
            console.log("calling next now and " + res.locals.userId);
            return next();
        })
    }else{
        res.json({
            success:false,
            auth:false,
            msg:"authentication unsuccessful, please login again"
        });
    }
}




}