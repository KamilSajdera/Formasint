const headerLogo = document.querySelector(".header-logo");
const menuHamburger = document.querySelector(".header-hamburger");
const hamburgerLines = document.querySelector(".hamburger-lines");
const productsListingDropdown = document.querySelector(".number-dropdown");
const productsListingItems = document.querySelector(".list-items");

const pageSizeOptions =
  productsListingDropdown.querySelectorAll(".dropdown-option");

let fetchedProductsListing = [];
let pageNr = 1;
let pageSize = 14;
let isLoading = false;
let hasMoreProducts = true;

document.addEventListener("click", (e) => {
  // Zamyka menu, jesli uzytkownik kliknie poza .nav-list
  // LUB kliknie bezposrednio w .list-item (czyli wybral opcje w menu)
  // (moze sie zdarzyc, ze user kliknie w .nav-list, ale NIE TRAFI w opcje - wtedy nie chcemy zamykac menu)
  // (scenariusz malo prawdopodobny zwazywszy na maly margin miedzy opcjami, lecz nie jest to niemozliwe ;) )

  const isMenuOpen = hamburgerLines.classList.contains("menu-open");
  if (!isMenuOpen) return;

  const navList = document.querySelector(".nav-list");

  const clickedInsideNavList = navList.contains(e.target);
  const clickedListItem = e.target.closest(".list-item");

  if (!clickedInsideNavList || clickedListItem) {
    toggleMenu(false);
  }
});

headerLogo.addEventListener("mouseenter", () => {
  headerLogo.querySelector("img").src = "assets/FORMA_ICON_FILL.webp";
});

headerLogo.addEventListener("mouseleave", () => {
  headerLogo.querySelector("img").src = "assets/FORMA_ICON.webp";
});

menuHamburger.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu(true);
});

function toggleMenu(isOpen) {
  const classAction = isOpen ? "add" : "remove";

  hamburgerLines.classList[classAction]("menu-open");
  document.querySelector(".header-nav").classList[classAction]("menu-open");
  document.querySelector(".menu-overlay").classList[classAction]("menu-open");
}

productsListingDropdown.addEventListener("click", () => {
  productsListingDropdown.classList.add("dropdown-active");
});

pageSizeOptions.forEach((option) => {
  option.addEventListener("click", setProductsPerPage);
});

function setProductsPerPage(e) {
  e.stopPropagation();

  let newPageSize = +e.target.textContent;
  pageSize = newPageSize;
  pageNr = 1;
  hasMoreProducts = true;
  
  let availableSizes = [14, 24, 36].filter((item) => item !== pageSize);

  document.querySelector(".number-dropdown_number").innerText = pageSize;
  document.querySelectorAll(".dropdown-option")[0].innerText =
    availableSizes[0];
  document.querySelectorAll(".dropdown-option")[1].innerText =
    availableSizes[1];
  productsListingDropdown.classList.remove("dropdown-active");

  initProducts();
}

async function fetchListOfProducts() {
  isLoading = true;
  const response = await fetch(
    `https://brandstestowy.smallhost.pl/api/random?pageNumber=${pageNr}&pageSize=${pageSize}`
  );

  const results = await response.json();
  const newProducts = results.data;

  if (newProducts.length < pageSize) hasMoreProducts = fale;

  const existingIds = new Set(fetchedProductsListing.map((id) => id.id));
  const uniqueNewProducts = newProducts.filter(item => !existingIds.has(item.id))
  fetchedProductsListing = [...fetchedProductsListing, ...uniqueNewProducts];

  isLoading = false;
}

async function initProducts() {
  if (isLoading || !hasMoreProducts) return;

  await fetchListOfProducts();

  if (fetchedProductsListing.length > 0) {
    generateListingItems();
    injectBanner();
  } else {
    console.warn("Brak produktów w nieskończonej liście!");
  }
}

function generateListingItems() {
  const renderedCount = productsListingItems.querySelectorAll(".products-list_item").length;
  const totalFetched = fetchedProductsListing.length;

  if (renderedCount > totalFetched) {
    productsListingItems.innerHTML = "";
    generateListingItems();
    return;
  }

  fetchedProductsListing.slice(renderedCount).forEach((product) => {
    const div = document.createElement("div");
    div.classList.add("products-list_item");
    div.innerHTML = `<div class="item-id">ID: ${product.id}</div>
          <img
            src=${product.image}
            alt=${product.text}
            class="item-image"
          />
        </div>`;

    div.addEventListener("click", showPopup);
    productsListingItems.appendChild(div);
  });
}

function injectBanner() {
  /// to sprawia ze banner renderowany jest tylko raz
  if (productsListingItems.querySelector(".banner") !== null) {
    return;
  }

  const productsItems = productsListingItems.querySelectorAll(
    ".products-list_item"
  );

  const banner = document.createElement("div");
  banner.classList.add("banner");

  banner.innerHTML = `<p class="banner-p">Forma’sint.</p>
          <h3>You'll look and feel like the champion.</h3>
          <button class="banner-btn">
            Check this out <img src="assets/BTN_ARROW.webp" alt="Arrow right" />
          </button>`;

  let insertIndex = 3;

  if (window.innerWidth < 768) {
    insertIndex = 4;
  }

  if (window.innerWidth >= 1300) {
    insertIndex = 5;
  }

  const referenceItem = productsItems[insertIndex];

  productsListingItems.insertBefore(banner, referenceItem);
}

function showPopup(event) {
  const popup = document.querySelector(".pop-up");
  popup.style.display = "block";

  const clickedId = event.currentTarget.querySelector(".item-id").textContent;

  popup.querySelector(".pop-up_text").textContent = clickedId;

  popup.querySelector(
    ".pop-up_preview"
  ).innerHTML = `<img src="${event.target.src}" alt="Jacket image ${clickedId}"/>`;
}

window.addEventListener("scroll", () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const nearBottom = document.body.offsetHeight - 300;

  if (scrollPosition >= nearBottom && !isLoading) {
    pageNr += 1;
    initProducts();
  }
});

document.querySelector(".pop-up_close").addEventListener("click", () => {
  document.querySelector(".pop-up").style.display = "none";
});

initProducts();

const swiper = new Swiper(".swiper", {
  slidesPerView: "auto",
  loop: true,
  spaceBetween: 0,
  pagination: {
    el: ".swiper-pagination",
    type: "progressbar",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
  },
});
