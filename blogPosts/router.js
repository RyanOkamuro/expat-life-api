const express = require('express');
const router = express.Router();
const {BlogArticle} = require('./models');

router.get('/', (req, res) => {
    BlogArticle 
        .find({}).exec()
        .then(bloggingEntry => {
            res.json({
                bloggingEntry: bloggingEntry.map(
                    (BlogArticle) => BlogArticle.serialize())
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

router.get('/:id', (req,res) => {
    Deal
        .findById(req.params.id)
        .then(BlogArticle => res.json(BlogArticle.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});