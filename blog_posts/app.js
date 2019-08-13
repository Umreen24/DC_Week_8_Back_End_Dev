
const PORT = 3000
const express = require('express')
const app = express()
const mustacheExpress = require('mustache-express')
const session = require('express-session')
const path = require('path')

const VIEWS_PATH = path.join(__dirname,'/views')

app.engine('mustache',mustacheExpress(VIEWS_PATH + '/partials','.mustache'))
app.set('views',VIEWS_PATH)
app.set('view engine','mustache')

var pgp = require('pg-promise')();
var connectionString = 'postgres://localhost:5432/blogsdb';
var db = pgp(connectionString);

app.use(express.urlencoded())
app.use('/css',express.static('css'))

app.use(session({
    secret: 'fwaaf',
    resave: false,
    saveUninitialized: false,
}))

app.get('/',(req,res) => {
    res.render('index')
})

app.get('/blog-posts',(req,res) => {
    
    db.any('SELECT blogid, title, subtitle, body, created FROM blogs;')
    .then(blogs => {
        res.render('blog-posts', {blogs: blogs})
    }).catch(error => {
        res.render('/', {message: 'Unable to get blog posts!'})
    })
})

app.get('/add-blog',(req,res) => {
    res.render('add-blog')
})

app.get('/edit-post',(req,res) => {
    res.render('edit-post')
})

app.post('/add-blog',(req,res) => {
    let title = req.body.title
    let subtitle = req.body.subtitle
    let body = req.body.description 

    db.none('INSERT INTO blogs(title,subtitle,body) VALUES($1,$2,$3)',[title,subtitle,body])
    .then(() => {
        res.redirect('/blog-posts')
    })
})

app.post('/edit-post',(req,res) => {
    let blogid = req.body.blogid
    let title = req.body.title
    let subtitle = req.body.subtitle
    let body = req.body.description

    db.none('UPDATE blogs SET title = ($2), subtitle = ($3), body = ($4) WHERE blogid = ($1)',[blogid,title,subtitle,body])
    .then(() =>{
        res.redirect('/')
    }).catch(error =>{
        res.send({message: 'Could not update post'})
    })
})

app.post('/delete-post',(req,res) => {
    let blogid = req.body.blogid

    db.none('DELETE FROM blogs WHERE blogid = ($1)', [blogid])
    .then(() => {
        res.redirect('/blog-posts')
    })
})

app.listen(PORT,() =>{console.log('server running')})