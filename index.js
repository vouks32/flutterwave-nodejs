const express = require('express'); //Import the express dependency
var cors = require('cors');
const Flutterwave = require('flutterwave-node-v3');
const Mailjet = require('node-mailjet');
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 5000;                  //Save the port number where your server will be listening

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    return callback(null, true);
  }
}));


//get requests to the root ("/") will route here
//Idiomatic expression in express to route and respond to a client request
app.get('/api/collect', async (req, res) => {
  let request = req.query;
  if (!request.tx_ref || !request.pub_key || !request.sec_key || !request.amount || !request.currency || !request.country || !request.number || !request.fullname || !request.email) {
    res.send({ status: "error", error: "data incomplete", data: request })

    console.log({ status: "error", error: "data incomplete", data: request });
    return
  }

  const flw = new Flutterwave(request.pub_key, request.sec_key);

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
    let response = {};
    response = await flw.MobileMoney.franco_phone(payload)
    response.payload = payload;
    res.send(response)
  } catch (error) {
    res.send({
      status: "error",
      error: error
    })
  }
});

/////// //get requests to the root ("/") will route here
app.get('/api/check', async (req, res) => {
  let request = req.query;
  if (!request["tx_ref"] || !request.pub_key || !request.sec_key) {
    res.send({ status: "error", error: "data incomplete" })
    console.log({ status: "error", error: "data incomplete" });
    return
  }

  const flw = new Flutterwave(request.pub_key, request.sec_key);
  const payload = { "id": request["tx_ref"] }

  try {
    let response = {};
    response = await flw.Transaction.verify(payload)
    response.payload = payload;
    // response.status = "success";
    res.send(response)
  } catch (error) {
    res.send({
      status: "errortry",
      error: error,
      payload: payload
    })
  }
});


//get requests to the root ("/") will route here
app.get('/api/send', async (req, res) => {
  let request = req.query;
  if (!request.tx_ref || !request.pub_key || !request.sec_key || !request.amount || !request.currency || !request.country || !request.network || !request.number || !request.fullname) {
    res.send({ status: "error", error: "data incomplete" })
    console.log({ status: "error", error: "data incomplete" });
    return
  }

  try {
    let payload = (request.country == 'SN') ? {
      //Transfer to a Senegal mobile money number
      //Supported Country: Senegal
      "account_bank": request.network, //you can also pass EMONEY or FREEMONEY
      "account_number": request.number,
      "beneficiary_name": request.fullname,
      "amount": request.amount,
      "narration": "retrait de Shaku Minning Investment",
      "currency": "XOF",
      "reference": request.tx_ref,
      "debit_currency": "XOF"
    } : {
      //Transfer to a XAF/XOF mobile money number excluding Senegalese mobile numbers
      //Supported Countries: Cote D'Ivoire, Mali, Cameroon
      "account_bank": "FMM",
      "account_number": request.number,
      "amount": request.amount,
      "narration": "retrait de Shaku Minning Investment",
      "currency": request.currency,
      "reference": request.tx_ref,
      "beneficiary_name": request.fullname
    };

    let response = {};
    response = await flw.Transfer.initiate(payload)
    response.payload = payload;
    // response.status = "success";
    res.send(response)
  } catch (error) {
    res.send({
      status: "error",
      error: error
    })
  }
});


//SEND MAIL
app.get('/api/mail/send', async (req, res) => {
  let request = req.query;
  if (!request.messages || !request.key || !request.sec_key) {
    res.send({ status: "error", error: "data incomplete", data: request })

    console.log({ status: "error", error: "data incomplete", data: request });
    return
  }
  try {
    const mailjet = Mailjet.apiConnect(
      request.key,
      request.sec_key
    );
    const requestmailjet = mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: request.messages
      })

    requestmailjet.then((result) => {
      result.body.payload = request.messages;
      res.send(result.body)
    }).catch((err) => {
      res.send({
        status: "error",
        error: err
      })
    })
  } catch (error) {
    res.send({
      status: "error",
      error: error
    })
  }
});



app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
  console.log(`Now listening on port ${port}`);
});

/*[
        {
          From: {
            Email: "pilot@mailjet.com",
            Name: "Mailjet Pilot"
          },
          To: [
            {
              Email: "passenger1@mailjet.com",
              Name: "passenger 1"
            }
          ],
          Subject: "Your email flight plan!",
          TextPart: "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
          HTMLPart: "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />May the delivery force be with you!"
        }
      ]
  */