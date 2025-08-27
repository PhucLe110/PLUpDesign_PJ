// Khởi tạo ứng dụng
function init() {
  updateTheme();
  loadLanguage();
  checkAuth();
  setupEventListeners();
}

// Cài đặt event listeners
function setupEventListeners() {
  // Notification hover
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

  // Hide search history when clicking outside
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

  // Show/hide clear search button
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

// Toggle dark mode
function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  localStorage.setItem("darkMode", isDarkMode);
  updateTheme();
}

// Cập nhật theme
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

// Thay đổi ngôn ngữ
function changeLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem("language", lang);
  updateLanguage();
  // Update language selector values
  document.getElementById("languageSelectPreLogin").value = lang;
  document.getElementById("languageSelectPreLoginMobile").value = lang;
  if (document.getElementById("languageSelectPostLogin")) {
    document.getElementById("languageSelectPostLogin").value = lang;
    document.getElementById("languageSelectPostLoginMobile").value = lang;
  }
  // Reload designs to apply new language titles/descriptions
  if (currentUser) {
    loadDiscoverDesigns();
    loadLibraryDesigns();
  }
}

// Cập nhật ngôn ngữ
function updateLanguage() {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    element.textContent =
      translations[currentLanguage][key] || translations["vi"][key];
  });

  // Cập nhật placeholder
  const placeholders = document.querySelectorAll("[data-i18n-ph]");
  placeholders.forEach((element) => {
    const key = element.getAttribute("data-i18n-ph");
    element.placeholder =
      translations[currentLanguage][key] || translations["vi"][key];
  });

  // Cập nhật user welcome (chỉ hiển thị tên)
  if (currentUser) {
    document.getElementById("userWelcome").textContent = currentUser.name;
  }

  // Update pagination button texts
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

// Load ngôn ngữ từ localStorage
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

// Cuộn đến features
function scrollToFeatures() {
  document
    .getElementById("featuresSection")
    .scrollIntoView({ behavior: "smooth" });
}

// Cuộn lên đầu trang
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Function to show toast notifications
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

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Function to toggle password visibility
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const icon = input.nextElementSibling.querySelector("i"); // Assuming the icon is the next sibling's child

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

// Function to show confirmation modal
function showConfirmationModal(title, message, callback) {
  document.getElementById("confirmationTitle").textContent = title;
  document.getElementById("confirmationMessage").textContent = message;
  confirmationCallback = callback;
  document.getElementById("confirmationModal").classList.remove("hidden");
  updateLanguage(); // Update language for confirmation modal buttons
}

// Function to execute confirmation callback
function executeConfirmation() {
  if (confirmationCallback) {
    confirmationCallback();
  }
  closeConfirmationModal();
}

// Function to cancel confirmation
function cancelConfirmation() {
  closeConfirmationModal();
}

// Function to close confirmation modal
function closeConfirmationModal(event) {
  const modal = document.getElementById("confirmationModal");
  // Only close if the click is directly on the modal background
  if (event && event.target !== modal) {
    return;
  }
  modal.classList.add("hidden");
  confirmationCallback = null; // Clear the callback
}

// Animation khi scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = "running";
      observer.unobserve(entry.target);
    }
  });
});

// Khởi tạo khi trang tải
window.addEventListener("load", () => {
  init();

  document.querySelectorAll(".stagger-item").forEach((item) => {
    observer.observe(item);
  });

  // Đóng modal khi click outside
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
