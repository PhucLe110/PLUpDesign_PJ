// Hiển thị modal đăng nhập
function showLoginModal() {
  document.getElementById("loginModal").classList.remove("hidden");
  document.getElementById("registerModal").classList.add("hidden");
  document.getElementById("forgotPasswordModal").classList.add("hidden"); // Ensure forgot password modal is hidden
}

// Hiển thị modal đăng ký
function showRegisterModal() {
  document.getElementById("registerModal").classList.remove("hidden");
  document.getElementById("loginModal").classList.add("hidden");
  document.getElementById("forgotPasswordModal").classList.add("hidden"); // Ensure forgot password modal is hidden
}

// Đóng modal
function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

// Toggle mobile menu
function toggleMobileMenu(view) {
  const mobileMenuId =
    view === "preLogin" ? "mobileMenuPreLogin" : "mobileMenuPostLogin";
  const mobileMenu = document.getElementById(mobileMenuId);
  mobileMenu.classList.toggle("active");
}

// Hiển thị thông báo
function showNotifications() {
  document.getElementById("notificationPanel").classList.add("active");
  renderNotifications();
}

// Ẩn thông báo
function hideNotifications() {
  document.getElementById("notificationPanel").classList.remove("active");
}

// Helper function to format time ago
function formatTimeAgo(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000; // years
  if (interval > 1) {
    return (
      Math.floor(interval) +
      " " +
      (translations[currentLanguage].yearsAgo || "năm trước")
    );
  }
  interval = seconds / 2592000; // months
  if (interval > 1) {
    return (
      Math.floor(interval) +
      " " +
      (translations[currentLanguage].monthsAgo || "tháng trước")
    );
  }
  interval = seconds / 604800; // weeks
  if (interval > 1) {
    return (
      Math.floor(interval) +
      " " +
      (translations[currentLanguage].weeksAgo || "tuần trước")
    );
  }
  interval = seconds / 86400; // days
  if (interval > 1) {
    return (
      Math.floor(interval) +
      " " +
      (translations[currentLanguage].daysAgo || "ngày trước")
    );
  }
  interval = seconds / 3600; // hours
  if (interval > 1) {
    return (
      Math.floor(interval) +
      " " +
      (translations[currentLanguage].hoursAgo || "giờ trước")
    );
  }
  interval = seconds / 60; // minutes
  if (interval > 1) {
    return (
      Math.floor(interval) +
      " " +
      (translations[currentLanguage].minutesAgo || "phút trước")
    );
  }
  return translations[currentLanguage].justNow || "Vừa xong";
}

// Render notifications
function renderNotifications() {
  const notificationList = document.getElementById("notificationList");
  if (!notificationList) return;
  notificationList.innerHTML = "";

  if (notifications.length === 0) {
    notificationList.innerHTML = `
          <p class="text-sm text-custom-secondary text-center py-4">${
            translations[currentLanguage].noNewNotifications ||
            "Không có thông báo mới."
          }</p>
      `;
  } else {
    notifications.forEach((notif) => {
      const div = document.createElement("div");
      div.className = `p-2 ${notif.bgColor} rounded-lg cursor-pointer hover:opacity-80`;
      div.onclick = () => {
        if (notif.designId) {
          showDesignDetailModal(notif.designId); // Show design detail on click
        }
        hideNotifications(); // Hide panel after clicking a notification
      };
      div.innerHTML = `
              <p class="text-sm text-custom-primary" data-i18n="${
                notif.messageKey
              }">${
        translations[currentLanguage][notif.messageKey] || notif.messageKey
      }</p>
              <span class="text-xs text-custom-secondary">${formatTimeAgo(
                notif.time
              )}</span>
          `;
      notificationList.appendChild(div);
    });
  }
  document.getElementById("notificationCount").textContent =
    notifications.length; // Update count
}

// Mark all notifications as read (clear them)
function markAllNotificationsAsRead() {
  const notificationList = document.getElementById("notificationList");
  if (notificationList) {
    notificationList.innerHTML = `
              <p class="text-sm text-custom-secondary text-center py-4">${
                translations[currentLanguage].noNewNotifications ||
                "Không có thông báo mới."
              }</p>
          `;
  }
  document.getElementById("notificationCount").textContent = "0";
  showToast(
    "success",
    translations[currentLanguage].allNotificationsRead ||
      "Đã đánh dấu tất cả thông báo là đã đọc."
  );
}

// Cập nhật hiển thị người dùng (avatar, tên)
function updateUserDisplay() {
  if (currentUser) {
    document.getElementById("userWelcome").textContent = currentUser.name;
    const userAvatarElement = document.getElementById("userAvatar");
    if (userAvatarElement) {
      userAvatarElement.innerHTML = `<img src="${currentUser.avatar}" alt="Avatar" class="w-full h-full rounded-full object-cover">`;
    }
  }
}

