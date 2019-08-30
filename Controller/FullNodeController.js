const uuid = require('uuid/v1');
const rp = require('request-promise');

const FullNode = require('../NodeIni');
const TRANSACTION = require('../dev/transaction');
const Transaction = new TRANSACTION();
const KEY = require('../dev/key');
const Key = new KEY();
const nodeAddress = uuid().split('-').join('');
const Block_Version = "1.0.0";

module.exports.Node_info = (req, res, nex)=>{
  res.status(200).json(FullNode);
}

module.exports.getCompleteChain = (req, res, nex)=>{
  res.status(200).json(FullNode.chain);
}

module.exports.CreateTransaction = async (req, res, nex)=>{
  const {newTransaction} = req.body;
  FullNode.addPendingTransaction(newTransaction);
  return res.status(200).json({message:" transaction has been collect into pending transaction list"});
}

module.exports.BroadcastTransaction = async (req, res, nex)=>{
  const {amount, transaction_fee, recipient_address} = req.body;
  const total_amount = amount + transaction_fee;
  // console.log(FullNode.keypair.publicKey + " " + FullNode.keypair.privateKey);
  const input_list = await FullNode.getInputList(total_amount, FullNode.keypair.publicKey, FullNode.keypair.privateKey);
  Transaction.CreateRegTransaction(input_list,amount, transaction_fee,recipient_address,FullNode.keypair.publicKey,"00000")
    .then(newTransaction=>{
      const boardcastTransactionPromise = [];
      FullNode.addPendingTransaction(newTransaction);
      FullNode.networkNodes.forEach(networkNode=>{
        const requestOption = {
          uri: networkNode + '/api/transaction',
          method: "POST",
          body: {newTransaction: newTransaction},
          json: true
        };

        boardcastTransactionPromise.push(rp(requestOption));
      })

      Promise.all(boardcastTransactionPromise)
        .then(data=>{
          res.status(200).json({ message: "transaction is collected and boardcasted"});
        })
    }).catch(err=>{
      res.status(400).json({err});
    })
}

module.exports.IssueTransaction = async (req, res, nex)=>{
  const {amount, transaction_fee, recipient_address, publicKey, privateKey} = req.body;
  const total_amount = amount + transaction_fee;
  const input_list = await FullNode.getInputList(total_amount,publicKey.toString("hex"),privateKey.toString("hex"));
  Transaction.CreateRegTransaction(input_list,amount, transaction_fee,recipient_address,publicKey,"00000")
    .then(newTransaction=>{
      const boardcastTransactionPromise = [];
      FullNode.addPendingTransaction(newTransaction);
      FullNode.networkNodes.forEach(networkNode=>{
        const requestOption = {
          uri: networkNode + '/api/transaction',
          method: "POST",
          body: {newTransaction: newTransaction},
          json: true
        };

        boardcastTransactionPromise.push(rp(requestOption));
      })

      Promise.all(boardcastTransactionPromise)
        .then(data=>{
          res.status(200).json({ message: "transaction is collected and boardcasted"});
        })
    }).catch(err=>{
      res.status(400).json({err});
    })
}

module.exports.TransactionStatus = (req, res, nex)=>{
  const {trans_hash} = req.params;
  FullNode.CheckTransactionStatus(trans_hash,(err, data)=>{
    err ? res.status(400).json(err) : res.status(200).json(data);
  });
}

module.exports.mineBlock =  async (req, res, nex)=>{
  const Add_Block =  await FullNode.createNewBlock();
  // console.log("mine",Add_Block);
  const blockPromise = [];
  FullNode.networkNodes.forEach(networkNode=>{
    const requestOption = {
      uri: networkNode + "/api/receive-new-block",
      method: "GET",
      body: { newBlock: Add_Block},
      json: true
    }

    blockPromise.push(rp(requestOption))
  })

  Promise.all(blockPromise)
    .then(data=>{
      FullNode.chain.push(Add_Block);
      // console.log(Add_Block);
      const {version,previous_block_hash,merkle_root,timestamp,difficultly_target,nonce} = Add_Block.block_header;
      FullNode.lastblock_hash = FullNode.hashBlock(version,previous_block_hash,merkle_root,timestamp,difficultly_target,nonce);
      FullNode.pendingTransactions = [];
      FullNode.removeUnspentRecord(Add_Block);
      FullNode.collectUnspentTransaction(Add_Block);
    })
    .then(data =>{
      res.status(200).json({message: "block has been confirmed"})
    })
    .catch(err=>{
      console.log(err);
      res.status(400).json({message: "block has not be confirmed"})
    })
}

