const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// middlewares
app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster12.tzkl8fh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        const userCollection = client.db('BDC').collection('Users')
        const requestCollection = client.db('BDC').collection('DonationRequests')
        // client.connect();

        // user related APIs:
        // get user status
        app.get('/api/v1/isActive', async (req, res) => {
            const email = req?.query?.email
            const filter = { email: email }
            const projection = { _id: 0, status: 1 }
            const user = await userCollection.findOne(filter, { projection })
            res.send({ status: user.status })
        })

        // add user to DB
        app.post('/api/v1/add-user', async (req, res) => {
            const user = req.body
            user.status = 'active'
            const result = await userCollection.insertOne(user)
            res.send(result)
        })



        //Donation request related apis:
        //Request a donation
        app.post('/api/v1/create-donation-request', async (req, res) => {
            const data = req.body
            const result = await requestCollection.insertOne(data)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);



app.get('/', async (req, res) => {
    res.send('Assignment 12 server running')
})

app.listen(port, () => {
    console.log("A12 server running on port -", port);
})