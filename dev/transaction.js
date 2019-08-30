const sha256 = require("sha256");
const ripemd160 = require("ripemd160");
const Base58 = require('bs58');
const _ = require("lodash");
const FullNode = require('../NodeIni');
const KEY = require('./key');
const Key = new KEY();
const CoinBaseInputHash = "00000";

const tempReferedtransaction = [];

class Transaction {
  constructor() {
      this.tempReferedtransaction = [];
   }

   CreateCoinBase(transaction_fee, miner_public, blockIndex ){
    return new Promise((resolve, reject)=>{
      try{
        const pubkey_buffer = Buffer.from(miner_public,"hex");
        const hash160 = new ripemd160().update(Buffer.from(sha256(pubkey_buffer),"hex")).digest('hex');
        const CoinBase = {
          input_count:0,
          inputs:[
            {
              tx:"0",
              index:-1,
              coinbase:blockIndex
            }
          ],
          output_count:1,
          outputs:[
            {
              value:12.5 + transaction_fee,
              scriptPubKey:`OP_DUP OP_HASH160 ${hash160} OP_EQUALVERIFY OP_CHECKSIG`
            }
          ],
          locktime:"0"
        };
        resolve(CoinBase);
      }catch(err){
        reject(err);
      }
    })
  }

  CreateRegTransaction(transaction_list, amount, transaction_fee, recipient_address, sender_public, locktime){

    return new Promise((resolve, reject)=>{
      let input_total = 0;
      transaction_list.forEach(trans =>{
        input_total += trans.value;
        delete trans.value;
      })
      if(input_total< amount + transaction_fee) reject("not enough money!!");
      const decode_addres = Base58.decode(recipient_address).toString('hex');
      const hash160_recipient = decode_addres.substr(2).slice(0, -8);
      const output_list = [{value:amount,scriptPubKey:`OP_DUP OP_HASH160 ${hash160_recipient} OP_EQUALVERIFY OP_CHECKSIG`}];

      const change = input_total - (amount + transaction_fee);
      if(change > 0){
        const keyBuffer_sender = Buffer.from(sender_public,"hex");
        const key_hash160 = new ripemd160().update(Buffer.from(sha256(keyBuffer_sender),"hex")).digest('hex');
        output_list.push({value:change,scriptPubKey:`OP_DUP OP_HASH160 ${key_hash160} OP_EQUALVERIFY OP_CHECKSIG`});
      }
      const GenTransaction = {
        input_count:transaction_list.length,
        inputs:transaction_list,
        output_count:output_list.length,
        outputs:output_list,
        locktime:locktime,
        timestamp:Date.now()
      };
      resolve(GenTransaction);
    })
  }

  verifyCoinbase(coinbase, trans_fee, base_incentive){
    let validCoinbase = false;
    console.log(coinbase)
    const coinbase_output = coinbase.outputs[0].value;
    const total_incentive = trans_fee + base_incentive;
    if(coinbase_output === total_incentive) validCoinbase = true;
    return validCoinbase;
  }

  async VerifyPendingTransaction(pending_transaction, unspent_list){
    let transValidation = true;
    let pending_input_total = 0;
    let pending_output_total = 0;
    let transaction_fee = 0;

    for(let i = 0; i <pending_transaction.inputs.length; i++){
      const input = pending_transaction.inputs[i];
      //1.check double spending
      if(_.indexOf(this.tempReferedtransaction,input.tx) != -1) {
        transValidation = false;
        console.log("double spending");
        break;
      };
      this.tempReferedtransaction.push(input.tx);
      //2.check whether refered output exist in unspent list
      const transIndex =  _.findIndex(unspent_list,{transaction_hash:input.tx});
      if(transIndex === -1) {
        transValidation = false;
        console.log("not exist in unspent trans")
        break;
      };
      //3.check whether input script can unlock output
      //if unlock get total value
      const refered_trans = unspent_list[transIndex];
      for(let j = 0; j < refered_trans.transaction.outputs.length; j++){
        const output = refered_trans.transaction.outputs[j];
        const UnlockOutput = await this.UnlockOutput(input, output, input.tx);
        console.log(UnlockOutput);
        if(UnlockOutput.unlock) pending_input_total += UnlockOutput.value;
      }
    }
    //get pending transaction output total
    pending_transaction.outputs.forEach(output=>{
        pending_output_total += output.value;
    })

    if(pending_input_total < pending_output_total){
      transValidation = false;
      console.log("not enough input",pending_input_total + " "+pending_output_total);
    }else{
      transaction_fee = pending_input_total - pending_output_total
    }


    return {transValidation,transaction_fee};
  }

  async UnlockOutput(input, output, trans_hash){
    let unlock = true;
    let value = 0;
    const hashValues_Stack = [];
    const completeScript = input.scriptSig + " " + output.scriptPubKey
    const completeScript_arr = completeScript.split(" ");

    let i = 0;
    while(unlock && i<completeScript_arr.length){
      const item  = completeScript_arr[i];
      switch(item){
        case "OP_DUP":
           const lastItem_Index = hashValues_Stack.length - 1;
           const dup_item = hashValues_Stack[lastItem_Index];
           hashValues_Stack.push(dup_item);
        break;

        case "OP_HASH160":
            const pubKey = hashValues_Stack.pop();
            const keyBuffer = Buffer.from(pubKey,"hex");
            const key_hash160 = new ripemd160().update(Buffer.from(sha256(keyBuffer),"hex")).digest('hex');
            hashValues_Stack.push(key_hash160);
        break;

        case "OP_EQUALVERIFY":
            const pubHash_top = hashValues_Stack.pop();
            const pubhash_sec = hashValues_Stack.pop();
            if(pubHash_top !== pubhash_sec) unlock = false;
        break;

        case "OP_CHECKSIG":
            const pubKey_input = hashValues_Stack.pop();
            const sig = hashValues_Stack.pop();
            const result = await Key.VerifySignature(pubKey_input, trans_hash, sig);
            if(!result) unlock = false;
        break;

        default:
        hashValues_Stack.push(item);
      }
      i++;
    }
    if(unlock === true)value = output.value;
    return {unlock: unlock, value: value}
  }


  getSingleTransactionHash(transaction){
    const hash = sha256(transaction);
    return hash
  }
}

module.exports = Transaction;
