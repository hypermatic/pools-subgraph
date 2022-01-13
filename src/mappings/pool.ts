import {
  FeeAddressUpdated,
	GovernanceAddressChanged,
	KeeperAddressChanged,
	Paused,
	PoolInitialized,
  PoolRebalance,
  PriceChangeError,
  ProvisionalGovernanceChanged,
  Unpaused,
  LeveragedPool,
} from "../../generated/templates/LeveragedPool/LeveragedPool"
import { ERC20 } from "../../generated/templates/LeveragedPool/ERC20"
import { LeveragedPool as LeveragedPoolEntity, Upkeep } from "../../generated/schema"
import { initPool } from "../utils/helper"
import { Address, log } from "@graphprotocol/graph-ts"

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
  // this is the first event that is fired during upkeep
  // this is a good place to cache pricing data for the given upkeep


  let upkeepId = event.address.toHexString() + '-' + event.block.number.toString()

  let upkeep = new Upkeep(upkeepId);

  let poolInstance = LeveragedPool.bind(event.address);
	let storedPool = LeveragedPoolEntity.load(event.address.toHexString());

  let longToken = ERC20.bind(Address.fromString(storedPool.longToken.toHexString()));
	upkeep.longTokenSupply = longToken.totalSupply();
	upkeep.longTokenBalance = poolInstance.longBalance();

	let shortToken = ERC20.bind(Address.fromString(storedPool.shortToken.toHexString()));
	upkeep.shortTokenSupply = shortToken.totalSupply();
	upkeep.shortTokenBalance = poolInstance.shortBalance();

  upkeep.pool = event.address.toHexString();
  upkeep.blockNumber = event.block.number;
  upkeep.timestamp = event.block.timestamp;
  upkeep.shortBalanceChange = event.params.shortBalanceChange;
  upkeep.longBalanceChange = event.params.longBalanceChange;

  upkeep.save();
}

// - PriceChangeError(indexed int256,indexed int256)
export function priceChangeError(event: PriceChangeError): void {}

// - ProvisionalGovernanceChanged(indexed address)
export function provisionalGovernanceChanged(event: ProvisionalGovernanceChanged): void {}
