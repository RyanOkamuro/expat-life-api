const express = require('express');
const router = express.Router();
const passport = require('passport');

const {BlogArticle} = require('./models');

//.find() is a query filter that it will use to match documents. If that function completes successfully, the callback in .then() will run. 
//we send back a JSON response that contains a subset of the fields from the full document
//If the query is successful, we return an object with the property bloggingEntry whose value is an array of blog entry objects.
//Serialization: describes how the object needs to be turned into a JSON string when sent via our REST API.Just because our data looks one way in the database doesn't mean that our API needs to pass along the raw data. Serialize controls what is sent back via our API.     
//.exec(): model method that accepts query conditions can be executed using exec method, used for fully-fledged promise
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

//.find returns an array of documents, .findById returns a single document
//In the success case, we return a JSON string representing the object produced by the blog article's serialize method.
router.get('/:id', (req,res) => {
    BlogArticle
        .findById(req.params.id)
        .then(BlogArticle => res.json(BlogArticle.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

router.post('/', (req, res) => {
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

router.put('/:id', (req, res) => {
    if (!(req.params.id && req.body.id === req.body.id)) {
      const message = (
        `Request path id (${req.params.id}) and request body id ` +
        `(${req.body.id}) must match`);
      console.error(message);
      return res.status(400).json({message: message});
    }
    const toUpdate = {};
    const updateableFields = ['category', 'featured', 'title', 'caption', 'blogEntry', 'image'];
    
    updateableFields.forEach(field => {
      if (req.body[field]) {
        toUpdate[field] = req.body[field];
      }
    });
      BlogArticle
      //for matching criteria with same id, $set operator will update new inputed values one of the updatedable Fields
      .findByIdAndUpdate(req.params.id, {$set: toUpdate})
      .then(bloggingEntry => {return res.status(202).json(bloggingEntry)})
    //   .then(bloggingEntry => res.status(204).end())
      .catch(err => res.status(500).json({message: 'Internal server error'}));
  });

  router.delete('/:id', (req, res) => {
    BlogArticle
      .findByIdAndRemove(req.params.id)
      .then(() => res.status(204).end())
      .catch(err => res.status(500).json({message: 'Internal server error'}));
  });

module.exports = {router};