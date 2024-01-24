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
        'https://lucent-marshmallow-c00b6c.netlify.app'
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
        const bookingCollection = client.db("House-Hunter-DB").collection('Bookings');


        // -------------------------------------AUTH---------------------------------------------
        app.post('/jwt', async (req, res) => {
            let user = req.body;
            let token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token });
        })


        /*Logout APi */
        app.post('/logout', async (req, res) => {
            let user = req.body;
            res.clearCookie('token', { maxAge: 0, sameSite: 'none', secure: true }).send({ success: true })
        })

        //Registration
        app.post('/user', async (req, res) => {
            let data = req.body;
            let email = data?.email;
            let query = { email: email };
            let exist = await userCollection.findOne(query);
            if (exist) {
                res.send('User already exist');
                return;
            }
            let result = await userCollection.insertOne(data)
            res.send(result);
        });

        // ===============================Check Admin👇===================================
        app.get('/users/owner/:email', async (req, res) => {
            let userEmail = req.params.email;
            let query = { email: userEmail };
            let user = await userCollection.findOne(query);
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
                } else {
                    res.send("Wrong Pass");
                }
            } else {
                res.send("Dont Exist");
            }
        })

        //All House Load
        app.get('/houses', async (req, res) => {
            result = await houseCollection.find().toArray();
            res.send(result);
        });

        //add new House
        app.post('/addnew-house', async (req, res) => {
            let newHouse = req.body;
            let result = await houseCollection.insertOne(newHouse)
            res.send(result);
        });

        app.get('/manage-house/:email', async (req, res) => {
            let userEmail = req.params.email;
            console.log(userEmail);
            let query = { email: userEmail };
            let result = await houseCollection.find(query).toArray();
            res.send(result);
        });

        //Load update House
        app.get('/update/:id', async (req, res) => {
            let id = req.params.id;
            let query = { _id: new ObjectId(id) };
            let result = await houseCollection.findOne(query);
            res.send(result);
        });
        app.patch('/update-house/:id', async (req, res) => {
            let newHouse = req.body;
            let id = req.params.id;
            const options = { upsert: true };
            let query = { _id: new ObjectId(id) };
            let updatedDoc = {
                $set: {
                    phone: newHouse?.phone,
                    city: newHouse?.city,
                    bedrooms: newHouse?.bedrooms,
                    bathrooms: newHouse?.bathrooms,
                    availability: newHouse?.availability,
                    rentPerMonth: newHouse?.rentPerMonth,
                    description: newHouse?.description,
                    roomSize: newHouse?.roomSize,
                }
            }
            console.log(updatedDoc);
            let result = await houseCollection.updateOne(query, updatedDoc, options);
            res.send(result);
        })

        //Delete House
        app.delete('/delete-manage/:id', async (req, res) => {
            let id = req.params.id;
            let query = { _id: new ObjectId(id) };
            let result = await houseCollection.deleteOne(query);
            res.send(result);
        })

        //View Details
        app.get('/houses/:id', async (req, res) => {
            let id = req.params.id;
            let query = { _id: new ObjectId(id) };
            let result = await houseCollection.findOne(query);
            res.send(result);
        });

        //Booking 
        app.post('/booking', async (req, res) => {
            let booking = req.body;
            let result = await bookingCollection.insertOne(booking)
            res.send(result);
        });

        app.get('/manage-booking/:email', async (req, res) => {
            let userEmail = req.params.email;
            let query = { renterEmail: userEmail };
            let result = await bookingCollection.find(query).toArray();
            res.send(result);
        });

        app.delete('/delete-booking/:id', async (req, res) => {
            let id = req.params.id;
            let query = { _id: new ObjectId(id) };
            let result = await bookingCollection.deleteOne(query);
            res.send(result);
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