// Shared motion vocabulary for the storefront (see docs/frontend-design.md §Animation).
// Sections use these instead of ad-hoc values so the whole site moves as one system.

export const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** Standard section/element reveal: gentle fade-up, once, on scroll into view. */
export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.5, ease: EASE_OUT },
}

/** Parent container that staggers its fadeUpChild items. */
export const staggerContainer = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, amount: 0.2 },
  variants: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  },
}

/** Child item for staggerContainer. */
export const fadeUpChild = {
  variants: {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: EASE_OUT },
    },
  },
}
