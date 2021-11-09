const express = require('express')
const app = express();
const cors = require('cors')
const { MongoClient } = require('mongodb');
require('dotenv').config();
const port = 5000

//MIDDLEWARE
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.69jfu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db('final_doctor');
        const appointmentsCollection = database.collection('appointments');
        const usersCollection = database.collection('users');

        app.get('/appointments', async(req, res)=>{
            const email = req.query.email;
            const date = new Date(req.query.date).toLocaleDateString();
            
            const query = {email: email, date: date};
            
            const cursor = appointmentsCollection.find(query);
            const appointments = await cursor.toArray();
            res.send(appointments);
        });

        app.post('/appointments', async(req, res)=> {
            const appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment);
            res.json(result)
        });

       app.get('/users/:email', async(req, res)=>{
         const email = req.params.email;
         const query = {email: email};
         const user = await usersCollection.findOne(query);
         let isAdmin = false;
         if(user?.role === 'admin'){
          isAdmin = true;
         }
         res.json({admin: isAdmin})
       })

        app.post('/users', async(req, res)=> {
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          console.log(result)
          res.json(result);
        });

        app.put('/users', async(req, res)=>{
          const user = req.body;
          const filter = {email: user.email};
          const options = { upsert: true };
          const updateDoc = {$set: user};
          const result = await usersCollection.updateOne(filter, updateDoc, options);
          res.json(result)
        });

        app.put('/users/admin', async(req, res)=>{
          const user = req.body;
          const filter = {email: user.email};
          const updateDoc = {$set: {role: 'admin'}};
          const result = await usersCollection.updateOne(filter, updateDoc);
          console.log(result)
          res.json(result);
        })
    }
    finally{

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('Final Doctor portal')
})

app.listen(port, () => {
  console.log(`listening at ${port}`)
})