const gensisBlock = {
  block_header:{
    version:"1.0.0",
    previous_block_hash:"0",
    merkle_root:"ca6729e84472e08e640ec762500af50f0c9de05d4a03cc1e5492073abd309b31",
    timestamp: 1557248173410,
    difficultly_target:4,
    nonce: 87215
  },
  transaction_list:[
    { input_count: 1,
      inputs: [
        {
          tx:"0",
          index:-1,
          coinbase:0
        }
      ],
      output_count: 1,
      outputs:
       [ { value: 12.5,
           scriptPubKey:
            'OP_DUP OP_HASH160 8e16d685f58b818ded3650f7513843aab269fbd1 OP_EQUALVERIFY OP_CHECKSIG' } ],
      locktime: '0',
    }
  ]
}

const block = {
  magic_number: "integer",
  block_header:{
    version:"double",
    previous_block_hash:"256bit hash",
    merkle_root:"256bit hash",
    timestamp: "integer",
    difficultly_target:"integer",
    nonce: "integer"
  },
  transaction_list:[

  ]
}

const transction = {
    input_count: "integer",
    inputs: [],
    output_count: "integer",
    outputs:
     [ { value: "double",
         SigScript:
          '047a3da95001c7a7e61b1360f2fc8c8de796108b5d457d2e185d3ef21fff6b2133c07abe3f9601362941d203a1caac67082f411690d06dfcaae1d361f7539730b4' } ],
    locktime: '00000',
    timestamp: "1557248173410"
}

module.exports = gensisBlock;