// Chuyển tab
function showTab(tabName) {
  // Ẩn tất cả các tab
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.add("hidden");
  });

  // Hiển thị tab được chọn
  document.getElementById(tabName + "Tab").classList.remove("hidden");

  // Cập nhật active tab
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("tab-active", "text-purple-600");
    tab.classList.add("text-custom-primary");
  });
  const activeTabButton = document.querySelector(
    `.tab[onclick="showTab('${tabName}')"]`
  );
  if (activeTabButton) {
    activeTabButton.classList.add("tab-active", "text-purple-600");
    activeTabButton.classList.remove("text-custom-primary");
  }

  // Reset upload form if switching to upload tab
  if (tabName === "upload") {
    document.getElementById("designTitle").value = "";
    document.getElementById("designDescription").value = "";
    document.getElementById("designUpload").value = "";
    document.getElementById("fileNameDisplay").textContent = "";
  }

  // Load dữ liệu khi chuyển tab
  if (tabName === "discover") {
    loadDiscoverDesigns();
  } else if (tabName === "library") {
    filterLibrary("all"); // Mặc định hiển thị tất cả trong thư viện
  }
}

// Render pagination buttons
function renderPagination(totalPages, currentPage, elementId, callback) {
  const paginationContainer = document.getElementById(elementId);
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  const isMobile = window.innerWidth <= 768;
  const maxPagesToShow = isMobile ? 3 : 5; // Max number of page buttons to show (e.g., 1, 2, 3, ..., Last)
  let startPage, endPage;

  if (totalPages <= maxPagesToShow) {
    // Less than maxPagesToShow total pages so show all
    startPage = 1;
    endPage = totalPages;
  } else {
    // More than maxPagesToShow total pages so calculate start and end pages
    const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
    const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;

    if (currentPage <= maxPagesBeforeCurrentPage) {
      // current page near the start
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
      // current page near the end
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      // current page somewhere in the middle
      startPage = currentPage - maxPagesBeforeCurrentPage;
      endPage = currentPage + maxPagesAfterCurrentPage;
    }
  }

  // Previous button
  const prevButton = document.createElement("button");
  prevButton.textContent = translations[currentLanguage].previous || "Trước";
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => callback(currentPage - 1);
  prevButton.classList.add("pagination-prev"); // Add class for easy selection
  paginationContainer.appendChild(prevButton);

  // First page button
  if (startPage > 1) {
    const firstPageButton = document.createElement("button");
    firstPageButton.textContent = "1";
    firstPageButton.onclick = () => callback(1);
    paginationContainer.appendChild(firstPageButton);
    if (startPage > 2) {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      ellipsis.className = "ellipsis font-bold";
      paginationContainer.appendChild(ellipsis);
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.classList.toggle("active", i === currentPage);
    pageButton.onclick = () => callback(i);
    paginationContainer.appendChild(pageButton);
  }

  // Last page button
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      ellipsis.className = "ellipsis font-bold";
      paginationContainer.appendChild(ellipsis);
    }
    const lastPageButton = document.createElement("button");
    lastPageButton.textContent = totalPages;
    lastPageButton.onclick = () => callback(totalPages);
    paginationContainer.appendChild(lastPageButton);
  }

  // Next button
  const nextButton = document.createElement("button");
  nextButton.textContent = translations[currentLanguage].next || "Sau";
  nextButton.disabled = currentPage === totalPages;
  nextButton.onclick = () => callback(currentPage + 1);
  nextButton.classList.add("pagination-next"); // Add class for easy selection
  paginationContainer.appendChild(nextButton);
}

