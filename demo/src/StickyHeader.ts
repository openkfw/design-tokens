const STICKY_CLASS = "header--sticky"
const STICKY_THRESHOLD_APPLY = 128 // Scroll position to apply sticky header
const STICKY_THRESHOLD_REMOVE = 64 // Scroll position to remove sticky header (hysteresis)

export function initializeStickyHeader(): void {
  const header = document.getElementById("sticky-header")

  if (!header) return

  let ticking = false

  const updateSticky = (): void => {
    const y = window.scrollY
    const isSticky = header.classList.contains(STICKY_CLASS)

    // Hysteresis to prevent flickering when scrolling near threshold
    if (y >= STICKY_THRESHOLD_APPLY && !isSticky) {
      header.classList.add(STICKY_CLASS)
    } else if (y < STICKY_THRESHOLD_REMOVE && isSticky) {
      header.classList.remove(STICKY_CLASS)
    }
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateSticky()
          ticking = false
        })
        ticking = true
      }
    },
    { passive: true }
  )

  // Set initial state
  updateSticky()
}
