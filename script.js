// Sistema de navegação por cliques (sem scroll)
class SectionNavigator {
  constructor() {
    this.sections = document.querySelectorAll(".section, .hero")
    this.navLinks = document.querySelectorAll(".nav-link")
    this.currentSection = 0
    this.isAnimating = false
    this.sectionNames = ["Home", "Blog", "Loja", "Profissionais", "Exercícios"]

    this.init()
  }

  init() {
    // Configurar seções iniciais
    this.sections.forEach((section, index) => {
      if (index === 0) {
        section.classList.add("active")
      } else {
        section.classList.remove("active")
      }
    })

    // Event listeners para navegação
    this.navLinks.forEach((link, index) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        this.navigateToSection(index)
      })
    })

    // Navegação por teclado
    document.addEventListener("keydown", (e) => {
      if (this.isAnimating) return

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          this.nextSection()
          break
        case "ArrowLeft":
        case "ArrowUp":
          this.prevSection()
          break
        case "Home":
          this.navigateToSection(0)
          break
        case "End":
          this.navigateToSection(this.sections.length - 1)
          break
        case "Escape":
          const cart = window.cart // Declare the cart variable here
          if (cart && cart.isModalOpen) {
            cart.closeModal()
          }
          break
      }
    })

    // Controles de navegação
    document.getElementById("prevBtn").addEventListener("click", () => this.prevSection())
    document.getElementById("nextBtn").addEventListener("click", () => this.nextSection())

    // Atualizar interface inicial
    this.updateInterface()
  }

  navigateToSection(targetIndex) {
    if (
      this.isAnimating ||
      targetIndex === this.currentSection ||
      targetIndex < 0 ||
      targetIndex >= this.sections.length
    )
      return

    this.isAnimating = true

    // Remover classe active da seção atual
    this.sections[this.currentSection].classList.remove("active")

    // Adicionar classe prev se indo para trás
    if (targetIndex < this.currentSection) {
      this.sections[targetIndex].classList.add("prev")
    } else {
      this.sections[targetIndex].classList.remove("prev")
    }

    // Pequeno delay para suavizar transição
    setTimeout(() => {
      this.sections[targetIndex].classList.add("active")
      this.sections[targetIndex].classList.remove("prev")

      // Atualizar navegação ativa
      this.updateActiveNav(targetIndex)
      this.currentSection = targetIndex
      this.updateInterface()

      setTimeout(() => {
        this.isAnimating = false
      }, 500)
    }, 50)
  }

  nextSection() {
    const next = (this.currentSection + 1) % this.sections.length
    this.navigateToSection(next)
  }

  prevSection() {
    const prev = (this.currentSection - 1 + this.sections.length) % this.sections.length
    this.navigateToSection(prev)
  }

  updateActiveNav(activeIndex) {
    this.navLinks.forEach((link, index) => {
      link.classList.toggle("active", index === activeIndex)
    })
  }

  updateInterface() {
    // Atualizar breadcrumb
    const currentSectionElement = document.getElementById("currentSection")
    const sectionNumberElement = document.getElementById("sectionNumber")
    const totalSectionsElement = document.getElementById("totalSections")

    if (currentSectionElement) {
      currentSectionElement.textContent = this.sectionNames[this.currentSection]
    }
    if (sectionNumberElement) {
      sectionNumberElement.textContent = this.currentSection + 1
    }
    if (totalSectionsElement) {
      totalSectionsElement.textContent = this.sections.length
    }

    // Atualizar botões de navegação
    const prevBtn = document.getElementById("prevBtn")
    const nextBtn = document.getElementById("nextBtn")

    if (prevBtn) {
      prevBtn.disabled = this.currentSection === 0
    }
    if (nextBtn) {
      nextBtn.disabled = this.currentSection === this.sections.length - 1
    }
  }
}

