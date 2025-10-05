// Khởi tạo ứng dụng
function init() {
  updateTheme();
  loadLanguage();
  checkAuth();
  setupEventListeners();
  // Initial load for discover designs
  loadDiscoverDesigns();
}

// Cài đặt event listeners (giữ nguyên logic frontend)
function setupEventListeners() {
  let notificationTimeout;
  document
    .getElementById("notificationBtn")
    ?.addEventListener("mouseenter", () => {
      clearTimeout(notificationTimeout);
      showNotifications();
    });
  document
    .getElementById("notificationBtn")
    ?.addEventListener("mouseleave", () => {
      notificationTimeout = setTimeout(hideNotifications, 300);
    });
  document
    .getElementById("notificationPanel")
    ?.addEventListener("mouseenter", () => {
      clearTimeout(notificationTimeout);
    });
  document
    .getElementById("notificationPanel")
    ?.addEventListener("mouseleave", () => {
      notificationTimeout = setTimeout(hideNotifications, 300);
    });

  document.addEventListener("click", (e) => {
    const searchInput = document.getElementById("designSearchInput");
    const searchHistoryDiv = document.getElementById("searchHistory");
    if (
      searchInput &&
      searchHistoryDiv &&
      !searchInput.contains(e.target) &&
      !searchHistoryDiv.contains(e.target)
    ) {
      searchHistoryDiv.classList.add("hidden");
    }
  });

  document
    .getElementById("designSearchInput")
    ?.addEventListener("input", (e) => {
      const clearBtn = document.getElementById("clearSearchBtn");
      if (clearBtn) {
        if (e.target.value.length > 0) {
          clearBtn.style.display = "block";
        } else {
          clearBtn.style.display = "none";
        }
      }
    });
}

// Toggle dark mode (giữ nguyên logic frontend)
function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  localStorage.setItem("darkMode", isDarkMode);
  updateTheme();
}

// Cập nhật theme (giữ nguyên logic frontend)
function updateTheme() {
  isDarkMode = localStorage.getItem("darkMode") === "true";
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    document.querySelectorAll(".theme-toggle i").forEach((icon) => {
      icon.className = "fas fa-sun";
    });
  } else {
    document.body.classList.remove("dark-mode");
    document.querySelectorAll(".theme-toggle i").forEach((icon) => {
      icon.className = "fas fa-moon";
    });
  }
}

// Thay đổi ngôn ngữ (giữ nguyên logic frontend)
function changeLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem("language", lang);
  updateLanguage();
  document.getElementById("languageSelectPreLogin").value = lang;
  document.getElementById("languageSelectPreLoginMobile").value = lang;
  if (document.getElementById("languageSelectPostLogin")) {
    document.getElementById("languageSelectPostLogin").value = lang;
    document.getElementById("languageSelectPostLoginMobile").value = lang;
  }
  if (currentUser) {
    loadDiscoverDesigns();
    loadLibraryDesigns();
  }
}

// Cập nhật ngôn ngữ (giữ nguyên logic frontend)
function updateLanguage() {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    element.textContent =
      translations[currentLanguage][key] || translations["vi"][key];
  });

  const placeholders = document.querySelectorAll("[data-i18n-ph]");
  placeholders.forEach((element) => {
    const key = element.getAttribute("data-i18n-ph");
    element.placeholder =
      translations[currentLanguage][key] || translations["vi"][key];
  });

  if (currentUser) {
    document.getElementById("userWelcome").textContent = currentUser.name;
  }

  const paginationContainers = document.querySelectorAll(".pagination");
  paginationContainers.forEach((container) => {
    const prevButton = container.querySelector(".pagination-prev");
    const nextButton = container.querySelector(".pagination-next");
    if (prevButton) {
      prevButton.textContent =
        translations[currentLanguage].previous || "Trước";
    }
    if (nextButton) {
      nextButton.textContent = translations[currentLanguage].next || "Sau";
    }
  });
}

// Load ngôn ngữ từ localStorage (giữ nguyên logic frontend)
function loadLanguage() {
  const savedLanguage = localStorage.getItem("language");
  if (savedLanguage) {
    currentLanguage = savedLanguage;
    document.getElementById("languageSelectPreLogin").value = savedLanguage;
    document.getElementById("languageSelectPreLoginMobile").value =
      savedLanguage;
    if (document.getElementById("languageSelectPostLogin")) {
      document.getElementById("languageSelectPostLogin").value = savedLanguage;
      document.getElementById("languageSelectPostLoginMobile").value =
        savedLanguage;
    }
  }
  updateLanguage();
}

// Cuộn đến features (giữ nguyên logic frontend)
function scrollToFeatures() {
  document
    .getElementById("featuresSection")
    .scrollIntoView({ behavior: "smooth" });
}

// Cuộn lên đầu trang (giữ nguyên logic frontend)
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Function to show toast notifications (giữ nguyên logic frontend)
function showToast(type, message) {
  const toastContainer = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.classList.add("toast", type);

  let icon = "";
  if (type === "success") {
    icon = '<i class="fas fa-check-circle icon"></i>';
  } else if (type === "error") {
    icon = '<i class="fas fa-times-circle icon"></i>';
  } else if (type === "info") {
    icon = '<i class="fas fa-info-circle icon"></i>';
  }

  toast.innerHTML = `${icon}<span class="message">${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Function to toggle password visibility (giữ nguyên logic frontend)
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const icon = input.nextElementSibling.querySelector("i");

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

// Function to show confirmation modal (giữ nguyên logic frontend)
function showConfirmationModal(title, message, callback) {
  document.getElementById("confirmationTitle").textContent = title;
  document.getElementById("confirmationMessage").textContent = message;
  confirmationCallback = callback;
  document.getElementById("confirmationModal").classList.remove("hidden");
  updateLanguage();
}

// Function to execute confirmation callback (giữ nguyên logic frontend)
function executeConfirmation() {
  if (confirmationCallback) {
    confirmationCallback();
  }
  closeConfirmationModal();
}

// Function to cancel confirmation (giữ nguyên logic frontend)
function cancelConfirmation() {
  closeConfirmationModal();
}

// Function to close confirmation modal (giữ nguyên logic frontend)
function closeConfirmationModal(event) {
  const modal = document.getElementById("confirmationModal");
  if (event && event.target !== modal) {
    return;
  }
  modal.classList.add("hidden");
  confirmationCallback = null;
}

// Animation khi scroll (giữ nguyên logic frontend)
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = "running";
      observer.unobserve(entry.target);
    }
  });
});

// Khởi tạo khi trang tải (giữ nguyên logic frontend)
window.addEventListener("load", () => {
  init();

  document.querySelectorAll(".stagger-item").forEach((item) => {
    observer.observe(item);
  });

  document.addEventListener("click", (e) => {
    const modals = [
      "loginModal",
      "registerModal",
      "aiAnalysisModal",
      "commentModal",
      "designDetailModal",
      "profileEditModal",
      "forgotPasswordModal",
    ];
    modals.forEach((modalId) => {
      const modal = document.getElementById(modalId);
      if (modal && !modal.classList.contains("hidden") && e.target === modal) {
        modal.classList.add("hidden");
      }
    });
  });
});
