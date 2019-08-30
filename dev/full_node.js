const sha256 = require('sha256');
const ripemd160 = require("ripemd160");
const uuid = require('uuid/v1');
const Merkle_Tool = require("merkle-tools");
const merkle = new Merkle_Tool();
const Base58 = require('bs58');
const _ = require("lodash");

const gensisBlock = require('./gensisBlock');
const DefaultSetting = require('./defaultSetting');
const KEY = require('./key');
const TRANSACTION = require('./transaction');
const Key = new KEY();
const Transaction = new TRANSACTION();
const CURRENT_VERSION = "1.0.0";

const currentUrl = process.argv[3];
const currentNode = process.argv[4];
//blockchain data structure: contain blockchain attributes and function
//blockchain constructor function
function Full_Node(){
   //legder array to store block data
   this.chain = [];
   //last block hash initilize with gensisBlock hash
   this.lastblock_hash = "000057a4bc9e14d972f4e6a0b6d0e1133410c24f50bb9fa12d6a42715fd7aa9e";
   //current node address
   this.currentUrl = currentUrl;
   // current block structure version
   this.version = CURRENT_VERSION;
   //record of node with in the network
   this.networkNodes = [];
   //the transactions that wait for validation
   this.pendingTransactions = [];
   //a list of Unspent transactions
   this.unspent_transactions = [];
   //get keypair for node to create transaction (the key pair needs to hide... later);
   this.keypair = DefaultSetting[currentNode];
   // create gensis block
   this.chain.push(gensisBlock);

   const first_coinbase = this.chain[0].transaction_list[0];
   const first_coinbase_hash = Transaction.getSingleTransactionHash(JSON.stringify(first_coinbase));
   this.unspent_transactions.push(this.generateUnspentRecord(0,first_coinbase,first_coinbase_hash));
}

//Transaction Merkle function
Full_Node.prototype.getMerkleRoot = function (transactions){
   merkle.addLeaves(transactions, true);
   merkle.makeTree();
   const merkleRoot = merkle.getMerkleRoot();
   return merkleRoot.toString('hex');
}

Full_Node.prototype.proofMerkleHash = function (trans_index, target_hash, Merkle_root) {
  const proof = merkle.getProof(trans_index);
  return merkle.validateProof(proof, target_hash, Merkle_root);
}

//new block create function
Full_Node.prototype.createNewBlock = async function(){
  // varify all pending transactions
  const validated_transactions = [];
  let total_transc_fee = 0;

  for(let i = 0; i < this.pendingTransactions.length; i++){
    const pend_trans = this.pendingTransactions[i].transcation;
    validation = await Transaction.VerifyPendingTransaction(pend_trans, this.unspent_transactions);
    // console.log("create block",validation.transValidation);
    if(validation.transValidation) {validated_transactions.push(pend_trans); total_transc_fee += validation.transaction_fee;}
  }

  //create coinbase transaction
  const coinbase = await Transaction.CreateCoinBase(total_transc_fee, this.keypair.publicKey,this.chain.length);
  validated_transactions.unshift(coinbase);

  //get merkleRoot
  const Block_Transaction = validated_transactions.map(trans => JSON.stringify(trans));
  const merkleRoot = this.getMerkleRoot(Block_Transaction);

  //generate noce
  const timestamp = Date.now();
  const difficultly = this.getLastBlock().block_header.difficultly_target;
  const nonce =  this.proofOfWork(CURRENT_VERSION,this.lastblock_hash, merkleRoot, timestamp, difficultly);

  // integrate all neccessary information into block
  const newBlock = {
    // magic_number:"",
    // block_size:"",
    block_header:{
      version:CURRENT_VERSION,
      previous_block_hash:this.lastblock_hash,
      merkle_root:merkleRoot,
      timestamp: timestamp,
      difficultly_target:difficultly,
      nonce:nonce
    },
    // transaction_counter:this.validated_transacations.length,

    //Before the transaction structure is completed, the block will collect pendingTransactions instead
    // transaction_list: this.validated_transactions
    transaction_list:validated_transactions
  }

  return newBlock;
}

//get last block function
Full_Node.prototype.getLastBlock = function(){
  //my orignal version
  const lastblock = this.chain[this.chain.length-1];
  return lastblock;
}

