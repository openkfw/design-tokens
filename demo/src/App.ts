;(() => {
  /* ==========================================================
   * Offcanvas / Main Navigation
   * ========================================================== */

  const body = document.body
  const hamburger = document.querySelector(".header__hamburger") as HTMLElement | null
  const dialog = document.getElementById("main-nav") as HTMLDialogElement | null

  const dummyFocus = document.getElementById("dummyFocus") as HTMLDialogElement | null

  if (hamburger && dialog) {
    const dialogContent = dialog.querySelector("[data-dialog-content]") as HTMLElement | null

    const openNav = () => {
      hamburger.setAttribute("aria-expanded", "true")
      body.classList.add("no-scroll")
      dialog.showModal()

      setTimeout(() => {
        dummyFocus?.focus()
      }, 0)
    }

    const closeNav = () => {
      body.classList.remove("no-scroll")
      hamburger.setAttribute("aria-expanded", "false")
      hamburger.focus()
    }

    hamburger.addEventListener("click", openNav)

    dialog.addEventListener("close", closeNav)

    dialog.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null

      if (target === null) return

      if (target.closest("a")) {
        dialog.close()
        return
      }

      if (!dialogContent?.contains(target)) {
        dialog.close()
      }
    })
  }

  /* ==========================================================
   * Sticky Header
   * ========================================================== */

  const header = document.getElementById("sticky-header")
  const STICKY_CLASS = "header--sticky"

  if (header) {
    let ticking = false

    const updateSticky = () => {
      const y = window.scrollY
      const isSticky = header.classList.contains(STICKY_CLASS)

      // Hysterese
      if (y >= 128 && !isSticky) {
        header.classList.add(STICKY_CLASS)
      } else if (y < 64 && isSticky) {
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

    // Initialer Zustand
    updateSticky()
  }
})()
