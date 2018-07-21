var mysql = require('mysql');
var dbcon = require('./dbcon');
var con = mysql.createConnection(dbcon.connection);

module.exports ={


   selectquery :function(req,res,next) {

    if(req.whdata){
    var sql="select * from "+req.table_name+" where ?";
    console.log(sql);
     console.log(req.whdata);
      }
    else
     var sql="select * from "+req.table_name; 
    con.query(sql,req.whdata,function(err,result,fields){
         if(err){throw err;}
        else{ 
        console.log("select:"+result, fields,JSON.stringify(result));
        req.qresult=result;
        next();
      // res.send(req.mydata);
       } 
    }); 

  },

     insertquery :function(req,res,next) {

    var sql="insert into "+req.table_name+" set ?";
    con.query(sql,req.mydata,function(err,result){
         if(err){throw err;}
        else{ req.qresult=result;
        console.log("insert:"+result);
        next();
      // res.send(req.mydata);
       } 
    }); 

  },

    updatequery :function(req,res,next) {

    var sql="update"+req.table_name+" set ? where ?";
    con.query(sql,req.mydata,req.whdata,function(err,result){
         if(err){res.render('error');}
        else{ arr['uresult']=result;
        console.log("update:"+result);
        next();
      // res.send(req.mydata);
       } 
    }); 

  },
   deletequery:function(req,res,next) {

    var sql="delete from "+req.table_name+"where ?";
    con.query(sql,req.whdata,function(err,result){
         if(err){res.render('error');}
        else{ arr['dresult']=result;
        console.log("delete:"+result);
        next();
      // res.send(req.mydata);
       } 
    }); 

  }

}