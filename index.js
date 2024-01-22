const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
const app = express()
let jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000
let cookieParser = require('cookie-parser')

/* Using Middleware */
app.use(cors({
    origin: [
        'http://localhost:5173',
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

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

        const userCollection = client.db("House-Hunter-DB").collection('Users');
        const houseCollection = client.db("House-Hunter-DB").collection('Houses');
        // const requestedFoodCollection = client.db("Meal-Miracle-DB").collection('reqFoods');


        // -------------------------------------AUTH---------------------------------------------
        app.post('/jwt', async (req, res) => {
            let user = req.body;
            // console.log("User in Jwt :", user);
            let token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token });
        })


        /*Logout APi */
        app.post('/logout', async (req, res) => {
            let user = req.body;
            console.log("user for logout: ", user);
            res.clearCookie('token', { maxAge: 0, sameSite: 'none', secure: true }).send({ success: true })
        })

        //Registration
        app.post('/user', async (req, res) => {
            let data = req.body;
            let email = data?.email;
            let query = {email: email};
            let exist = await userCollection.findOne(query);
            if(exist){
                res.send('User already exist');
                return;
            }
            let result = await userCollection.insertOne(data)
            res.send(result);
        });

        // ===============================Check Admin👇===================================
        app.get('/users/owner/:email', async (req, res) => {
            let userEmail = req.params.email;
            console.log(userEmail);
            let query = { email: userEmail };
            let user = await userCollection.findOne(query);
            console.log(user);
            let owner = false;
            if (user) {
                owner = user?.role === 'owner'
            }
            res.send({ owner });
        })

        //Login
        app.post('/login', async (req, res) => {
            let data = req.body;
            let email = data?.email;
            let pass = data?.password;
            let query = { email: email }
            let exist = await userCollection.findOne(query);
            if (exist) {
                if (exist?.password === pass) {
                    res.send(exist);
                }
                else {
                    res.send("Wrong Pass");

                }
            }
            else {
                res.send("Dont Exist");
            }
        })




        await client.db("Owner").command({ ping: 1 });
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