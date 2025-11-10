const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const { MongoClient, ServerApiVersion } = require("mongodb");

app.use(
  cors({
    origin: ["http://localhost:5173/"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// MONGO DB Connections

const uri =
  "mongodb+srv://rydexDB:457812@cluster0.j0zjic3.mongodb.net/?appName=Cluster0";

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

    app.get("/vehicles", async (req, res) => {
      const result = await vehiclesCollection.find().toArray(); //promise
      res.send(result);
      console.log(result);
    });

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
