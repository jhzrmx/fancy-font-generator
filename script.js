const inputText = document.getElementById("inputText");
const fontList = document.getElementById("fontList");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");

const alphabet = "abcdefghijklmnopqrstuvwxyz";
const digits = "0123456789";

let fonts = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const convert = (text, font) => {
  let result = "";

  for (const char of text) {
    if (char >= "a" && char <= "z") {
      const i = char.charCodeAt(0) - 97;
      result += font.lowerArr[i] ?? char;

    } else if (char >= "A" && char <= "Z") {
      const i = char.charCodeAt(0) - 65;
      result += font.upperArr[i] ?? char;

    } else if (char >= "0" && char <= "9") {
      const i = char.charCodeAt(0) - 48;
      result += font.digitArr[i] ?? char;

    } else {
      result += char;
    }
  }

  return result;
}

const renderFonts = () => {
  fontList.innerHTML = "";

  const keyword = searchInput.value.toLowerCase();

  fonts
    .filter(f => f.fontName.toLowerCase().includes(keyword))
    .forEach(font => {
      const converted = convert(inputText.value, font);
      const isFav = favorites.includes(font.fontName);

      const card = document.createElement("div");
      card.className = "font-card";

      card.innerHTML = `
        <div class="font-header">
          <span class="font-name">${font.fontName}</span>
          <div class="actions">
            <button class="copy" onclick="copyText(this, '${converted.replace(/'/g, "\\'")}')">📋</button>
            <button class="fav" onclick="toggleFavorite('${font.fontName}')">
              ${isFav ? "★" : "☆"}
            </button>
          </div>
        </div>
        <div class="output">${converted}</div>
      `;

      fontList.appendChild(card);
    });
}

fetch("fonts.json")
  .then(res => res.json())
  .then(data => {
    fonts = data.map(font => ({
      ...font,
      lowerArr: Array.isArray(font.fontLower)
        ? font.fontLower
        : Array.from(font.fontLower || ""),
      upperArr: Array.isArray(font.fontUpper)
        ? font.fontUpper
        : Array.from(font.fontUpper || ""),
      digitArr: Array.isArray(font.fontDigits)
        ? font.fontDigits
        : Array.from(font.fontDigits || "")
    }));

    renderFonts();
  });

const debounce = (fn, delay = 300) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const debouncedRender = debounce(renderFonts, 250);

const copyText = (button, text) => {
  if (!inputText.value) return;
  navigator.clipboard.writeText(text);

  const original = button.textContent;
  button.textContent = "✔️";
  
  setTimeout(() => {
    button.textContent = original;
  }, 1000);
}

const toggleFavorite = (name) => {
  if (favorites.includes(name)) {
    favorites = favorites.filter(f => f !== name);
  } else {
    favorites.push(name);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFonts();
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  themeToggle.textContent =
    document.body.classList.contains("dark") ? "🌙" : "☀️";
});

inputText.addEventListener("input", debouncedRender);
searchInput.addEventListener("input", debouncedRender);