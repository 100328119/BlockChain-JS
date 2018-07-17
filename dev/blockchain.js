//blockchain data structure: contain blockchain attributes and function
//blockchain constructor function
function Blockchain(){
   //legder array to store block data
   this.chain = [];
   //new transaction data
   this.newtransactions = [];
}

//new block create function
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash){
  const newBlock = {
    //block height
    index:this.chain.length + 1,
    //transaction time stamp
    timestamp: Date.now(),
    //transaction data
    transactions: this.newTransactions,
    // random number to control difficult of POW
    nonce: nonce,
    //hash value of current block
    hash:hash,
    // previous block hash to identify what second last block
    previousBlockHash: previousBlockHash
  };
  this.newTransactions = [];
  // add new block into the chain
  this.chain.push(newBlock);

  return newBlock;
}

//get last block function
Blockchain.prototype.getLastBlock = function(){
  //my orignal version
  const lastblock = this.chain[this.chain.length-1];
  return lastblock;
}

//Create new transaction function: new transaction should be included in the block
Blockchain.prototype.createNewTransaction(amount, sender, receiver){
  const Newtransaction = {
    index: this.newTransactions.length,
    timestamp: Date.now(),
    amount: amount,
    sender: sender,
    receiver: receiver
  };
  this.newTransactions.push(Newtransaction);

  return thise.getLastBlock()['index']+1;
}
module.exports = Blockchain;
