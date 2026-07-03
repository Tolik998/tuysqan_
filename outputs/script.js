const body = document.body;
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const toggle = document.querySelector("[data-menu-toggle]");
const cursor = document.querySelector(".cursor");
const statusText = document.querySelector("[data-status-text]");
const statusDot = document.querySelector("[data-status-dot]");

const choices = {
  rolls: {
    image: "./assets/images/rolls-set.webp",
    label: "Свежая сборка",
    title: "Роллы для обеда, вечера и доставки.",
    text: "Сеты с нежным сыром, овощами, рыбой и горячими позициями, которые удобно взять на компанию.",
  },
  pizza: {
    image: "./assets/images/pizza-combo.webp",
    label: "Горячая пицца",
    title: "Сытный вариант для семьи, офиса и друзей.",
    text: "Классическая подача, хрустящий борт, расплавленный сыр и понятный вкус без лишней церемонии.",
  },
  combo: {
    image: "./assets/images/hero-tuysqan.webp",
    label: "На компанию",
    title: "Комбо, которое легко взять на общий стол.",
    text: "Соберите роллы, пиццу и напитки в один заказ, а администратор подскажет актуальные позиции.",
  },
};

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function updateStatus() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const open = 9 * 60;
  const close = 23 * 60 + 30;
  const isOpen = minutes >= open && minutes < close;

  statusText.textContent = isOpen ? "Открыто до 23:30" : "Откроется в 09:00";
  statusDot.classList.toggle("is-closed", !isOpen);
}

toggle?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("nav-open");
  toggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    body.classList.remove("nav-open");
    toggle?.setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll("[data-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.choice;
    const data = choices[key];
    const image = document.querySelector("[data-choice-image]");
    const copy = document.querySelector("[data-choice-copy]");

    document.querySelectorAll("[data-choice]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });

    image.src = data.image;
    copy.innerHTML = `
      <p class="choice-label">${data.label}</p>
      <h3>${data.title}</h3>
      <p>${data.text}</p>
      <a href="#contacts">Заказать</a>
    `;
  });
});

const preview = document.querySelector("[data-menu-preview]");
const previewImg = preview?.querySelector("img");

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && preview && previewImg) {
  document.querySelectorAll("[data-img]").forEach((row) => {
    row.addEventListener("mouseenter", () => {
      previewImg.src = row.dataset.img;
      preview.classList.add("is-visible");
    });

    row.addEventListener("mousemove", (event) => {
      preview.style.left = `${event.clientX}px`;
      preview.style.top = `${event.clientY}px`;
    });

    row.addEventListener("mouseleave", () => {
      preview.classList.remove("is-visible");
    });
  });
}

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && cursor) {
  window.addEventListener("mousemove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.style.opacity = "1";
  });

  document.querySelectorAll("a, button, .menu-row").forEach((item) => {
    item.addEventListener("mouseenter", () => cursor.classList.add("is-active"));
    item.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
  });
}

document.querySelectorAll(".magnetic").forEach((item) => {
  item.addEventListener("mousemove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
  });

  item.addEventListener("mouseleave", () => {
    item.style.transform = "";
  });
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();
updateStatus();
