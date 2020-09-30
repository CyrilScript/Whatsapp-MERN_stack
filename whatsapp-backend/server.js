//importing, ES6 syntax
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';



//app config
const app = express();
const port = process.env.PORT || 9000

const pusher = new Pusher({
  appId: '1082408',
  key: 'b3e2fdc58f60c853f34f',
  secret: '07f9e356fdc3514f9b8b',
  cluster: 'eu',
  encrypted: true
});

//middleware
app.use(express.json());
app.use(cors());


//DB config
const connection_url = "mongodb+srv://admin:z9q32HwRP35JwPj@cluster0.l71su.mongodb.net/Whatsapp-clone?retryWrites=true&w=majority";
mongoose.connect(connection_url,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology:true
});

const db = mongoose.connection;

db.once("open", ()=>{
    console.log("DB connected");

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on('change',(change)=>{
        console.log('A change occured',change);

        if (change.operationType == 'insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages','inserted',
            {
                name:messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received,
            });
        };
    });
});


//api routes
app.get('/', (req,res)=> res.status(200).send("hello world"));

app.get('/messages/sync', (req,res)=>{
    Messages.find((err,data) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(200).send(data);
        };
    });
})

app.post('/messages/new', (req,res)=>{
    const dbMessages = req.body

    Messages.create(dbMessages,(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    });
});


//listener
app.listen(port, () => console.log(`Listening on localhost:${port}`));

//Glossary of abbreviations
//req => request
//res => response
//env => environment
//err => error
//data => data from database