// Tạo card design
function createDesignCard(design, context) {
  const card = document.createElement("div");
  card.className =
    "design-card bg-custom-white rounded-2xl shadow-lg overflow-hidden stagger-item border border-custom cursor-pointer";
  card.style.transform = "translateY(30px)";
  // Use a wrapper function to prevent immediate execution and pass event
  card.onclick = (event) => {
    // Check if the click target is a button inside the card
    if (
      event.target.closest("button") &&
      (event.target.closest("button").classList.contains("like-button") ||
        event.target.closest("button").classList.contains("save-button") || // Added save-button check
        event.target.closest("button").classList.contains("comment-button") ||
        event.target.closest("button").classList.contains("delete-button"))
    ) {
      return; // Do nothing if a button was clicked
    }
    showDesignDetailModal(design.id);
  };

  const title = design[`title_${currentLanguage}`] || design.title;
  const description =
    design[`description_${currentLanguage}`] || design.description;
  const isMyDesign = currentUser && design.author === currentUser.name;
  const isLiked =
    currentUser &&
    (likedDesigns[currentUser.id] || []).some((d) => d.id === design.id);
  const isSaved =
    currentUser &&
    (savedDesigns[currentUser.id] || []).some((d) => d.id === design.id);

  card.innerHTML = `
          <div class="relative">
              <img src="${
                design.image
              }" alt="${title}" class="w-full h-48 object-cover">
              ${
                context === "library" && (isMyDesign || isLiked || isSaved)
                  ? `
                    <div class="absolute top-3 right-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs">
                        ${
                          isMyDesign
                            ? translations[currentLanguage].yourDesign ||
                              "Của bạn"
                            : isLiked
                            ? translations[currentLanguage].liked || "Đã thích"
                            : isSaved
                            ? translations[currentLanguage].saved || "Đã lưu"
                            : ""
                        }
                    </div>
                `
                  : ""
              }
          </div>
          <div class="p-4">
              <h3 class="font-semibold text-lg text-custom-primary mb-2">${title}</h3>
              <p class="text-custom-secondary text-sm mb-3">${description}</p>
              <div class="flex justify-between items-center mb-3">
                  <span class="text-sm text-custom-secondary">${
                    translations[currentLanguage].by || "Tác giả"
                  }: ${design.author}</span>
                  <div class="flex space-x-4">
                      <button onclick="event.stopPropagation(); toggleLike(${
                        design.id
                      })" class="like-button ${isLiked ? "liked" : ""}">
                          <i class="fas fa-heart ${
                            isLiked ? "text-red-500" : "text-custom-secondary"
                          }"></i>
                          <span class="text-sm ml-1">${design.likes}</span>
                      </button>
                      <button onclick="event.stopPropagation(); toggleSave(${
                        design.id
                      })" class="save-button ${isSaved ? "saved" : ""}">
                          <i class="fas fa-bookmark ${
                            isSaved
                              ? "text-yellow-500"
                              : "text-custom-secondary"
                          }"></i>
                      </button>
                      <button onclick="event.stopPropagation(); showCommentModal(${
                        design.id
                      })" class="comment-button text-custom-secondary hover:text-purple-600">
                          <i class="fas fa-comment"></i>
                          <span class="text-sm ml-1">${
                            design.comments ? design.comments.length : 0
                          }</span>
                      </button>
                      ${
                        isMyDesign && context === "library"
                          ? `<button onclick="event.stopPropagation(); confirmDeleteDesign(${design.id})" class="delete-button text-red-500 hover:text-red-700 ml-2">
                            <i class="fas fa-trash-alt"></i>
                        </button>`
                          : ""
                      }
                  </div>
              </div>
          </div>
      `;

  return card;
}

// Hiển thị modal bình luận (dùng cho nút comment trực tiếp trên card)
function showCommentModal(designId) {
  if (!currentUser) {
    showLoginModal();
    return;
  }
  currentDesignIdForComment = designId;
  loadComments(designId, "commentList");
  document.getElementById("commentModal").classList.remove("hidden");
}

// Đóng modal bình luận
function closeCommentModal() {
  document.getElementById("commentModal").classList.add("hidden");
  currentDesignIdForComment = null;
}

// Hiển thị modal chi tiết design
function showDesignDetailModal(designId) {
  if (!currentUser) {
    showLoginModal();
    return;
  }
  currentDesignIdForDetail = designId;
  updateDesignDetailModal(designId);
  document.getElementById("designDetailModal").classList.remove("hidden");
}

// Cập nhật nội dung modal chi tiết design
function updateDesignDetailModal(designId) {
  // Find the design in sampleDesigns
  let design = findDesignById(designId);

  if (design) {
    document.getElementById("detailDesignTitle").textContent =
      design[`title_${currentLanguage}`] || design.title;
    document.getElementById("detailDesignImage").src = design.image;
    document.getElementById("detailDesignAuthor").textContent = design.author;
    document.getElementById("detailDesignDescription").textContent =
      design[`description_${currentLanguage}`] || design.description;
    document.getElementById("detailDesignLikes").textContent = design.likes;
    document.getElementById("detailDesignCommentsCount").textContent =
      design.comments ? design.comments.length : 0;

    const detailLikeButton = document.getElementById("detailLikeButton");
    const isLiked =
      currentUser &&
      (likedDesigns[currentUser.id] || []).some((d) => d.id === design.id);
    detailLikeButton.className = `like-button ${
      isLiked ? "liked" : ""
    } text-custom-secondary hover:text-red-500`;
    detailLikeButton.querySelector("i").className = `fas fa-heart ${
      isLiked ? "text-red-500" : ""
    }`;
    detailLikeButton.onclick = () => {
      toggleLike(design.id);
      updateDesignDetailModal(design.id); // Re-render to update like status
    };

    const detailSaveButton = document.getElementById("detailSaveButton");
    const isSaved =
      currentUser &&
      (savedDesigns[currentUser.id] || []).some((d) => d.id === design.id);
    detailSaveButton.className = `save-button ${
      isSaved ? "saved" : ""
    } text-custom-secondary hover:text-yellow-500`;
    detailSaveButton.querySelector("i").className = `fas fa-bookmark ${
      isSaved ? "text-yellow-500" : ""
    }`;
    detailSaveButton.onclick = () => {
      toggleSave(design.id);
      updateDesignDetailModal(design.id); // Re-render to update save status
    };

    loadComments(designId, "detailCommentList");
  }
}

// Đóng modal chi tiết design
function closeDesignDetailModal() {
  document.getElementById("designDetailModal").classList.add("hidden");
  currentDesignIdForDetail = null;
}
