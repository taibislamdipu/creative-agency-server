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
    res.send('Doctors portal is working!')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const orderCollection = client.db("creativeAgencyDB").collection("orders");
    console.log('creative network db connected successfully!!');

    app.post('/addOrder', (req, res) => {
        const order = req.body;
        console.log(order);
        orderCollection.insertOne(order)
            .then((result) => {
                res.send(result.insertedCount > 0)
            })
    })

    /* app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        console.log(date.date);
        appointmentCollection.find({ date: date })
            .toArray((err, documents) => {
                res.send(documents);
            })
    }) */
});

app.listen(process.env.PORT || port, console.log('Database Running on Port', port))