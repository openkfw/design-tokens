declare global {
  interface Window {
    allTokens: AllTokens
  }
}

interface TokenValue {
  $description?: string
  $value?: string
  name?: string
}

interface TokenGroup {
  [key: string]: TokenValue | TokenGroup
}

interface AllTokens {
  semantic?: {
    color?: TokenGroup
  }
  base?: {
    color?: TokenGroup
  }
}

function getByPath(obj: TokenGroup, path: string): TokenValue | undefined {
  return path.split(".").reduce<TokenGroup | TokenValue | undefined>((o, k) => {
    if (!o || typeof o !== "object") return undefined
    return o[k as keyof typeof o] as TokenGroup | TokenValue | undefined
  }, obj)
}

function createColorPaletteItem(colorEl: HTMLElement, tokenGroup: string, tokenName: string | undefined): void {
  colorEl.classList.add("color-palette__color")

  const tokenKey = colorEl.dataset.token
  if (!tokenKey) return

  const wrapper = document.createElement("div")
  wrapper.className = "color-palette__item"

  const container = document.createElement("div")
  container.className = "color-palette__container"

  const desc = document.createElement("span")
  desc.className = "color-palette__label form-label"

  const btn = document.createElement("button")
  btn.type = "button"
  btn.role = "link"

  btn.addEventListener("click", () => {
    navigator.clipboard.writeText(`var(--${btn.textContent})`).catch((err) => {
      console.error("Failed to copy to clipboard:", err)
    })
  })

  const tokenColorPath =
    tokenName !== undefined
      ? window.allTokens[tokenGroup as keyof AllTokens]?.color?.[tokenName]
      : window.allTokens[tokenGroup as keyof AllTokens]?.color
  const token = tokenColorPath ? getByPath(tokenColorPath as TokenGroup, tokenKey) : undefined

  desc.textContent = token?.$description || ""
  btn.textContent = token?.name || "var(--kfw-color-fn)"

  colorEl.style.backgroundColor = token?.$value || ""
  colorEl.replaceWith(wrapper)
  wrapper.appendChild(colorEl)
  wrapper.appendChild(container)
  container.appendChild(desc)
  container.appendChild(btn)
}

export function initializeColorPalettes(): void {
  document.querySelectorAll<HTMLElement>(".color-palette").forEach((palette) => {
    const tokenGroup = palette.dataset.group || "semantic"
    const tokenName = palette.dataset.name

    palette.querySelectorAll<HTMLElement>("span[data-token]").forEach((colorEl) => {
      createColorPaletteItem(colorEl, tokenGroup, tokenName)
    })
  })
}
