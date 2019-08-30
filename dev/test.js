// const Node = require('./full_node');
const gensisBlock = require('./gensisBlock');
const defaultSetting = require('./defaultSetting');
const Key = require("./key");
// const Transaction = require('./transaction');
const crypto = require("crypto");
const eccrypto = require("eccrypto");

const ripemd160 = require("ripemd160")
const sha256 = require('sha256');
const Base58 = require('bs58');
// const full_node = require('./NodeIni');
// const node = new Node();
const key = new Key();
// const transaction = new Transaction();

//------------generate gensisblock data-----------------------//
// const Trans_String = gensisBlock.transaction_list.map(trans=>JSON.stringify(trans))
// console.log(Trans_String);
// const gensis_merkle_root = node.getMerkleRoot(Trans_String);
// console.log("merkle root", gensis_merkle_root);
// const version = gensisBlock.block_header.version;
// const merkle_root = gensisBlock.block_header.merkle_root;
// const timestamp = gensisBlock.block_header.timestamp;
// const difficultly_target = gensisBlock.block_header.difficultly_target;
// const previousBlockHash = gensisBlock.block_header.previous_block_hash;
// // const POW = node.proofOfWork(version, previousBlockHash,merkle_root, timestamp, difficultly_target);
// // console.log("POW",POW);
//
// // const gensisBlock_hash = node.hashBlock(version, previousBlockHash,merkle_root, timestamp, difficultly_target, gensisBlock.block_header.nonce);
// // console.log("gensis block hash", gensisBlock_hash);
//
// console.log(gensisBlock.block_header.previous_block_hash);
// const validation1 = node.verifyBlock(gensisBlock,gensisBlock.block_header.previous_block_hash);
// const validation2 = node.verifyBlock(gensisBlock,"0");
//
// console.log("validation",{validation1,validation2});
//
// const buffer_data = Buffer.from(defaultSetting.node_1.publicKey,"hex")
// const pubkey_sha256 = sha256(buffer_data);
// const pubkey_ripemd160 = new ripemd160().update(Buffer.from(pubkey_sha256,"hex")).digest('hex');
// console.log("node_1 address", pubkey_ripemd160);

const address = key.getAddress("0484d93eb44f57d402bd607b54a42167746abfede52c3ada40a1ac120b03c50a1f1373a8a22d33ce0c4374ff899432f8e67cc511df42a9369d70eb72a7622d6d73");

console.log("address",address);

const keyBuffer = Buffer.from("04d980e147039b7247c0c9efb47bc2b25f805ecdb2f8c307bae19312d6c4e6068c6a6932729b302b892eb49404387652c9e42f42529312682f26c35122812d40ef","hex");
const key_hash160 = new ripemd160().update(Buffer.from(sha256(keyBuffer),"hex")).digest('hex');
console.log("key_hash160",key_hash160);

// const add_version = "00"+pubkey_ripemd160;
//
// const double_sha256 = sha256.x2(Buffer.from(add_version,"hex"));
// const checksum = double_sha256.substring(0,8);
//
// const addchecksum = add_version + checksum;
// const input = Buffer.from(addchecksum,"hex");
// const address = Base58.encode(input);
//
// console.log("hash160",pubkey_ripemd160);
// console.log("address",address);

// const node_1_address = key.getAddress(defaultSetting.node_1.publicKey);
// const node_2_address = key.getAddress(defaultSetting.node_2.publicKey);
// const node_3_address = key.getAddress(defaultSetting.node_3.publicKey);
// const node_4_address = key.getAddress(defaultSetting.node_4.publicKey);
// const node_5_address = key.getAddress(defaultSetting.node_5.publicKey);
//
// console.log("addresses: ",{1:node_1_address,2:node_2_address,3:node_3_address,4:node_4_address,5:node_5_address,})

// console.log(sha256(defaultSetting.node_1.publicKey));

// console.log("old pub",defaultSetting.node_1.publicKey );
// const new_pub = eccrypto.getPublic(Buffer.from(defaultSetting.node_1.privateKey,"hex"));
// console.log("new_pub",new_pub.toString("hex"));
//
// const hash = crypto.createHash("sha160").update("defaultSetting.node_1.publicKey")
//                         .digest("hex");
// crypto.createHash('md5').update(data).digest("hex");
// console.log(hash);

