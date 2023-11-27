const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// middlewares
app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const blogCollection = client.db('BDC').collection('Blogs')
        // client.connect();

        // user related APIs:
        // get user
        app.get('/api/v1/user', async (req, res) => {
            const email = req?.query?.email
            const filter = { email: email }
            const user = await userCollection.findOne(filter)
            res.send(user)
        })

        // get all users
        app.get('/api/v1/all-users', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })

        // add user to DB
        app.post('/api/v1/add-user', async (req, res) => {
            const user = req.body
            user.status = 'active'
            const result = await userCollection.insertOne(user)
            res.send(result)
        })

        app.post('/api/v1/update-user', async (req, res) => {
            const updateUser = req.body
            const filter = { email: req?.query?.email }
            // console.log(updateUser);
            const updatedDoc = {
                $set: updateUser
            }
            const result = await userCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })

        //update Role of user
        app.get('/api/v1/update-user/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const roleField = {
                $set: req.query
            }
            // console.log(roleField);
            const result = await userCollection.updateOne(filter, roleField)
            res.send(result)
        })

        app.get('/api/v1/paginated-all-users', async (req, res) => {
            const data = req.query
            const { size, currentPage } = data
            const result = await userCollection.find()
                .skip(size * currentPage)
                .limit(size * 1)
                .toArray();
            res.send(result);
        })


        //Donation request related apis:

        // Get all requests: or user specific
        app.get('/api/v1/my-donation-request', async (req, res) => {
            let filter = {}
            if (req?.query?.email) {
                filter = { email: req.query.email }
            }
            const result = await requestCollection.find(filter).sort({ postTime: -1 }).toArray()
            res.send(result)
        })

        // PAGINATED all request:
        app.get('/api/v1/paginated-all-req', async (req, res) => {
            const data = req.query
            const { size, currentPage } = data
            const result = await requestCollection.find()
                .skip(size * currentPage)
                .limit(size * 1)
                .toArray();
            res.send(result);
        })

        // Get all peding reqs (public)
        app.get('/api/v1/pending-donation-request', async (req, res) => {
            const filter = { requestStatus: 'pending' }
            const result = await requestCollection.find(filter).toArray()
            res.send(result)
        })

        app.get('/api/v1/request/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await requestCollection.findOne(filter)
            res.send(result)
        })

        //Request a donation
        app.post('/api/v1/create-donation-request', async (req, res) => {
            let data = req.body
            const time = new Date().getTime()
            data.postTime = time
            const result = await requestCollection.insertOne(data)
            res.send(result)
        })

        app.put('/api/v1/request-update/:id', async (req, res) => {
            const id = req.params.id
            const data = req.body
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: data
            }
            const result = await requestCollection.updateOne(filter, updateDoc)
            res.send(result)
        })


        // Delete a request
        app.delete('/api/v1/delete-donation-request/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await requestCollection.deleteOne(filter)
            res.send(result)
        })

        // Update req status done or cancel:
        app.put('/api/v1/status-update/:id', async (req, res) => {
            const id = req.params.id
            const field = req.body
            if (field.requestStatus === 'in progress' && Object.keys(field).length === 1) {
                console.log("executed if block");
                return res.status(401).send({ message: 'What are you doing???' })
            }
            const filter = { _id: new ObjectId(id) }
            const updateField = {
                $set: field
            }
            const result = await requestCollection.updateOne(filter, updateField)
            res.send(result)
        })

        // Get Document Counts 
        app.get('/api/v1/all-stats', async (req, res) => {
            const totalUser = await userCollection.estimatedDocumentCount()
            const totalRequest = await requestCollection.estimatedDocumentCount()
            const result = {
                totalUser,
                totalRequest,
                totalFunding: 34
            }
            res.send(result)
        })

        // get Request  count:
        app.get('/api/v1/all-req-count', async (req, res) => {
            const totalRequest = await requestCollection.estimatedDocumentCount()
            res.send({ count: totalRequest })
        })


        // // // /// // // Blogs related APIS:
            app.post('/api/v1/add-blog', async (req, res) => {
                const blog = req.body
                console.log('The blog',blog);
                const result = await blogCollection.insertOne(blog)
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