const express = require('express');
const app = express();
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' });
    }
    // bearer token
    const token = authorization.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}




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


        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' })

            res.send({ token })
        })




        // user related apis 

        app.get('/users', async (req, res) => {
            const result = await UsersCollection.find().toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;

            const query = { email: user.email }
            const existingUser = await UsersCollection.findOne(query);


            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }

            const result = await UsersCollection.insertOne(user);
            res.send(result);
        })

        app.get('/users/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;

            if (req.decoded.email !== email) {
                res.send({ admin: false })
            }

            const query = { email: email }
            const user = await UsersCollection.findOne(query);
            const result = { admin: user?.role === 'admin' }
            res.send(result);
        })
        app.get('/users/Instructor/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;

            if (req.decoded.email !== email) {
                res.send({ Instructor: false })
            }

            const query = { email: email }
            const user = await UsersCollection.findOne(query);
            const result = { Instructor: user?.role === 'Instructor' }
            res.send(result);
        })



        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };

            const result = await UsersCollection.updateOne(filter, updateDoc);
            res.send(result);

        })
        app.patch('/users/Instructor/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'Instructor'
                },
            };

            const result = await UsersCollection.updateOne(filter, updateDoc);
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

        app.get('/Carts', verifyJWT, async (req, res) => {
            const email = req.query.email;

            if (!email) {
                res.send([]);
            }
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ error: true, message: 'porviden access' })
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