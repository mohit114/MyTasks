var express = require('express');
var passport = require('passport');
var dateTime = require('node-datetime');
var mongoClient = require('../config/db');
var ObjectId = require('mongodb').ObjectID;
var router = express.Router();

var mongoClient = require('../config/db');

var taskArray = [];

router.get('/', function(req, res, next){
  res.render('index', {title: 'Manage Task'});
});

router.get('/login', function(req, res, next){
  res.render('login', {title: 'Login'});
});

router.get('/signup', function(req, res, next){
  res.render('signup', {title: 'SignUp'});
});

router.get('/tasks', isLoggedIn, function(req, res, next){
  taskArray = [];
  var db =  mongoClient.getDb();
  findTasks(db, req.user._id, function(){
    res.render('tasks', {title: 'Tasks', taskList: taskArray});
  });
});

router.get('/tasks/add', isLoggedIn, function(req, res, next){
  res.render('addtask', {title: 'AddTask'});
});

router.get('/tasks/edit/:id', isLoggedIn, function(req, res, next){
  var db =  mongoClient.getDb();
  db.collection('tasks').findOne({"_id": new ObjectId(req.params.id)}, function(err, task){
    if(err)
    console.log(err);
    else{
      res.render('taskedit', {title: 'EditTask', task:task});
    }
  });
});

router.get('/tasks/delete/:id', isLoggedIn, function(req, res, next){
  var db =  mongoClient.getDb();
  db.collection('tasks').deleteOne({"_id": new ObjectId(req.params.id)}, function(err, result){
    if(err)
    console.log(err);
    else{
      res.location('/tasks');
      res.redirect('/tasks');
    }
  });
});

router.post('/tasks/edit/:id', isLoggedIn, function(req, res){
  var db =  mongoClient.getDb();
  var dt = dateTime.create();
  db.collection('tasks').updateOne(
     { "_id" : new ObjectId(req.params.id) },
     {
       $set: { "taskName": req.body.taskname, "description": req.body.description, "modifiedDate": dt.format('Y-m-d H:M:S')}
     }, function(err, results) {
     if(err)
     console.log(err);
     else {
       res.location('/tasks');
       res.redirect('/tasks');
     }
  });
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/login',
  failureRedirect: '/signup',
  failureFlash: true,
}));

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/tasks',
  failureRedirect: '/login',
  failureFlash: true,
}));

router.post('/tasks/add', function(req, res){
  var db =  mongoClient.getDb();
  var dt = dateTime.create();
  db.collection('tasks').insertOne({
    "taskName" : req.body.taskName,
    "description": req.body.description,
    "createdBy": req.user._id,
    "createdDate": dt.format('Y-m-d H:M:S'),
    "modifiedDate": ''

  }, function(err, newTask){
      if (err)
        throw err;
      else{
        res.location('/tasks');
        res.redirect('/tasks');
      }
  });
});

module.exports = router;

var findTasks = function(db, userid, callback) {
   var cursor = db.collection('tasks').find({"createdBy": userid});
   cursor.each(function(err, doc) {
      if (doc != null) {
        var taskObject = JSON.parse(JSON.stringify(doc));
        taskArray.push(taskObject);
      } else {
         callback();
      }
   });
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();
  res.redirect('/');
}
