import { test } from "node:test"
import assert from "node:assert/strict"
import { sortByRank } from "./sort-products.ts"

function product(
  id: string,
  rank: unknown,
  created_at = "2026-01-01T00:00:00.000Z"
) {
  return {
    id,
    created_at,
    metadata: rank === undefined ? null : { rank },
  } as any
}

test("products with rank 10/20/30 render in that order", () => {
  const input = [
    product("c", 30),
    product("a", 10),
    product("b", 20),
  ]
  const result = sortByRank(input).map((p) => p.id)
  assert.deepEqual(result, ["a", "b", "c"])
})

test("a product without rank sorts last", () => {
  const input = [
    product("no-rank", undefined),
    product("a", 10),
    product("b", 20),
  ]
  const result = sortByRank(input).map((p) => p.id)
  assert.deepEqual(result, ["a", "b", "no-rank"])
})

test("a product with a non-numeric rank doesn't crash and sorts last", () => {
  const input = [
    product("bad-rank", "abc"),
    product("a", 10),
    product("b", 20),
  ]
  assert.doesNotThrow(() => sortByRank(input))
  const result = sortByRank(input).map((p) => p.id)
  assert.deepEqual(result, ["a", "b", "bad-rank"])
})

test("equal ranks tiebreak deterministically by created_at desc, then id", () => {
  const input = [
    product("older", 10, "2026-01-01T00:00:00.000Z"),
    product("newer", 10, "2026-02-01T00:00:00.000Z"),
  ]
  const result = sortByRank(input).map((p) => p.id)
  assert.deepEqual(result, ["newer", "older"])

  const samestamp = [
    product("z", 10, "2026-01-01T00:00:00.000Z"),
    product("a", 10, "2026-01-01T00:00:00.000Z"),
  ]
  const tied = sortByRank(samestamp).map((p) => p.id)
  assert.deepEqual(tied, ["a", "z"])
})
