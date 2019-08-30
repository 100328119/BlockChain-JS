const router = require('express-promise-router')();

const FullNodeController = require('../Controller/FullNodeController');

//get node information
router.route('/node_info')
  .get(FullNodeController.Node_info);
//get complete blockchain info
router.route('/blockchain')
  .get(FullNodeController.getCompleteChain);

//create a new transaction
router.route('/transaction')
  .post(FullNodeController.CreateTransaction);

router.route('/transaction/status/:trans_hash')
  .get(FullNodeController.TransactionStatus);

router.route('/transaction/broadcast')
  .post(FullNodeController.BroadcastTransaction);

router.route('/transaction/issue')
  .post(FullNodeController.IssueTransaction);

router.route('/mine')
  .get(FullNodeController.mineBlock);

router.route('/receive-new-block')
  .get(FullNodeController.receive_new_block);

router.route('/register-and-broadcast-node')
  .post(FullNodeController.register_broadcast_node);

router.route('/register-node')
  .post(FullNodeController.register_node);

router.route('/register-nodes-bulk')
  .post(FullNodeController.register_nodes_bulk);

router.route('/consensus')
  .get(FullNodeController.consensus);



//----explorer functions----//

router.route('/balance_check/:address')
  .get(FullNodeController.getbalance)

router.route('/create_Address')
  .get(FullNodeController.createAddress);

// router.route('/block/:blockHash')
//   .get();
//
// router.route('/transaction/:transactionId')
//   .get();
//
// router.route('/address/:address')
//   .get();
//
// router.route('/block-explorer')
//   .get();

//test
router.route('/VerifyPendingTransaction')
  .get(FullNodeController.VerifyPendingTransaction)

module.exports = router;
