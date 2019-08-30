const crypto = require("crypto");
const eccrypto = require("eccrypto");
const sha256 = require("sha256");
const ripemd160 = require("ripemd160");
const Base58 = require('bs58');
const VERSION = "00";

class Key {
  //generate key pair and return keys in hex
  KeyPairGenerator(){
    const privateKey = eccrypto.generatePrivate();
    const publicKey = eccrypto.getPublic(privateKey);
    return {
      privateKey: privateKey.toString('hex'),
      publicKey: publicKey.toString('hex')
    }
  };

  getAddress(publicKey){
    const keyBuffer = Buffer.from(publicKey,"hex");
    // get hash 160 value
    const hash160 = new ripemd160().update(Buffer.from(sha256(keyBuffer),"hex")).digest('hex');
    // get checksum of hash160
    const double_hash160 = sha256.x2(Buffer.from(VERSION+hash160,"hex"));
    const checksum = double_hash160.substring(0,8);
    //get final address
    const address_hex = VERSION+hash160+checksum;
    const address_base58 = Base58.encode(Buffer.from(address_hex,'hex'));

    return address_base58;
  }


 getSignatrue(privateKey_hex, datahash_hex){
   // convert all para from hex to buffer
   const privateKey = this.BufferData(privateKey_hex);
   const datahash = this.BufferData(datahash_hex);
    return new Promise((resolve, reject)=>{
      eccrypto.sign(privateKey, datahash)
        .then(sig =>{
          resolve(sig.toString('hex'));
        }).catch(err=>{
          reject(err);
        })
    });
  };

 VerifySignature(publicKey_hex, datahash_hex, Signature_hex){
   // convert all para from hex to buffer
   const publicKey = this.BufferData(publicKey_hex);
   const Signature = this.BufferData(Signature_hex);
   const datahash = this.BufferData(datahash_hex);
    return new Promise((resolve, reject)=>{
      eccrypto.verify(publicKey, datahash, Signature)
        .then(()=>{
          resolve(true);
        }).catch(()=>{
          reject(false);
        })
    })
  };

  BufferData(hex_data){
    const BufferValue = Buffer.from(hex_data, "hex");
    return BufferValue;
  }
}


module.exports = Key;
