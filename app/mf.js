var mysql = require('mysql');
var dbcon = require('./dbcon');
var connection = mysql.createConnection(dbcon.connection);
var jwt = require('jsonwebtoken');
const secret = "supersecretkey";

module.exports ={
getAllUserDashboardDetails:function(req, res, userId, token){
    

    async.parallel({
        orders: function(callback) {
           // Order.getAllOrdersByUserId(userId, callback)
            
            // if(err) throw err;
		    console.log("Connected from getAllOrderdByUserId");
		    //requestedById not here
		    var sql="select * from orders where requestedBy='"+userId+"'";
		    connection.query(sql,function(err,result,fields){
		     if(err) throw err;
		     console.log(result);
		     console.log(userId);
		     callback(err,result);
		   });
	   
   },


            issues: function(callback) {
            
             //if(err) throw err;
		    console.log("Connected from getAllIssuesByUserId");
		    connection.query("select * from issues where userId='"+userId+"'",function(err,result,fields){
		     if(err) throw err;
		     console.log(result);
		        callback(err,result);
		        });
	         
        },
        quotes: function(callback){
           
             //if(err) throw err;
		    console.log("Connected from getAllquotesByUserId");
		    connection.query("select * from quotes where requestedById='"+userId+"'",function(err,result,fields){
		     if(err) throw err;
		     console.log(result);
		        callback(err,result);
		        });
	        
        }
   },

function(err, results) {
        // results is now equals to: {one: 1, two: 2}
       //console.log("hello");
        if(err){
            return handleError(err);
        }
        return res.json({
            success:true, 
            results:results,
            token:token

        })
    });
    
},


varification:function(req,res,next) {

    //        req.checkBody(req.body.Password, 'password cannot be empty').notEmcpty();
    //        req.checkBody(req.body.Password, 'please enter a valid username').isEmail();
    // req.checkBody('password', 'please enter a valid password').notEmpty();
   
    
    
    // //getting all the validation errors
    // var errors = req.validationErrors();
    // if(errors){
    //    // res.send(errors);
    //      return handleError(errors,, res);
    // }else{}

          console.log(req.body);

    var sql="select * from customer_master where EmailId ='"+req.body.emailId+"';select * from customer_master where CompanyName ='"+req.body.companyName+"';select * from customer_master where ContactNumber ='"+req.body.contactNumber+"'";
      connection.query(sql,function(err,results){
          if(err) throw err;
          else if(Object.keys(results[0]).length){
           res.json({
                    success:false,
                    msg: 'This Email id is Already used',
                    // response:result
                });
         } 
          else if(Object.keys(results[1]).length){ 
            res.json({
                    success:false,
                    msg: 'This Company Name is Already used',
                    // response:result
                });
          }
           else if(Object.keys(results[2]).length){ 
            res.json({
                    success:false,
                    msg: 'This Contact Number is Already used',
                    // response:result
                });
          }
          else{
            next();
          }

      });  
       
         } ,
         uservarification:function(req,res,next) {

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
    var userId = decoded.id;

    connection.query("select * from customer_master where CompanyId='"+userId+"'",function(err,result,fields){
      if(err){
        res.json({
            success:false,
            msg:'Wrong User'
          });
      }
      else{
        req.user=result[0];
         next();
      }
     

    });
            });

         }

};