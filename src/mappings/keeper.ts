import { KeeperPayment, LeveragedPool, Upkeep } from '../../generated/schema';
import { UpkeepSuccessful, KeeperPaid } from '../../generated/templates/PoolKeeper/PoolKeeper';
import { formatUnits, initPool } from '../utils/helper';

// event UpkeepSuccessful(address indexed pool, bytes data, int256 indexed startPrice, int256 indexed endPrice);
export function upkeepSuccessful(event: UpkeepSuccessful): void {
	let upkeepId = event.params.pool.toHexString() + "-" + event.block.number.toString();

	let round = Upkeep.load(upkeepId)

	if (round == null) {
		round = new Upkeep(upkeepId)
	}

	round.txnHash = event.transaction.hash;
	round.startPrice = event.params.startPrice;
	round.endPrice = event.params.endPrice;

	round.save();
}

// event KeeperPaid(address indexed _pool, address indexed keeper, uint256 reward);
export function keeperPaid(event: KeeperPaid): void {
	let upkeepId = event.params._pool.toHexString() + "-" + event.block.number.toString();
	let keeperPayment = new KeeperPayment(event.transaction.hash.toHex())

	let pool = LeveragedPool.load(event.params._pool.toHex());
	if (pool === null) {
		pool = initPool(event.params._pool, null, null);
		pool.save()
	}

	let reward = formatUnits(event.params.reward, pool.quoteTokenDecimals);

	keeperPayment.pool = event.params._pool.toHex();
	keeperPayment.upkeepRound = upkeepId;
	keeperPayment.timestamp = event.block.timestamp;
	keeperPayment.rewardedKeeper = event.params.keeper;

	keeperPayment.amount = reward; // reward paid in settlement tokens

	keeperPayment.save();
}