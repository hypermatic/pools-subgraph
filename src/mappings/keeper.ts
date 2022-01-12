import { KeeperPayment, LeveragedPool, Upkeep } from '../../generated/schema';
import { UpkeepSuccessful, KeeperPaid } from '../../generated/templates/PoolKeeper/PoolKeeper';
import { LeveragedPool as LeveragedPoolContract } from '../../generated/templates/LeveragedPool/LeveragedPool';
import { ERC20 } from '../../generated/templates/LeveragedPool/ERC20';
import { formatUnits, initPool } from '../utils/helper';
import { store, Address } from '@graphprotocol/graph-ts';

// event UpkeepSuccessful(address indexed pool, bytes data, int256 indexed startPrice, int256 indexed endPrice);
export function upkeepSuccessful(event: UpkeepSuccessful): void {
	let roundId = event.params.pool.toHexString() + "-" + event.block.timestamp.toString();

	let round = Upkeep.load(roundId)

	if (round == null) {
		round = new Upkeep(roundId)
	}

	let storedPool = LeveragedPool.load(event.params.pool.toHexString());
	let poolInstance = LeveragedPoolContract.bind(event.params.pool)

	// let longToken = ERC20.bind(Address.fromHexString(storedPool.longToken.toHexString()));
	// let shortToken = ERC20.bind(Address.fromHexString(storedPool.shortToken.toHexString()));
	let longToken = ERC20.bind(Address.fromString(storedPool.longToken.toHexString()));
	let shortToken = ERC20.bind(Address.fromString(storedPool.shortToken.toHexString()));

	let longSupply = longToken.totalSupply();
	let shortSupply = shortToken.totalSupply();

	let longBalance = poolInstance.longBalance();
	let shortBalance = poolInstance.shortBalance();

	round.blockNumber = event.block.number;
	round.txnHash = event.transaction.hash;
	round.timestamp = event.block.timestamp;
	round.pool = event.params.pool.toHex();
	round.startPrice = event.params.startPrice;
	round.endPrice = event.params.endPrice;
	round.longTokenBalance = longBalance;
	round.shortTokenBalance = shortBalance;
	round.longTokenSupply = longSupply;
	round.shortTokenSupply = shortSupply;

	round.save();
}

// event KeeperPaid(address indexed _pool, address indexed keeper, uint256 reward);
export function keeperPaid(event: KeeperPaid): void {
	let roundId = event.params._pool.toHexString() + "-" + event.block.timestamp.toString();
	let keeperPayment = new KeeperPayment(event.transaction.hash.toHex())

	let pool = LeveragedPool.load(event.params._pool.toHex());
	if (pool === null) {
		pool = initPool(event.params._pool, null, null);
		pool.save()
	}

	let reward = formatUnits(event.params.reward, pool.quoteTokenDecimals);

	keeperPayment.pool = event.params._pool.toHex();
	keeperPayment.upkeepRound = roundId;
	keeperPayment.timestamp = event.block.timestamp;
	keeperPayment.rewardedKeeper = event.params.keeper;

	keeperPayment.amount = reward; // reward paid in settlement tokens

	keeperPayment.save();
}