// console.log("pub:",Buffer.from(defaultSetting.node_1.publicKey));
// console.log("pub length:", Buffer.byteLength(defaultSetting.node_1.publicKey, "hex"));
// console.log("priv:",Buffer.from(defaultSetting.node_1.privateKey))
// const gensisCoinBase_array = [{
//       input_count: 0,
//       inputs: [],
//       output_count: 1,
//       outoput:
//        [ { value: 12.5,
//            recipient:
//             '047a3da95001c7a7e61b1360f2fc8c8de796108b5d457d2e185d3ef21fff6b2133c07abe3f9601362941d203a1caac67082f411690d06dfcaae1d361f7539730b4' } ],
//       locktime: '00000',
//       timestamp: "1557248173410",
//       signature:
//        '304402203f7a8de889357d6543ae982ff5608f66ca2a91a4233146cdb96e7c42a0b2b78a02204848b0342b10ba6d254613080014b2f2bc285b5a28c766895f9c4c675590954f'}]
//
// const string_array = gensisCoinBase_array.map(trans=>JSON.stringify(trans))
// console.log(string_array);
// console.log(node.getMerkleRoot(string_array));



// const datatohash = {
//   version:gensisBlock.block_header.version,
//   merkle_root: gensisBlock.block_header.merkle_root,
//   timestamp: gensisBlock.block_header.timestamp,
//   difficultly_target:gensisBlock.block_header.difficultly_target
// }
// const nonce = node.proofOfWork("0",datatohash);
// const hash = node.hashBlock("0",datatohash,nonce);
// console.log({hash:hash,nonce: nonce});

// console.log(node.getMerkleRoot(coinbase_array));

// const node_1 = key.KeyPairGenerator();
// const node_2 = key.KeyPairGenerator();
// const node_3 = key.KeyPairGenerator();
// const node_4 = key.KeyPairGenerator();
// const node_5 = key.KeyPairGenerator();
//
// console.log("node_1",node_1);
// console.log("node_2",node_2);
// console.log("node_3",node_3);
// console.log("node_4",node_4);
// console.log("node_5",node_5);

// transaction.CreateCoinBase(0, node_1.publicKey, node_1.privateKey)
//   .then(coinbase=>{
//     console.log(coinbase);
//   })
// const data = "1234";
// const data2 = "1111";
// const datahash = sha256(data);
//
// const data2hash = sha256(data2);


// transaction.CreateCoinBase(0.5, keyPair2.publicKey, keyPair.privateKey)
//   .then(coinbase=>{
//     console.log(coinbase)
//   }).catch(err=>{
//     console.log(err);
//   })

// const transaction_list =[
//   {
//     tx:"1",
//     index:1,
//     value:1
//   },
//   {
//     tx:"2",
//     index:0,
//     value:0.7
//   },
//   {
//     tx:"3",
//     index:1,
//     value:0.1
//   }
// ]
//
// transaction.CreateGenTransaction(transaction_list,1,0.25,keyPair2.publicKey,keyPair.privateKey,keyPair.publicKey,0)
//   .then(genTrans=>{
//     console.log(genTrans)
//   }).catch(err=>{
//     console.log(err);
//   })

// const signature = key.getSignatrue(keyPair.privateKey, datahash)
// key.SignData(keyPair.privateKey, datahash)
//   .then(sig=>{
//     console.log("sig", sig);
//     key.VerifySignature(keyPair.publicKey, datahash, sig)
//       .then(res=>{
//         console.log("signature1 is ", res)
//       })
//       key.VerifySignature(keyPair.publicKey, data2hash, sig)
//         .then(valid=>{
//           console.log("signature2 is ", valid)
//         }).catch(invalid =>{
//           console.log("signature2 is ", invalid)
//         })
//   }).catch(err=>{
//     console.log(err)
//   })





// const transactions = [];
//
// const transaction = JSON.stringify(gensisBlock.transaction_list[0]);
// transactions.push(transaction);
// const transaction2 = {
//     amount:60,
//     sender:"test2",
//     reciever:"test3"
// }
// const transaction3 = {
//   amount:60,
//   sender:"testss",
//   reciever:"testss"
// }
// transactions.push(JSON.stringify(transaction2));
// console.log("transaction", transactions);
//
// const hash1 = sha256(transaction);
// const hash2 = sha256(JSON.stringify(transaction2));
//
// console.log("hash1", hash1);
// console.log("hash2", hash2);

// const merkle_root = coin.getMerkleRoot(transactions);
// console.log("merkle root",merkle_root);

// const trans1valid = coin.proofMerkleHash(0,hash1,merkle_root);
// console.log("trans1valid",trans1valid);
//
// const trans2valid = coin.proofMerkleHash(1,hash2,merkle_root);
// console.log("trans2valid",trans2valid);

// const gensis_block_data = {
//   version:gensisBlock.block_header.version,
//   merkle_root:gensisBlock.block_header.merkle_root,
//   timestamp: gensisBlock.block_header.timestamp,
//   difficultly_target:gensisBlock.block_header.difficultly_target
// }
//
// const gensis_Block_hash = coin.hashBlock("0",gensis_block_data,gensisBlock.block_header.nonce);
// console.log(gensis_Block_hash);
