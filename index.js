const express = require('express'); //Import the express dependency
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 5000;                  //Save the port number where your server will be listening

//Idiomatic expression in express to route and respond to a client request
app.get('/', async (req, res) => {        //get requests to the root ("/") will route here
  let request = req.query;
  try {
    const payload = {
      "tx_ref": request["tx_ref"],
      "amount": request["amount"],
      "currency": request["currency"],
      "country": request["country"],
      "email": request["email"],
      "phone_number": request["number"],
      "fullname": request["fullname"],
    }
    const response = await flw.MobileMoney.franco_phone(payload)
    console.log(response);
    res.send(response)
  } catch (error) {
    res.send({
      status : "error",
      error : error
    })
  }

  //res.sendFile('index.html', { root: __dirname }); console.log(req.query)      //server responds by sending the index.html file to the client's browser
  //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
});

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
  console.log(`Now listening on port ${port}`);
});