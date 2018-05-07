var express = require('express');
var router = express.Router();
const gameModel = require('../models/game-database-model');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index',{ user: req.user? req.user : undefined });
});

router.get('/getname',function(req,res){
    res.send( req.session.name);

});
router.get('/setname',(req,res) => {
    req.session.name='John Cena';
    res.redirect('/getname');
});

module.exports = router;

router.route('/showpost')
    .get((req,res)=>{
    res.render('formpost');
})
    .post((req,res)=>{
    res.send(req.body.name);
});

router.get('/number/:id(\\d+)', function(req, res){
  res.send('Le nombre est ' + req.params.id);
});

router.get('/list', (req, res, next) => {
    gameModel.allGames()
    .then(list => {
        if(!list) list = [];
        res.send(list);
    })
    .catch(err => { res.send(500, err); error(err.stack); next(false); });
});

router.get('/game/:owner', (req, res, next) => {
    gameModel.get(req.params.owner)
    .then(game => {
        if(!game) game = "";
        res.send(game);
    })
    .catch(err => { res.send(500, err); error(err.stack); next(false); });
});

