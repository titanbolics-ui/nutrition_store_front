import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import * as React from "react"
import { cleanup, render, screen, within } from "@testing-library/react"
import GalleryView from "./gallery-view.tsx"

afterEach(() => {
  cleanup()
})

const images = [
  { id: "img_1", url: "/media/one.jpg" },
  { id: "img_2", url: "/media/two.jpg" },
  { id: "img_3", url: "/media/three.jpg" },
] as any

test("every image stays in the DOM (desktop slides + mobile track)", () => {
  const { container } = render(<GalleryView images={images} onZoom={() => {}} />)

  for (const img of images) {
    const rendered = container.querySelectorAll(
      `img[src*="${encodeURIComponent(img.url)}"], img[src="${img.url}"]`
    )
    // Present at least twice: once in the desktop stack, once in the mobile
    // track — both live in the DOM and are toggled by CSS breakpoints.
    assert.ok(
      rendered.length >= 2,
      `expected ${img.url} in both desktop and mobile markup`
    )
  }
})

test("dot indicators match the image count", () => {
  render(<GalleryView images={images} onZoom={() => {}} />)
  const dots = within(screen.getByTestId("gallery-dots")).getAllByRole("button")
  assert.equal(dots.length, images.length)
})

test("thumbnail strip renders one thumbnail per image, first active", () => {
  render(<GalleryView images={images} onZoom={() => {}} />)
  const thumbs = within(screen.getByTestId("gallery-thumbnails")).getAllByRole(
    "button"
  )
  assert.equal(thumbs.length, images.length)
  assert.equal(thumbs[0].getAttribute("aria-current"), "true")
  assert.equal(thumbs[1].getAttribute("aria-current"), null)
})

test("single image renders no thumbnails and no dots", () => {
  render(<GalleryView images={[images[0]]} onZoom={() => {}} />)
  assert.equal(screen.queryByTestId("gallery-thumbnails"), null)
  assert.equal(screen.queryByTestId("gallery-dots"), null)
})