// Sistema de Carrinho de Compras
class ShoppingCart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem("nutrein_cart")) || []
    this.isModalOpen = false
    this.init()
  }

  init() {
    // Event listeners
    document.getElementById("cartBtn").addEventListener("click", () => this.toggleModal())
    document.getElementById("closeCart").addEventListener("click", () => this.closeModal())
    document.getElementById("clearCart").addEventListener("click", () => this.clearCart())
    document.getElementById("checkout").addEventListener("click", () => this.checkout())

    // Event listeners para produtos
    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", (e) => this.addToCart(e))
    })

    // Event listeners para controles de quantidade
    document.querySelectorAll(".qty-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.updateQuantity(e))
    })

    // Fechar modal clicando fora
    document.getElementById("cartModal").addEventListener("click", (e) => {
      if (e.target.id === "cartModal") {
        this.closeModal()
      }
    })

    this.updateCartDisplay()
  }

  addToCart(e) {
    const btn = e.target.closest(".add-to-cart")
    const productId = btn.dataset.id
    const productName = btn.dataset.name
    const productPrice = Number.parseFloat(btn.dataset.price)
    const productStock = Number.parseInt(btn.dataset.stock)
    const productImage = btn.dataset.image
    const quantityElement = document.querySelector(`.quantity[data-product="${productId}"]`)
    const quantity = Number.parseInt(quantityElement.textContent)

    // Verificar estoque
    const currentItem = this.items.find((item) => item.id === productId)
    const currentQuantity = currentItem ? currentItem.quantity : 0

    if (currentQuantity + quantity > productStock) {
      this.showNotification("Quantidade indisponível em estoque!", "error")
      return
    }

    // Adicionar ou atualizar item
    const existingItemIndex = this.items.findIndex((item) => item.id === productId)

    if (existingItemIndex > -1) {
      this.items[existingItemIndex].quantity += quantity
    } else {
      this.items.push({
        id: productId,
        name: productName,
        price: productPrice,
        quantity: quantity,
        image: productImage,
        stock: productStock,
      })
    }

    // Resetar quantidade do produto
    quantityElement.textContent = "1"

    this.saveCart()
    this.updateCartDisplay()
    this.showNotification(`${productName} adicionado ao carrinho!`, "success")

    // Animação do botão
    btn.style.transform = "scale(0.95)"
    setTimeout(() => {
      btn.style.transform = "scale(1)"
    }, 150)
  }

  updateQuantity(e) {
    const btn = e.target
    const productId = btn.dataset.product
    const quantityElement = document.querySelector(`.quantity[data-product="${productId}"]`)
    const isPlus = btn.classList.contains("plus")
    const isMinus = btn.classList.contains("minus")

    let currentQuantity = Number.parseInt(quantityElement.textContent)

    if (isPlus) {
      const productCard = btn.closest(".product-card")
      const stockElement = productCard.querySelector(".stock-count")
      const maxStock = Number.parseInt(stockElement.textContent)

      if (currentQuantity < maxStock) {
        currentQuantity++
      } else {
        this.showNotification("Quantidade máxima atingida!", "warning")
        return
      }
    } else if (isMinus && currentQuantity > 1) {
      currentQuantity--
    }

    quantityElement.textContent = currentQuantity

    // Animação
    quantityElement.style.transform = "scale(1.2)"
    setTimeout(() => {
      quantityElement.style.transform = "scale(1)"
    }, 150)
  }

  updateCartQuantity(productId, newQuantity) {
    const itemIndex = this.items.findIndex((item) => item.id === productId)

    if (itemIndex > -1) {
      if (newQuantity <= 0) {
        this.items.splice(itemIndex, 1)
      } else {
        // Verificar estoque
        const item = this.items[itemIndex]
        if (newQuantity > item.stock) {
          this.showNotification("Quantidade indisponível em estoque!", "error")
          return
        }
        this.items[itemIndex].quantity = newQuantity
      }

      this.saveCart()
      this.updateCartDisplay()
      this.renderCartItems()
    }
  }

  removeFromCart(productId) {
    this.items = this.items.filter((item) => item.id !== productId)
    this.saveCart()
    this.updateCartDisplay()
    this.renderCartItems()
    this.showNotification("Item removido do carrinho!", "info")
  }

  clearCart() {
    if (this.items.length === 0) return

    if (confirm("Tem certeza que deseja limpar o carrinho?")) {
      this.items = []
      this.saveCart()
      this.updateCartDisplay()
      this.renderCartItems()
      this.showNotification("Carrinho limpo!", "info")
    }
  }

  toggleModal() {
    if (this.isModalOpen) {
      this.closeModal()
    } else {
      this.openModal()
    }
  }

  openModal() {
    const modal = document.getElementById("cartModal")
    modal.classList.add("active")
    this.isModalOpen = true
    this.renderCartItems()
    document.body.style.overflow = "hidden"
  }

  closeModal() {
    const modal = document.getElementById("cartModal")
    modal.classList.remove("active")
    this.isModalOpen = false
    document.body.style.overflow = ""
  }

  renderCartItems() {
    const cartItemsContainer = document.getElementById("cartItems")

    if (this.items.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart"></i>
          <p>Seu carrinho está vazio</p>
          <button class="btn btn-primary" onclick="window.navigator.navigateToSection(2); window.cart.closeModal()">Ir às Compras</button>
        </div>
      `
      return
    }

    cartItemsContainer.innerHTML = this.items
      .map(
        (item) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <div class="cart-item-price">R$ ${item.price.toFixed(2).replace(".", ",")}</div>
        </div>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" onclick="window.cart.updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
          <span class="cart-item-quantity">${item.quantity}</span>
          <button class="cart-qty-btn" onclick="window.cart.updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
          <button class="remove-item" onclick="window.cart.removeFromCart('${item.id}')" title="Remover item">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `,
      )
      .join("")
  }

  updateCartDisplay() {
    const cartCount = document.getElementById("cartCount")
    const cartTotal = document.getElementById("cartTotal")

    const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    cartCount.textContent = totalItems
    cartCount.classList.toggle("hidden", totalItems === 0)

    if (cartTotal) {
      cartTotal.textContent = totalPrice.toFixed(2).replace(".", ",")
    }

    // Animação do contador
    if (totalItems > 0) {
      cartCount.style.animation = "pulse 0.3s ease-in-out"
      setTimeout(() => {
        cartCount.style.animation = ""
      }, 300)
    }
  }

  checkout() {
    if (this.items.length === 0) {
      this.showNotification("Carrinho vazio!", "warning")
      return
    }

    const total = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0)

    if (confirm(`Finalizar compra?\n\n${itemCount} itens\nTotal: R$ ${total.toFixed(2).replace(".", ",")}`)) {
      // Simular processamento
      this.showNotification("Processando pedido...", "info")

      setTimeout(() => {
        this.items = []
        this.saveCart()
        this.updateCartDisplay()
        this.renderCartItems()
        this.closeModal()
        this.showNotification("Pedido realizado com sucesso! 🎉", "success")
      }, 2000)
    }
  }

  saveCart() {
    localStorage.setItem("nutrein_cart", JSON.stringify(this.items))
  }

  showNotification(message, type = "info") {
    // Remover notificação existente
    const existingNotification = document.querySelector(".notification")
    if (existingNotification) {
      existingNotification.remove()
    }

    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
      <i class="fas fa-${this.getNotificationIcon(type)}"></i>
      <span>${message}</span>
    `

    // Estilos da notificação
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${this.getNotificationColor(type)};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.2);
      z-index: 3000;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `

    document.body.appendChild(notification)

    // Animação de entrada
    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    // Remover após 3 segundos
    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 3000)
  }

  getNotificationIcon(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle",
    }
    return icons[type] || "info-circle"
  }

  getNotificationColor(type) {
    const colors = {
      success: "#28a745",
      error: "#dc3545",
      warning: "#ffc107",
      info: "#17a2b8",
    }
    return colors[type] || "#17a2b8"
  }
}

