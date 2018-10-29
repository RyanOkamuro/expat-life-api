'use strict';

const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    category:  {type: String, required: true},
    featured: {type: String, required: false},
    title: {type: String, required: true},
    caption: {type: String, required: true},
    blogEntry: {type: String, required: true},
    image: {type: String, required: true},
    createdAt: {type: Date, default: Date.now} 
});

blogSchema.methods.serialize = function() {
    return {
        id: this._id,
        category: this.category,
        featured: this.featured,
        title: this.title,
        caption: this.caption,
        blogEntry: this.blogEntry,
        image: this.image,
        createdAt: this.createdAt
    };
};

const BlogArticle = mongoose.model('BlogArticle', blogSchema);

module.exports = {BlogArticle};