//nodemon command update 1234dsada`2212
module.exports.receive_new_block = async (req, res, nex) =>{
  const { newBlock } = req.body;
  const validation = await FullNode.verifyBlock(newBlock,FullNode.lastblock_hash);
  if(validation.validBlock){
      FullNode.chain.push(newBlock);
      FullNode.lastblock_hash = validation.BlockHash;
      // FullNode.removePendingtransaction(newBlock);
      FullNode.pendingTransactions = [];
      FullNode.removeUnspentRecord(newBlock);
      FullNode.collectUnspentTransaction(newBlock);
     res.status(200).json({
       message: " new block is accepted"
     })
  }else{
    res.status(400).json({
      message: " new Block is rejected"
    })
  }
}

module.exports.register_broadcast_node = (req, res, nex)=>{
  const { newNodeUrl } = req.body;
  if(FullNode.networkNodes.indexOf(newNodeUrl)== -1 && newNodeUrl !== FullNode.currentUrl) FullNode.networkNodes.push(newNodeUrl);

  const registerNodesPromises = [];
  FullNode.networkNodes.forEach(networkNodeUrl=>{
    const requestOption = {
      uri: networkNodeUrl + '/api/register-node',
      method: 'POST',
      body: { newNodeUrl:newNodeUrl },
      json: true
    }
    registerNodesPromises.push(rp(requestOption));
  });

  Promise.all(registerNodesPromises)
    .then(data=>{
      const BulkRegisterOption = {
        uri: newNodeUrl + '/api/register-nodes-bulk',
        method: 'POST',
        body: {networkNodes: [...FullNode.networkNodes, FullNode.currentUrl]},
        json: true
      };
      console.log([...FullNode.networkNodes, FullNode.currentUrl])
      return rp(BulkRegisterOption);
    })
    .then(data=>{
      res.status(200).json({message:"new node has add into the network successfully"});
    })
    .catch(err=>{
      console.log(err);
      res.sendStatus(400);
    })
}

module.exports.register_node = (req, res, nex)=>{
  const { newNodeUrl } = req.body;
  if(FullNode.networkNodes.indexOf(newNodeUrl)== -1 && FullNode.currentUrl !== newNodeUrl){
    FullNode.networkNodes.push(newNodeUrl);
  }
  res.status(200).json({message:"new node register successfully"});

}

module.exports.register_nodes_bulk = (req, res, nex)=>{
   const { networkNodes } = req.body;
   networkNodes.forEach(networknode =>{
     if(FullNode.networkNodes.indexOf(networknode)== -1 && FullNode.currentUrl !== networknode){
       FullNode.networkNodes.push(networknode);
     }
   });
   res.status(200).json({message:"sync with all network nodes"})
}

module.exports.consensus = (req, res, nex) =>{
  const ChainPromise = [];
  FullNode.networkNodes.forEach(networkNode =>{
    const requestOption = {
      uri: networkNode + '/api/blockchain',
      method: "GET",
      json: true
    }
    ChainPromise.push(rp(requestOption));
  })
  let maxChainLength = FullNode.chain.length;
  let newLongestChain = null;
  let pendingTransactions = null;
  Promise.all(ChainPromise)
    .then(FullNodes =>{
      let validation = {validChain:false,lastHash:"0"};
      FullNodes.forEach(blockchain =>{
        if(blockchain.length > maxChainLength){
          maxChainLength = blockchain.length;
          validation = FullNode.ValidateChain(blockchain);
          if(validation.validChain){
            newLongestChain = blockchain;
          }
        }
      })
      if(newLongestChain === null){
        res.status(400).json({
          message: " Your Current Chain is longest chain in the network"
        })
      }else{
        FullNode.chain = newLongestChain;
        FullNode.lastblock_hash = validation.lastHash;
        res.status(200).json({
          message: " Your Current Chain has been replaced by longest chain and up-to-date"
        })
      }
    })
}

module.exports.getbalance = (req, res, nex) =>{
  // console.log(req.params.address);
  const address = req.params.address;
  const address_info = FullNode.getBalanceByAddress(address);
  if(address_info != null){
    res.status(200).json(address_info)
  }else{
    res.status(400).json({Msg_Error:"address was not recorded"})
  }
}

module.exports.createAddress = (req, res, nex)=>{
  const Keypair = Key.KeyPairGenerator();
  const Address = Key.getAddress(Keypair.publicKey);
  if(Keypair != null && Address != null){
    const new_address = {
      keypair: Keypair,
      Address: Address
    }
    res.status(200).json(new_address)
  }else{
    res.status(400).json({Msg_Error:"fail to create new address"})
  }
}

module.exports.VerifyPendingTransaction = async (req, res, nex)=>{
  let validation = true;
  for(let i = 0; i <FullNode.pendingTransactions.length; i++ ){
    const pend_trans = FullNode.pendingTransactions[i];
    validation = await Transaction.VerifyPendingTransaction(pend_trans, FullNode.unspent_transactions);
  }

  res.status(200).json({validation: validation});
}
