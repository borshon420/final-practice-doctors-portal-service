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

        app.get('/appointments', async(req, res)=>{
            const email = req.query.email;
            const date = new Date(req.query.date).toLocaleDateString();
            
            const query = {email: email, date: date};
            
            const cursor = appointmentsCollection.find(query);
            const appointments = await cursor.toArray();
            res.send(appointments)
        });

        // app.get('/appointments', async(req, res)=>{
        //     const email = req.query.email;
        //     console.log(email)
        //     const date = new Date(req.query.date).toLocaleDateString();
        //     console.log(date)
        //     const query = {email: email, date: date}
        //     const cursor = appointmentsCollection.find(query);
        //     const appointments = await cursor.toArray();
        //     console.log(appointments)
        //     res.json(appointments)
        // })

        app.post('/appointments', async(req, res)=> {
            const appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment);
            res.json(result)
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