const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
const app = express()
let jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000

/* Using Middleware */
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://food-sharing-system.web.app',
        'https://food-sharing-system.firebaseapp.com',
    ],
    credentials: true
}));
app.use(express.json());


/* Starting MongoDB */
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oglq0ui.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        // Send a ping to confirm a successful connection

        const HouseCollection = client.db("House-Hunter-DB").collection('Houses');
        // const requestedFoodCollection = client.db("Meal-Miracle-DB").collection('reqFoods');






        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('House is Hunting!')
})

app.listen(port, () => {
    console.log(`House Hunting is listening on port ${port}`)
})