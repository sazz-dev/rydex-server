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
    // await client.connect();

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

    // Latst 6 Data for homepage

    app.get("/latest-vehicles", async (req, res) => {
      const result = await vehiclesCollection
        .find()
        .sort({ created_at: "desc" })
        .limit(6)
        .toArray();
      res.send(result);
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

    // Update/Edit Vehicle Data
    app.put("/vehicles/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      const objectId = new ObjectId(id);

      const filter = { _id: objectId };
      const update = {
        $set: data,
      };

      const result = await vehiclesCollection.updateOne(filter, update);

      res.send({
        success: true,
        result,
      });
    });

    // Delete the Vehilce data

    app.delete("/vehicles/:id", async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);
      const filter = { _id: objectId };

      const result = await vehiclesCollection.deleteOne(filter);
      res.send({
        success: true,
        result,
      });
    });

    // Search Filter
    app.get("/search", async (req, res) => {
      const searchText = req.query.search;
      const result = await vehiclesCollection
        .find({ name: { $regex: searchText, $options: "i" } })
        .toArray();
      res.send(result);
    });

    // All vehicle page sorts

    app.get("/category", async (req, res) => {
      const category = req.query.category;
      let query = {};
      if (category) {
        query.categories = category;
      }
      const result = await vehiclesCollection.find(query).toArray();
      res.send(result);
    });

    // Sort by Price
    app.get("/sort", async (req, res) => {
      const sort = req.query.sort;

      let sortOption = {};

      // Determine sort direction
      if (sort === "price_low") {
        sortOption = { price: 1 }; // ascending
      } else if (sort === "price_high") {
        sortOption = { price: -1 }; // descending
      }

      const result = await vehiclesCollection
        .find({})
        .sort(sortOption)
        .toArray();

      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
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