// Sistema de Filtros da Loja
class ShopFilters {
  constructor() {
    this.init()
  }

  init() {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.filterProducts(e))
    })
  }

  filterProducts(e) {
    const filterBtn = e.target.closest(".filter-btn")
    const filter = filterBtn.dataset.filter

    // Atualizar botão ativo
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    filterBtn.classList.add("active")

    // Filtrar produtos
    const products = document.querySelectorAll(".product-card")

    products.forEach((product) => {
      const category = product.dataset.category

      if (filter === "all" || category === filter) {
        product.classList.remove("hidden")
        product.style.display = "block"
      } else {
        product.classList.add("hidden")
        setTimeout(() => {
          product.style.display = "none"
        }, 300)
      }
    })

    // Animação dos filtros
    filterBtn.style.transform = "scale(0.95)"
    setTimeout(() => {
      filterBtn.style.transform = "scale(1)"
    }, 150)
  }
}

// Menu mobile
const hamburger = document.querySelector(".hamburger")
const navMenu = document.querySelector(".nav-menu")

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active")
  navMenu.classList.toggle("active")
})

// Fechar menu ao clicar em um link
document.querySelectorAll(".nav-link").forEach((n) =>
  n.addEventListener("click", () => {
    hamburger.classList.remove("active")
    navMenu.classList.remove("active")
  }),
)

// Animações de entrada dos elementos
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1"
      entry.target.style.transform = "translateY(0)"
    }
  })
}, observerOptions)

// Observar elementos para animação
document.querySelectorAll(".blog-card, .product-card, .professional-card, .exercise-card").forEach((el) => {
  el.style.opacity = "0"
  el.style.transform = "translateY(30px)"
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
  observer.observe(el)
})

// Efeito de digitação no título principal
function typeWriter(element, text, speed = 100) {
  let i = 0
  element.innerHTML = ""

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i)
      i++
      setTimeout(type, speed)
    }
  }

  type()
}

// Inicializar tudo quando a página carregar
window.addEventListener("load", () => {
  // Inicializar navegador de seções
  window.navigator = new SectionNavigator()

  // Inicializar carrinho de compras
  window.cart = new ShoppingCart()

  // Inicializar filtros da loja
  window.shopFilters = new ShopFilters()

  // Efeito de digitação no título
  const heroTitle = document.querySelector(".hero-title")
  if (heroTitle) {
    const originalText = heroTitle.textContent
    setTimeout(() => {
      typeWriter(heroTitle, originalText, 50)
    }, 500)
  }

  console.log("🚀 Nutrein website loaded successfully!")
  console.log("🛒 Sistema de carrinho ativo!")
  console.log("⌨️ Use as setas ← → ou clique na navegação!")
})

// Acessibilidade: navegação por teclado
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navMenu.classList.contains("active")) {
    hamburger.classList.remove("active")
    navMenu.classList.remove("active")
  }
})

// Prevenção de scroll acidental
document.addEventListener(
  "wheel",
  (e) => {
    // Permitir scroll apenas dentro do modal do carrinho
    if (!e.target.closest(".cart-modal") && !e.target.closest(".section.active")) {
      e.preventDefault()
    }
  },
  { passive: false },
)

document.addEventListener(
  "touchmove",
  (e) => {
    if (!e.target.closest(".cart-modal") && !e.target.closest(".section.active")) {
      e.preventDefault()
    }
  },
  { passive: false },
)
