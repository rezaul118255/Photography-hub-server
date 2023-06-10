const express = require('express');
const app = express();
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ghfcjpf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const UsersCollection = client.db("RestuDb").collection("users");
        const ClassCollection = client.db("RestuDb").collection("Class");
        const InstructorsCollection = client.db("RestuDb").collection("Instructors");
        const CartCollection = client.db("RestuDb").collection("Carts");
        // user related apis 
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await UsersCollection.insertOne(user);
            res.send(result);
        })


        //  Class related apis
        app.get('/Class', async (req, res) => {
            const result = await ClassCollection.find().toArray();
            res.send(result)
        })



        // Instructors related apis
        app.get('/Instructors', async (req, res) => {
            const result = await InstructorsCollection.find().toArray();
            res.send(result)
        })




        // cart collection

        app.get('/Carts', async (req, res) => {
            const email = req.query.email;

            if (!email) {
                res.send([]);
            }
            const query = { email: email };
            const result = await CartCollection.find(query).toArray();
            res.send(result);
        });

        app.post('/Carts', async (req, res) => {
            const item = req.body;
            console.log(item);
            const result = await CartCollection.insertOne(item);
            res.send(result);
        })

        app.delete('/Carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await CartCollection.deleteOne(query);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('resturent  is sitting')
})
app.listen(port, () => {
    console.log(`Resturent is sitting on port${port}`)
})