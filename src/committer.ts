
import { Commit } from '../generated/schema';
import { CreateCommit } from '../generated/templates/PoolCommitter/PoolCommitter';

// event CreateCommit(uint128 indexed commitID, uint256 indexed amount, CommitType indexed commitType);
export function createdCommit(event: CreateCommit): void {
	let id = event.transaction.from.toHexString() + "-" + event.address.toHexString() + "-" + event.params.commitID.toString();

	let commit = new Commit(id);

	let type = event.params.commitType;

	if (type === 0) {
		commit.type = "ShortMint"
	} else if (type === 1) {
		commit.type = "ShortBurn"
	} else if (type === 2) {
		commit.type = "LongMint"
	} else {
		commit.type = "LongBurn"
	}

	commit.amount = event.params.amount;
	commit.trader = event.transaction.from;
	commit.txnHash = event.transaction.hash;

	commit.save();
}