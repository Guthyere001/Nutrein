// Sistema de navegação por cliques (sem scroll)
class SectionNavigator {
  constructor() {
    this.sections = document.querySelectorAll(".section, .hero")
    this.navLinks = document.querySelectorAll(".nav-link")
    this.currentSection = 0
    this.isAnimating = false

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
      }
    })

    // Botões de navegação nos cards
    this.setupCardNavigation()
  }

  navigateToSection(targetIndex) {
    if (this.isAnimating || targetIndex === this.currentSection) return

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

  setupCardNavigation() {
    // Botões "Ver mais" no blog levam para próxima seção
    document.querySelectorAll(".read-more").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault()
        this.nextSection()
      })
    })

    // Botões "Ver Produtos" levam para loja
    document.querySelectorAll(".product-card .btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault()
        this.navigateToSection(2) // Seção loja
      })
    })

    // Botões "Ver Treinos" levam para exercícios
    document.querySelectorAll(".exercise-card .btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault()
        this.navigateToSection(4) // Seção exercícios
      })
    })
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

// Contador animado para estatísticas
function animateCounter(element, target, duration = 2000) {
  let start = 0
  const increment = target / (duration / 16)

  function updateCounter() {
    start += increment
    if (start < target) {
      element.textContent = Math.floor(start)
      requestAnimationFrame(updateCounter)
    } else {
      element.textContent = target
    }
  }

  updateCounter()
}

// Partículas de fundo animadas
function createParticles() {
  const particlesContainer = document.createElement("div")
  particlesContainer.className = "particles-container"
  particlesContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
  `

  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("div")
    particle.className = "particle"
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      background: ${["#26619c", "#8A2BE2", "#4169E1", "#1E90FF"][Math.floor(Math.random() * 4)]};
      border-radius: 50%;
      opacity: ${Math.random() * 0.5 + 0.2};
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float ${Math.random() * 10 + 5}s infinite linear;
    `
    particlesContainer.appendChild(particle)
  }

  document.body.appendChild(particlesContainer)
}

// CSS para animação das partículas
const particleStyles = document.createElement("style")
particleStyles.textContent = `
  @keyframes float {
    0% {
      transform: translateY(100vh) rotate(0deg);
    }
    100% {
      transform: translateY(-100vh) rotate(360deg);
    }
  }
`
document.head.appendChild(particleStyles)

// Indicador de seção atual
function createSectionIndicator() {
  const indicator = document.createElement("div")
  indicator.className = "section-indicator"
  indicator.style.cssText = `
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `

  const sections = ["Home", "Blog", "Loja", "Profissionais", "Exercícios"]
  sections.forEach((name, index) => {
    const dot = document.createElement("div")
    dot.className = "indicator-dot"
    dot.title = name
    dot.style.cssText = `
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    `

    if (index === 0) {
      dot.style.background = "var(--accent-color)"
      dot.style.borderColor = "var(--primary-color)"
    }

    dot.addEventListener("click", () => {
      navigator.navigateToSection(index)
      updateIndicator(index)
    })

    indicator.appendChild(dot)
  })

  document.body.appendChild(indicator)
  return indicator
}

function updateIndicator(activeIndex) {
  const dots = document.querySelectorAll(".indicator-dot")
  dots.forEach((dot, index) => {
    if (index === activeIndex) {
      dot.style.background = "var(--accent-color)"
      dot.style.borderColor = "var(--primary-color)"
      dot.style.transform = "scale(1.2)"
    } else {
      dot.style.background = "rgba(255, 255, 255, 0.3)"
      dot.style.borderColor = "transparent"
      dot.style.transform = "scale(1)"
    }
  })
}

// Inicializar tudo quando a página carregar
window.addEventListener("load", () => {
  // Inicializar navegador de seções
  window.navigator = new SectionNavigator()

  // Criar partículas de fundo
  createParticles()

  // Criar indicador de seções
  const indicator = createSectionIndicator()

  // Atualizar indicador quando navegar
  const originalNavigate = window.navigator.navigateToSection
  window.navigator.navigateToSection = function (targetIndex) {
    originalNavigate.call(this, targetIndex)
    updateIndicator(targetIndex)
  }

  // Efeito de digitação no título
  const heroTitle = document.querySelector(".hero-title")
  if (heroTitle) {
    const originalText = heroTitle.textContent
    setTimeout(() => {
      typeWriter(heroTitle, originalText, 50)
    }, 500)
  }

  console.log("🚀 Nutrein website loaded successfully!")
  console.log("💡 Use as setas do teclado ou clique na navegação para navegar!")
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
    e.preventDefault()
  },
  { passive: false },
)

document.addEventListener(
  "touchmove",
  (e) => {
    if (e.target.closest(".section")) {
      // Permitir scroll dentro das seções se necessário
      return
    }
    e.preventDefault()
  },
  { passive: false },
)
