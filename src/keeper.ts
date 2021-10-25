import { KeeperPayment, LeveragedPool, UpkeepRound } from '../generated/schema';
import { UpkeepSuccessful, KeeperPaid } from '../generated/templates/PoolKeeper/PoolKeeper';
import { formatUnits, initPool } from './utils/helper';

// event UpkeepSuccessful(address indexed pool, bytes data, int256 indexed startPrice, int256 indexed endPrice);
export function upkeepSuccessful(event: UpkeepSuccessful): void {
	let roundId = event.params.pool.toHexString() + "-" + event.block.timestamp.toString();

	let round = UpkeepRound.load(roundId)

	if (round == null) {
		round = new UpkeepRound(roundId)
	}

	round.timestamp = event.block.timestamp
	round.pool = event.params.pool.toHex()
	round.startPrice = event.params.startPrice;
	round.endPrice = event.params.endPrice;

	round.save()

}

// event KeeperPaid(address indexed _pool, address indexed keeper, uint256 reward);
export function keeperPaid(event: KeeperPaid): void {
	let roundId = event.params._pool.toHexString() + "-" + event.block.timestamp.toString();
	let keeperPayment = new KeeperPayment(event.transaction.hash.toHex())

	let pool = LeveragedPool.load(event.params._pool.toHex());
	if (pool === null) {
		pool = initPool(event.params._pool);
		pool.save()
	}

	let reward = formatUnits(event.params.reward, pool.quoteTokenDecimals);

	keeperPayment.pool = event.params._pool.toHex();
	keeperPayment.upkeepRound = roundId;
	keeperPayment.timestamp = event.block.timestamp;
	keeperPayment.rewardedKeeper = event.params.keeper;

	keeperPayment.amount = reward; // reward payed in settlement tokens

	keeperPayment.save()
}