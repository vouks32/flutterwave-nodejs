const express = require('express'); //Import the express dependency
var cors = require('cors');
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave("FLWPUBK-3bec00ca4193d7168e8998302ba96f9d-X", "FLWSECK-2e9b5cbf550cfc9a1b964c8ea62446e5-18dd0390594vt-X");
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 5000;                  //Save the port number where your server will be listening

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    return callback(null, true);
  }
}));

//Idiomatic expression in express to route and respond to a client request
app.get('/api/collect', async (req, res) => {        //get requests to the root ("/") will route here
  let request = req.query;
  if (!request.tx_ref || !request.amount || !request.currency || !request.country || !request.number || !request.fullname || !request.email) {
    res.send({ status: "error", error: "data incomplete", data : request })

    console.log({ status: "error", error: "data incomplete", data : request });
    return
  }

  try {
    const payload = {
      "tx_ref": request["tx_ref"],
      "amount": 50, //request["amount"],
      "currency": request["currency"],
      "country": request["country"],
      "email": request["email"],
      "phone_number": request["number"],
      "fullname": request["fullname"],
    }
    let response = {};
    response.payload = payload;
    res.send(response)
  } catch (error) {
    res.send({
      status: "error",
      error: error
    })
  }
});

app.get('/api/check', async (req, res) => {        //get requests to the root ("/") will route here
  let request = req.query;
  if (!request["tx_ref"]) {
    res.send({ status: "error", error: "data incomplete" })
    console.log({ status: "error", error: "data incomplete" });
    return
  }

  try {
    const payload = { "id": request["tx_ref"] }
    let response = {};
    //    const response = await flw.Transaction.verify(payload)
    response.payload = payload;
    response.status = "success";
    res.send(response)
  } catch (error) {
    console.log(error)
  }
});



app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
  console.log(`Now listening on port ${port}`);
});