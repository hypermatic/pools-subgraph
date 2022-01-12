import {
  FeeAddressUpdated,
	GovernanceAddressChanged,
	KeeperAddressChanged,
	Paused,
	PoolInitialized,
  PoolRebalance,
  PriceChangeError,
  ProvisionalGovernanceChanged,
  Unpaused
} from "../../generated/templates/LeveragedPool/LeveragedPool"
import { LeveragedPool as LeveragedPoolEntity, PoolRebalance as PoolRebalanceEntity } from "../../generated/schema"
import { initPool } from "../utils/helper"

// PoolInitialized(address indexed longToken, address indexed shortToken, address quoteToken, string poolName);
export function poolInitialized(event: PoolInitialized): void {
  let pool = initPool(event.address, event.params.longToken, event.params.shortToken)

  pool.save()
}

// FeeAddressUpdated(indexed address,indexed address)
export function feeAddressUpdated(event: FeeAddressUpdated): void {}

// - GovernanceAddressChanged(indexed address,indexed address)
export function governanceAddressChanged(event: GovernanceAddressChanged): void {}

// - KeeperAddressChanged(indexed address,indexed address)
export function keeperAddressChanged(event: KeeperAddressChanged): void {}

// - Paused()
export function handlePaused(event: Paused): void {
  let pool = LeveragedPoolEntity.load(event.address.toHex())

  if (pool == null) {
	  pool = initPool(event.address, null, null)
  }

  pool.paused = true
  pool.save()
}

// - Unpaused()
export function handleUnpaused(event: Unpaused): void {
  let pool = LeveragedPoolEntity.load(event.address.toHex())

  if (pool == null) {
	  pool = initPool(event.address, null, null)
  }

  pool.paused = false
  pool.save()
}

// - PoolRebalance(int256,int256)
export function poolRebalance(event: PoolRebalance): void {
  let poolRebalance = new PoolRebalanceEntity(event.address.toHexString() + event.block.number.toString());

  poolRebalance.pool = event.address;
  poolRebalance.blockNumber = event.block.number;
  poolRebalance.shortBalanceChange = event.params.shortBalanceChange;
  poolRebalance.longBalanceChange = event.params.longBalanceChange;

  poolRebalance.save();
}

// - PriceChangeError(indexed int256,indexed int256)
export function priceChangeError(event: PriceChangeError): void {}

// - ProvisionalGovernanceChanged(indexed address)
export function provisionalGovernanceChanged(event: ProvisionalGovernanceChanged): void {}
