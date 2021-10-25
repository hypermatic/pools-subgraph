import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { LeveragedPool } from "../../generated/templates/LeveragedPool/LeveragedPool";
import { QuoteToken } from "../../generated/templates/LeveragedPool/QuoteToken";
import { LeveragedPool as LeveragedPoolEntity } from "../../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"

import { PoolCommitter, PoolKeeper } from "../../generated/templates"

export function initPool(address: Address): LeveragedPoolEntity {
	let pool = new LeveragedPoolEntity(address.toHex())
	let contract = LeveragedPool.bind(address)

	pool.name = contract.poolName()
	pool.keeper = contract.keeper()
	pool.committer = contract.poolCommitter()
	pool.quoteToken = contract.quoteToken()
	pool.oracle = contract.oracleWrapper()
	pool.feeReceiver = contract.feeAddress()
	pool.frontRunningInterval = contract.frontRunningInterval()
	pool.tradingFee = contract.fee()
	pool.updateInterval = contract.updateInterval()
	pool.lastPriceTimestamp = contract.lastPriceTimestamp()
	pool.paused = contract.paused()
	pool.shortBalance = contract.shortBalance()
	pool.longBalance = contract.longBalance()

	let quoteToken = QuoteToken.bind(contract.quoteToken())
	pool.quoteTokenDecimals = BigInt.fromI32(quoteToken.decimals())

	PoolKeeper.create(contract.keeper())
	PoolCommitter.create(contract.poolCommitter())

	return pool;
}

export function fromWad(wadValue: BigInt, decimals: BigInt): BigDecimal {
	let MAX_DECIMALS = BigInt.fromI32(18)
	let u8Decimals = u8(MAX_DECIMALS.minus(decimals).toI32());
	let scaler = BigInt.fromI32(10).pow(u8Decimals);
	return wadValue.toBigDecimal().div(scaler.toBigDecimal());
}

export function formatUnits(value: BigInt, decimals: BigInt): BigDecimal {
	let u8Decimals = u8(decimals.toI32());
	let scaler = BigInt.fromI32(10).pow(u8Decimals);
	return value.toBigDecimal().div(scaler.toBigDecimal());
}

export function formatDecimalUnits(value: BigDecimal, decimals: BigInt): BigDecimal {
	let u8Decimals = u8(decimals.toI32());
	let scaler = BigInt.fromI32(10).pow(u8Decimals);
	return value.div(scaler.toBigDecimal());
}