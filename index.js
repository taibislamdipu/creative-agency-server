const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.is4kq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const port = 5000

const app = express()

app.use(bodyParser.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('Creative Agency Server is Working!')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const orderCollection = client.db("creativeAgencyDB").collection("orders");
    const reviewCollection = client.db("creativeAgencyDB").collection("reviews");
    const servicesCollection = client.db("creativeAgencyDB").collection("services");
    const adminCollection = client.db("creativeAgencyDB").collection("adminEmail");

    console.log('creative network db connected successfully!!');



    // insert order info to database
    app.post('/addOrder', (req, res) => {
        const order = req.body;
        console.log(order);
        orderCollection.insertOne(order)
            .then((result) => {
                res.send(result.insertedCount > 0)
            })
    })

    // read all order data from database
    app.get('/allOrders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })


    // insert review info to database
    app.post('/addReview', (req, res) => {
        const review = req.body;
        console.log(review);
        reviewCollection.insertOne(review)
            .then((result) => {
                res.send(result.insertedCount > 0)
            })
    })

    // read reviews from database
    app.get('/reviews', (req, res) => {
        /*  reviewCollection.find({}).limit(3) */
        reviewCollection.find({}).sort({ _id: -1 }).limit(3)
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // insert new service info to database
    app.post('/addService', (req, res) => {
        const service = req.body;
        console.log(service);
        servicesCollection.insertOne(service)
            .then((result) => {
                res.send(result.insertedCount > 0)
            })

    })

    // read all services data from database
    app.get('/getServices', (req, res) => {
        servicesCollection.find({})
        .toArray((err, documents) => {
            res.send(documents)
        })
    })

    // insert admin email address into database
    app.post('/adminEmail', (req, res) => {
        const email = req.body;
        adminCollection.insertOne(email)
            .then((result) => {
                res.send(result.insertedCount > 0)
            })
    })

    // find admin email address for access control
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, adminEmail) => {
                res.send(adminEmail.length > 0)
            })
    })


});

app.listen(process.env.PORT || port, console.log('Database Running on Port', port))