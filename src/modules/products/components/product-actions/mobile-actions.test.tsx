import { test, afterEach, mock } from "node:test"
import assert from "node:assert/strict"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import MobileActions from "./mobile-actions.tsx"

afterEach(() => cleanup())

const product: any = {
  id: "prod_1",
  title: "Test Product",
  options: [],
}

const variant: any = {
  id: "variant_1",
  manage_inventory: true,
  allow_backorder: false,
  inventory_quantity: 0,
  metadata: { restock_eta: "~2 weeks" },
}

function baseProps(overrides: Record<string, any> = {}) {
  return {
    product,
    variant,
    options: {},
    updateOptions: () => {},
    inStock: false,
    stockState: "out_of_stock" as const,
    handleAddToCart: mock.fn(),
    isAdding: false,
    show: true,
    optionsDisabled: false,
    quantity: 1,
    increaseQuantity: () => {},
    decreaseQuantity: () => {},
    isValidVariant: true,
    unselectedOption: null,
    ...overrides,
  }
}

test("stock line renders below the CTA row, not inside the title/price row", () => {
  render(<MobileActions {...baseProps()} />)

  const testids = Array.from(
    document.querySelectorAll("[data-testid]")
  ).map((el) => el.getAttribute("data-testid"))

  const ctaIndex = testids.indexOf("mobile-cart-button")
  const badgeIndex = testids.indexOf("stock-badge")

  assert.ok(ctaIndex !== -1 && badgeIndex !== -1)
  assert.ok(badgeIndex > ctaIndex, "stock-badge must come after mobile-cart-button in DOM order")

  // Not nested inside the title row alongside the price.
  const titleRow = screen.getByTestId("mobile-title").parentElement
  assert.equal(titleRow?.querySelector('[data-testid="stock-badge"]'), null)
})

test("out-of-stock CTA focuses the waitlist email field instead of adding to cart", () => {
  // Simulates the sibling <WaitlistForm> email input living elsewhere on the page.
  const emailInput = document.createElement("input")
  emailInput.id = "waitlist-email"
  document.body.appendChild(emailInput)

  const handleAddToCart = mock.fn()
  render(<MobileActions {...baseProps({ handleAddToCart })} />)

  fireEvent.click(screen.getByTestId("mobile-cart-button"))

  assert.equal(document.activeElement, emailInput)
  assert.equal(handleAddToCart.mock.callCount(), 0)

  document.body.removeChild(emailInput)
})

test("out-of-stock CTA is enabled and reads 'Notify me' when a valid variant is selected", () => {
  render(<MobileActions {...baseProps()} />)
  const button = screen.getByTestId("mobile-cart-button") as HTMLButtonElement
  assert.equal(button.disabled, false)
  assert.equal(button.textContent, "Notify me")
})

test("in-stock case still calls handleAddToCart and shows 'Add to cart'", () => {
  const handleAddToCart = mock.fn()
  render(
    <MobileActions
      {...baseProps({
        handleAddToCart,
        inStock: true,
        stockState: "in_stock",
      })}
    />
  )

  const button = screen.getByTestId("mobile-cart-button") as HTMLButtonElement
  assert.equal(button.textContent, "Add to cart")

  fireEvent.click(button)
  assert.equal(handleAddToCart.mock.callCount(), 1)
})