Full_Node.prototype.hashBlock = function (version, previousBlockHash, HashMerkleRoot, timestamp, difficultly_target, nonce) {
  const DataString = version + previousBlockHash + HashMerkleRoot + timestamp.toString() + difficultly_target.toString() + nonce.toString();
  const BlockHash = sha256.x2(DataString);
  return BlockHash;
}

Full_Node.prototype.proofOfWork = function (version, previousBlockHash, HashMerkleRoot, timestamp, difficultly_target) {
  let nonce = 0;
  let hash = this.hashBlock(version, previousBlockHash, HashMerkleRoot, timestamp, difficultly_target, nonce);
  while(hash.substring(0, parseInt(difficultly_target)) !== this.difficultlyStringGenerator(difficultly_target)){
    nonce++;
    hash = this.hashBlock(version, previousBlockHash, HashMerkleRoot, timestamp, difficultly_target, nonce);
  }
  return nonce;
}

Full_Node.prototype.verifyBlock = async function (Block, pre_block_hash) {
  let validBlock = false;
  let trans_fee = 0;
  const {version,merkle_root,timestamp,difficultly_target,nonce} = Block.block_header;
  //verify the block header
  const newBlock_hash = this.hashBlock(version, pre_block_hash, merkle_root, timestamp, difficultly_target, nonce);
  const correctNonce = newBlock_hash.substring(0,parseInt(difficultly_target)) === this.difficultlyStringGenerator(difficultly_target);

  //verify block regular transaction
  let validTransaction = true;
  for(let i = 1; i<Block.transaction_list.length; i++){
    const trans  = Block.transaction_list[i];
    validation = await Transaction.VerifyPendingTransaction(trans,this.unspent_transactions);
    if(!validation.transValidation) {validTransaction = false; console.log(validation);break;}
    trans_fee += validation.transaction_fee;
  }
  // verify block coin base transction
  console.log(Block);
  const validCoinbase = await Transaction.verifyCoinbase(Block.transaction_list[0],trans_fee,12.5);

  console.log(correctNonce + " 1 " + validTransaction + " 2 "+validCoinbase);
  if(correctNonce && validTransaction && validCoinbase) validBlock = true;
  return {validBlock:validBlock, BlockHash:newBlock_hash};
}

Full_Node.prototype.ValidateChain = function (blockchain) {
  let validChain = true;

  //gensis block validation
  const gensisBlock = blockchain[0];
  const correctNonce = gensisBlock.block_header.nonce === 3507;
  const correctPreHash = gensisBlock.block_header.previous_block_hash === "0";
  const correctTransaction = gensisBlock.transaction_list.length === 1;
  if(!correctNonce || !correctPreHash || !correctTransaction){
    console.log("gensis block is not match");
    console.log({correctNonce,correctPreHash,correctTransaction});
     validChain = false;
  }

  let block_validation = this.verifyBlock(gensisBlock, "0");
  validChain = block_validation.validBlock;
  // console.log("gensisBlock validation", block_validation);
  //verify rest of the block within the chain
  let blockIndex = 1;
  let previousBlockHash = block_validation.BlockHash;
  while(validChain && blockIndex < blockchain.length){
      const currentBlock = blockchain[blockIndex];
      block_validation = this.verifyBlock(currentBlock,previousBlockHash);
      // console.log(`Block ${blockIndex}validation`, block_validation);
      previousBlockHash = block_validation.BlockHash;
      validChain = block_validation.validBlock;
      blockIndex++;
  }
  const validation = {
    validChain: validChain,
    lastHash: previousBlockHash
  }
  return validation;
}

Full_Node.prototype.difficultlyStringGenerator = function(difficultly_target){
  const difficultly = parseInt(difficultly_target);
  let difficultly_string ="";
  for(let i = 0; i<difficultly; i++){
    difficultly_string = difficultly_string + "0"
  }
  return difficultly_string;
}

Full_Node.prototype.createNewTransaction = function (amount,sender,receiver){
  //transaction structure (it would consider as pending transaction)
  //transaction structure need to be modified to suit the real situation
  const newTransaction = {
    amount:amount,
    sender:sender,
    receiver:receiver,
    transactionID: uuid().split('-').join('')
  }

  return newTransaction;
}

