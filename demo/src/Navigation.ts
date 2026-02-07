export function initializeNavigation(): void {
  const body = document.body
  const hamburger = document.querySelector<HTMLElement>(".header__hamburger")
  const dialog = document.getElementById("main-nav") as HTMLDialogElement | null

  if (!hamburger || !dialog) return

  const dialogContent = dialog.querySelector<HTMLElement>("[data-dialog-content]")

  const openNav = (): void => {
    hamburger.setAttribute("aria-expanded", "true")
    body.classList.add("no-scroll")
    dialog.showModal()
  }

  const closeNav = (): void => {
    body.classList.remove("no-scroll")
    hamburger.setAttribute("aria-expanded", "false")
    hamburger.focus()
  }

  hamburger.addEventListener("click", openNav)

  dialog.addEventListener("close", closeNav)

  dialog.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null

    if (!target) return

    if (target.closest("a")) {
      dialog.close()
      return
    }

    if (!dialogContent?.contains(target)) {
      dialog.close()
    }
  })
}
