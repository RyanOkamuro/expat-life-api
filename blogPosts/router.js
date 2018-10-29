const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require('passport');

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
    BlogArticle
        .findById(req.params.id)
        .then(BlogArticle => res.json(BlogArticle.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['category', 'featured', 'title', 'caption', 'blogEntry', 'image'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    BlogArticle
        .create({
            category: req.body.category,
            featured: req.body.featured,
            title: req.body.title,
            caption: req.body.caption,
            blogEntry: req.body.blogEntry,
            image: req.body.image,
        })
        .then(bloggingEntry => res.status(201).json(bloggingEntry.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

module.exports = {router};