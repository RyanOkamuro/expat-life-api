'use strict';

require('dotenv').config();
const chai = require('chai');

const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const {User} = require('../users/models');
const {BlogArticle} = require('../blogPosts/models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
const expect = chai.expect;

chai.use(chaiHttp);

let authToken;

function seedBlogData() {
    console.info('seeding blog info');
    const seedData = [];

    for (let i=1; i<=4; i++) {
        seedData.push(generateBlogData());
    }
    return BlogArticle.insertMany(seedData)
        .then(() => {
            return User.insertMany([{username: 'newuser', firstName: 'john', lastName: 'smith', password: '$2a$10$e0MH4k7wVdhPJYcrByPL7OeYj85xu7o0/kU183JYqUsWni7HtT7Dy'}])
                .then(() => loginUser());
        });
}

let randomBlogPost = 0;

function generateCategory() {
    const categoryName = ['Work_Abroad', 'Study_Abroad', 'Travel_Abroad', 'Study_Abroad']; 
    randomBlogPost = Math.floor(Math.random() * categoryName.length);
    return categoryName[randomBlogPost];
}

function generateFeatured() {
    const featured = ['Featured', 'Featured', 'Featured', 'Featured'];
    return featured[randomBlogPost];
}

function generateTitle() {
    const title = ['What is an Expat?', 'Study Abroad', 'Backpacking', 'Language Exchange'];
    return title[randomBlogPost];
}

function generateCaption() {
    const caption = ['What is it like being an expat?', 'Why study abroad?', 'What to expect traveling abroad?', 'Make the best of your Language Exchange.'];
    return caption[randomBlogPost];
}

function generateBlogEntry() {
    const blogEntry = ['An Expat, known as an expatriate is someone who lives outside their native country', 'Studying abroad was the best decision of my life.', 'By backpacking, you realize you really can survive with just a packpack!', 'Language exchange is about having fun'];
    return blogEntry[randomBlogPost];
}

function generateImage() {
    const image = ['https://github.com/RyanOkamuro/expat-life/blob/feature/landing-page/public/assets/Taipei/FXN.JPG?raw=true', 'https://github.com/RyanOkamuro/expat-life/blob/feature/landing-page/public/assets/Beijing/Study_Abroad.JPG?raw=true', 'https://github.com/RyanOkamuro/expat-life/blob/feature/landing-page/public/assets/Harbin/Harbin.jpg?raw=true', 'https://github.com/RyanOkamuro/expat-life/blob/feature/landing-page/public/assets/Tianjin/Study_Abroad_Tianjin_Signing.JPG?raw=true'];
    return image[randomBlogPost];
}

function generateBlogData() {
    return {
        'category': generateCategory(),
        'featured': generateFeatured(),
        'title': generateTitle(),
        'caption': generateCaption(),
        'blogEntry': generateBlogEntry(),
        'image': generateImage(),
    };
}

function tearDownDb() {
    console.warn('Delete database');
    return mongoose.connection.dropDatabase();
}

function loginUser() {
    return chai
        .request(app)
        .post('/api/auth/login')
        .send({username: 'newuser', password: 'demopassword'})
        .then(function(_res) {
            authToken = _res.body.authToken;
            return false;
        });
}

describe('Blog Post Information API resource', function() {

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return seedBlogData();
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    describe('GET Blog Data', function() {
        it('should list blog post detailed data on GET', function() {
            let res; 
            return chai
                .request(app)
                .get('/blogPosts')
                .then(function(_res) {
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res.body.bloggingEntry).to.have.lengthOf.at.least(1);
                    return BlogArticle.count();
                })
                .then(function(count) {
                    expect(res.body.bloggingEntry).to.have.lengthOf(count);
                });
        });

        it('should return the correct fields for deal', function() {
            let resBlog;
            return chai
                .request(app)
                .get('/blogPosts')
                .then(function(res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.bloggingEntry).to.be.a('array');
                    expect(res.body.bloggingEntry).to.have.lengthOf.at.least(1);
                    const expectedKeys = ['category', 'title', 'caption', 'blogEntry', 'image'];
                    res.body.bloggingEntry.forEach(function(bloggingArticle) {
                        expect(bloggingArticle).to.be.a('object');
                        expect(bloggingArticle).to.include.keys(expectedKeys);
                    });
                    resBlog = res.body.bloggingEntry[0];
                    return BlogArticle.findById(resBlog.id);
                })
                .then(function(bloggingArticle) {
                    expect(resBlog.id).to.equal(bloggingArticle.id);
                    expect(resBlog.category).to.equal(bloggingArticle.category);
                    expect(resBlog.title).to.equal(bloggingArticle.title);
                    expect(resBlog.caption).to.equal(bloggingArticle.caption);
                    expect(resBlog.bloggingEntry).to.equal(bloggingArticle.bloggingEntry);
                    expect(resBlog.image).to.equal(bloggingArticle.image);
                });
        });
    });

    describe('POST Blog Information', function() {
        it('should add a blog article on POST', function() {
            const newBlogPost = generateBlogData();
            return chai
                .request(app)
                .post('/blogPosts')
                .send(newBlogPost)
                .then(function(res) {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.include.keys('category', 'featured', 'title', 'caption', 'blogEntry', 'image');
                    expect(res.body.category).to.equal(newBlogPost.category);
                    expect(res.body.featured).to.equal(newBlogPost.featured);
                    expect(res.body.title).to.equal(newBlogPost.title);
                    expect(res.body.caption).to.equal(newBlogPost.caption);
                    expect(res.body.blogEntry).to.equal(newBlogPost.blogEntry);
                    expect(res.body.image).to.equal(newBlogPost.image);
                    expect(res.body.id).to.not.be.null;
                    return BlogArticle.findById(res.body.id);
                })
                .then(function(bloggingArticle) {
                    expect(bloggingArticle.category).to.equal(newBlogPost.category);
                    expect(bloggingArticle.featured).to.equal(newBlogPost.featured);
                    expect(bloggingArticle.title).to.equal(newBlogPost.title);
                    expect(bloggingArticle.caption).to.equal(newBlogPost.caption);
                    expect(bloggingArticle.blogEntry).to.equal(newBlogPost.blogEntry);
                    expect(bloggingArticle.image).to.equal(newBlogPost.image);
                });
        });
    });

    describe('PUT Blog Information', function() {
        it('should update an existing blog post on PUT', function () {
            const updateData = {
                category: 'Travel_Abroad',
                featured: 'No',
                title: 'Backpacking',
                caption: 'What to expect traveling abroad?',
                blogEntry: 'By backpacking, you realize you really can survive with just a packpack!',
                image: 'https://github.com/RyanOkamuro/expat-life/blob/feature/landing-page/public/assets/Harbin/Harbin.jpg?raw=true',
            };

            return BlogArticle 
                .findOne()
                .then(function(bloggingArticle){
                    updateData.id = bloggingArticle.id;
                    return chai.request(app)
                        .put(`/blogPosts/${bloggingArticle.id}`)
                        .send(updateData);
                })
                .then(function(res) {
                    expect(res).to.have.status(202);
                    return BlogArticle.findById(updateData.id);
                })
                .then(function(bloggingArticle) {
                    expect(bloggingArticle.category).to.equal(updateData.category);
                    expect(bloggingArticle.featured).to.equal(updateData.featured);
                    expect(bloggingArticle.title).to.equal(updateData.title);
                    expect(bloggingArticle.caption).to.equal(updateData.caption);
                    expect(bloggingArticle.blogEntry).to.equal(updateData.blogEntry);
                    expect(bloggingArticle.image).to.equal(updateData.image);
                });
        });
    });

    describe('DELETE Blog Information', function() {
        it('delete blog entry by id', function() {
            let bloggingEntry;
            return BlogArticle
                .findOne()
                .then(function(_bloggingEntry) {
                    bloggingEntry = _bloggingEntry;
                    return chai.request(app).delete(`/blogPosts/${bloggingEntry.id}`);
                })
                .then(function(res) {
                    expect(res).to.have.status(204);
                    return BlogArticle.findById(bloggingEntry.id);
                })
                .then(function(_bloggingEntry) {
                    expect(_bloggingEntry).to.be.null;
                });
        }); 
    });
});