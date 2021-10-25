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
} from "../generated/templates/LeveragedPool/LeveragedPool"
import { LeveragedPool as LeveragedPoolEntity } from "../generated/schema"
import { initPool } from "./utils/helper"

// PoolInitialized(address indexed longToken, address indexed shortToken, address quoteToken, string poolName);
export function poolInitialized(event: PoolInitialized): void {
  let pool = initPool(event.address)

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
	  pool = initPool(event.address)
  }

  pool.paused = true
  pool.save()
}

// - Unpaused()
export function handleUnpaused(event: Unpaused): void {
  let pool = LeveragedPoolEntity.load(event.address.toHex())

  if (pool == null) {
	  pool = initPool(event.address)
  }

  pool.paused = false 
  pool.save()
}

// - PoolRebalance(int256,int256)
export function poolRebalance(event: PoolRebalance): void {}

// - PriceChangeError(indexed int256,indexed int256)
export function priceChangeError(event: PriceChangeError): void {}

// - ProvisionalGovernanceChanged(indexed address)
export function provisionalGovernanceChanged(event: ProvisionalGovernanceChanged): void {}
