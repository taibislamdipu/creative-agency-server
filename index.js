const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
require('dotenv').config();


const fileUpload = require('express-fileupload');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.is4kq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const port = 5000

const app = express()

app.use(bodyParser.json());
app.use(fileUpload());
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

        const name = req.body.name;
        const email = req.body.email;
        const file = req.files.file;
        const serviceName = req.body.serviceName;
        const details = req.body.details;
        const price = req.body.price;
        const status = req.body.status;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var orderImg = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        orderCollection.insertOne({ name, email, serviceName, details, price, status, orderImg })
            .then((result) => {
                res.send(result.insertedCount > 0)
                console.log('order added', result);
            })
    })

    // insert new service info to database
    app.post('/addService', (req, res) => {

        const title = req.body.title;
        const description = req.body.description;
        const file = req.files.file;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }

        servicesCollection.insertOne({ title, description, image })
            .then((result) => {
                res.send(result.insertedCount > 0)
                console.log('service added', result);
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

    // find specific user order
    app.get('/specificOrder', (req, res) => {
        orderCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })


    // update order status
    app.patch('/update/:id', (req, res) => {
        orderCollection.updateOne({ _id: ObjectId(req.params.id) },
            {
                $set: { status: req.body.status }
            })
            .then((result) => {
                res.send(result.modifiedCount > 0)
            })
    })

});

app.listen(process.env.PORT || port, console.log('Database Running on Port', port))