Full_Node.prototype.getInputList = async function (total_amount, owner_Pubkey,owner_PrivKey) {
  const input_list = [];
  let collected_value = 0;
  let index = 0;
  const keyBuffer = Buffer.from(owner_Pubkey,"hex");
  const key_hash160 = new ripemd160().update(Buffer.from(sha256(keyBuffer),"hex")).digest('hex');
  console.log(key_hash160);
  while(collected_value < total_amount && index < this.unspent_transactions.length){
    const CurrentTrans = this.unspent_transactions[index];
    if(key_hash160 === CurrentTrans.pubkey_hash160){
      console.log("find unspent trans");
      const Signature = await Key.getSignatrue(owner_PrivKey,CurrentTrans.transaction_hash);
      const input = {
        tx:CurrentTrans.transaction_hash,
        index:CurrentTrans.UTXO,
        scriptSig: Signature + " " + owner_Pubkey ,
        value:CurrentTrans.output_value
      }
      input_list.push(input);
      collected_value += CurrentTrans.output_value;
    }
    index++;
  }
  return input_list;
}

Full_Node.prototype.collectUnspentTransaction = function (block) {
  const transactions = block.transaction_list;
  transactions.forEach(trans=>{
    const trans_hash = Transaction.getSingleTransactionHash(JSON.stringify(trans));
    for(let i=0; i<trans.outputs.length; i++){
      this.unspent_transactions.push(this.generateUnspentRecord(i,trans,trans_hash));
    }
  })
}

Full_Node.prototype.generateUnspentRecord = function(index, trans, trans_hash){
  //later on  store in database with more information for identify the transaction
  const scriptPubKey = trans.outputs[parseInt(index)].scriptPubKey;
  const script_items = scriptPubKey.split(" ");
  let pubkey_hash160 = "";
  let items_index = 0;
  while(items_index<script_items.length){
    if(!script_items[items_index].includes("OP_")){
      pubkey_hash160 = script_items[items_index];
    }
    items_index++;
  }
  const unspent_record = {
    UTXO:index,
    transaction_hash: trans_hash,
    output_value: trans.outputs[parseInt(index)].value,
    pubkey_hash160: pubkey_hash160,
    transaction: trans,
  }
  return unspent_record;
}

Full_Node.prototype.removeUnspentRecord = function (block) {
  console.log(block);
  const transactions = block.transaction_list;
  const inputs = [];

  //gather all validated transaction_hash from newest receive block
  transactions.forEach(trans=>{
    for(let i=0; i<trans.inputs.length; i++){
      inputs.push(trans.inputs[i].tx);
    }
  })

  //remove the spent transaction from unspent_transaction array
  for(let i = 0; i<inputs.length; i++){
    const input_hash = inputs[i];
    for(let j = 0; j < this.unspent_transactions.length; j++){
       if(input_hash == this.unspent_transactions[j].transaction_hash){
          this.unspent_transactions.splice(j,1);
       }
    }
  }
}

Full_Node.prototype.addPendingTransaction = function (newTransaction){
  const trans_hash = sha256(JSON.stringify(newTransaction));
  const newTrans = {
    trans_hash:trans_hash,
    transcation:newTransaction
  }
  this.pendingTransactions.push(newTrans);
}

Full_Node.prototype.getBalanceByAddress = function(address){
  //decode the address into hash160 value and remove the version and checksum
  const decode_addres = Base58.decode(address).toString('hex');
  const hash160_recipient = decode_addres.substr(2).slice(0, -8);
  const unspent_trans = [];
  let balance = 0;
  for(let i = 0; i < this.unspent_transactions.length; i++){
    if(hash160_recipient === this.unspent_transactions[i].pubkey_hash160){
       balance += this.unspent_transactions[i].output_value
       unspent_trans.push(this.unspent_transactions[i]);
    }
  }
  const address_info = {
    address: address,
    balance: balance,
    unspent_trans:unspent_trans
  }
  return address_info;
}

Full_Node.prototype.CheckTransactionStatus = function(trans_hash, callback){
  //search pending transaction array
  let trans_index  = _.findIndex(this.pendingTransactions,{trans_hash});
  if(trans_index === -1){
    trans_index = _.findIndex(this.unspent_transactions,{transaction_hash:trans_hash});
    if(trans_index === -1){
      callback({err:"transastion is already spent or reject"},null);
    }else{
      callback(null,{
        status:"Unspent",
        transaction:this.unspent_transactions[trans_index]
      })
    }
  }else{
    callback(null,{
      status:"Pending",
      transaction:this.pendingTransactions[trans_index]
    })
  }
}

module.exports = Full_Node;
