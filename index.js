const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// MONGO DB Connections

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.j0zjic3.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    //Get Data from mongodb

    const db = client.db("rydex_db");
    const vehiclesCollection = db.collection("vehicles");
    const bookingsCollection = db.collection("bookings");

    app.get("/vehicles", async (req, res) => {
      const result = await vehiclesCollection.find().toArray(); //promise
      res.send(result);
    });
    // Get Data from the frontend
    app.post("/vehicles", async (req, res) => {
      const data = req.body;
      const result = await vehiclesCollection.insertOne(data);
      // Send to mongoDB
      res.send({
        success: true,
        result,
      });
    });

    // Data Dynamic by :id
    app.get("/vehicles/:id", async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);

      const result = await vehiclesCollection.findOne({ _id: objectId });

      res.send({
        success: true,
        result,
      });
    });

    // My Vechicle Page API by Email address

    app.get("/my-vehicles", async (req, res) => {
      const email = req.query.email;
      const result = await vehiclesCollection
        .find({ created_by: email })
        .toArray();
      res.send(result);
    });

    // Booked Card data stored in db

    app.post("/my-bookings", async (req, res) => {
      const data = req.body;
      const result = await bookingsCollection.insertOne(data);
      res.send(result);
    });

    // Booked Api
    app.get("/my-bookings", async (req, res) => {
      const email = req.query.email;
      const result = await bookingsCollection
        .find({ booked_by: email })
        .toArray();
      res.send(result);
    });


// Search Filter


    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    await client;
  }
}
run().catch(console.dir);

// MonogDB End

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
