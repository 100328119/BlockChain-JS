const Blockchain = require('./blockchain');

const coin = new Blockchain();

coin.createNewBlock(23232, 'fdsafdsfsadfas', "skdjaklsdsajl");
coin.createNewBlock(233212, 'fd43243dfas', "skdjaklsdsajl");
coin.createNewBlock(2323212, 'fdjfjjrnjvnnpjres', "last");
console.log(coin);
console.log(coin.getLastBlock());
