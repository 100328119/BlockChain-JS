# BlockChain-JS
Create Block Chain in Javascript
To understand block chain in deep

How to run the project on your end?

basic start
1. npm install all dependency
2. open couple of terminal window
3. enter "npm run node_1","npm run node_2" ,"npm run node_3"  in different terminal (you will start 3  independent full node instances, each instance use one specific port node_1: 3001, port node_2: 3002, port node_3: 3003)
4. you need to use postman or some other similar apps to play around those nodes
5. send a  "localhost:3001/api/node_info/" GET request in postman window, you should node_1 information if code is running properly

building network

you can any nodes to construct the network, in this case I use node_1 as example
1. in postman, enter url "localhost:3001/api/register-and-broadcast-node"
2. select "post" as http request
3. in the postman body, select raw and json format
4. enter data
     {"newNodeUrl":"http://localhost:3002"}
5. click send, you should see follow massage if request success
 {
    "message": "new node has add into the network successfully"
  }
6. text whether network is established
    send another "localhost:3001/api/node_info/"  GET request, in the "networkNodes" field you should see "http://localhost:3002"
    send "localhost:3001/api/node_info/" GET request, in the "networkNodes" field you should see "http://localhost:3001"
    if you can see above info that means network is established, and you can do the same for entering node_3 into network

Send Transaction/mine block

by default, each node already has a encryption keypair and address. you can find those information from /api/node_info/ api.
also, node_1 has owns the gensis coinbase which means node_1 has 12.5 BlockChain-JS coins to spend.

1.  send "http://localhost:3001/api/transaction/broadcast" post request in postman with following json data
{
	"amount":5,
	"transaction_fee":0.5,
	"recipient_address":"1CwTj68sa3MMXCnXmb9Ly2eETDgEkFP5EP"
}
1CwTj68sa3MMXCnXmb9Ly2eETDgEkFP5EP is the address of node_2
2. you should see the follow message if request is successfully sent,
{
    "message": "transaction is collected and boardcasted"
}
3. enter localhost:3001/api/mine/ GET request to mine this transaction. you should see following message if successed
{
    "message": "block has been confirmed"
}
4. send "localhost:3001/api/node_info/" GET request, you should a new block is mined and the new transaction is included
5. send "localhost:3001/api/balance_check/1CwTj68sa3MMXCnXmb9Ly2eETDgEkFP5EP" GET request, you will see the balance of this address and usable transaction.



#API specification
At the moment, I only specific the api for user to interact with nodes, not the api that used to communicate between nodes  
1. "api/node_info" get request: to get specific full node's data
2. "api/blockchain" get request: to get only blockchain json data
3. "api/transaction/broadcast" post request: to issue a transaction and boardcasted to the network. required field:
{
  "amount":,
  "transaction_fee":,
  "recipient_address":
}
4. "api/transaction/issue" post request: to issue a transaction and boardcasted to the network with you specific keypair. required field:
{
	"amount":,
	"transaction_fee":,
	"recipient_address":,
	"publicKey": ,
	"privateKey":
}
5. "api/transaction/status/:trans_hash" get request: to check status of certain transaction, you need to specific transcation hash.
6. "api/mine" get request: to mine a block
7. 'api/register-and-broadcast-node' post rquest: to add a node to the network. require field:
{
	"newNodeUrl":
}
8. "api/balance_check/:address" get request: to get balance of specific address
9. "api/create_Address" get request: to get a pair of public/private keys and correspond address.
