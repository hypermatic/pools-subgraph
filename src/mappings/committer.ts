
import { Commit, CommitResolver, LeveragedPool, LeveragedPoolByPoolCommitter } from '../../generated/schema';
import { CreateCommit, ExecuteCommit, ExecuteCommitmentCall, SetQuoteAndPoolCall } from '../../generated/templates/PoolCommitter/PoolCommitter';
import { LeveragedPool as LeveragedPoolContract } from '../../generated/templates/LeveragedPool/LeveragedPool';
import { ERC20 } from '../../generated/templates/LeveragedPool/ERC20';
import { Address, store, log, BigInt } from '@graphprotocol/graph-ts';
import { PoolCommitter } from '../../generated/templates';

let SHORT_MINT = 0;
let SHORT_BURN = 1;
let LONG_MINT = 2;
let LONG_BURN = 3;

// event CreateCommit(uint128 indexed commitID, uint256 indexed amount, CommitType indexed commitType);
export function createdCommit(event: CreateCommit): void {
	let id = event.transaction.from.toHexString() + "-" + event.address.toHexString() + "-" + event.params.commitID.toString();
	let leveragedPoolByPoolCommitter = LeveragedPoolByPoolCommitter.load(event.address.toHexString());

	let commit = new Commit(id);

	let type = event.params.commitType;
	commit.amount = event.params.amount;

	if (type === SHORT_MINT) {
		commit.type = "ShortMint"
	} else if (type === SHORT_BURN) {
		commit.type = "ShortBurn"
	} else if (type === LONG_MINT) {
		commit.type = "LongMint"
	} else {
		commit.type = "LongBurn"
	}

	// commits are deleted from contract storage after they are executed
	// store commit details by <poolCommitterAddress>-<commitID>
	// use this hack so that we can access commit details during ExecuteCommit handler
	// let resolverId = event.transaction.from.toHexString() + event.address.toHexString() + event.params.commitType event.block.timestamp.toString();
	let resolverId = event.address.toHexString() + "-" + event.params.commitID.toString()
	let commitResolver = new CommitResolver(resolverId);
	commitResolver.commitId = id;

	commitResolver.save();

	commit.trader = event.transaction.from;
	commit.txnHash = event.transaction.hash;
	commit.created = event.block.timestamp;
	commit.txnHash = event.transaction.hash;

	commit.pool = leveragedPoolByPoolCommitter.pool

	commit.save();
}

// event ExecuteCommit(uint128 indexed commitID);
export function executedCommit(event: ExecuteCommit): void {
	let resolverId = event.address.toHexString() + "-" + event.params.commitID.toString()

	let commitResolver = CommitResolver.load(resolverId);

	let commit = Commit.load(commitResolver.commitId);

	let upkeepId = commit.pool.toHexString() + '-' + event.block.number.toString();
	commit.upkeep = upkeepId

	commit.save();
	// remove temporary link to pending commit
	store.remove('CommitResolver', resolverId)
}