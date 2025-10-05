// Hiển thị modal đăng nhập (giữ nguyên logic frontend)
function showLoginModal() {
  document.getElementById("loginModal").classList.remove("hidden");
  document.getElementById("registerModal").classList.add("hidden");
  document.getElementById("forgotPasswordModal").classList.add("hidden");
}

// Hiển thị modal đăng ký (giữ nguyên logic frontend)
function showRegisterModal() {
  document.getElementById("registerModal").classList.remove("hidden");
  document.getElementById("loginModal").classList.add("hidden");
  document.getElementById("forgotPasswordModal").classList.add("hidden");
}

// Đóng modal (giữ nguyên logic frontend)
function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

// Toggle mobile menu (giữ nguyên logic frontend)
function toggleMobileMenu(view) {
  const mobileMenuId =
    view === "preLogin" ? "mobileMenuPreLogin" : "mobileMenuPostLogin";
  const mobileMenu = document.getElementById(mobileMenuId);
  mobileMenu.classList.toggle("active");
}

// Hiển thị thông báo (giữ nguyên logic frontend)
function showNotifications() {
  document.getElementById("notificationPanel").classList.add("active");
  renderNotifications();
}

// Ẩn thông báo (giữ nguyên logic frontend)
function hideNotifications() {
  document.getElementById("notificationPanel").classList.remove("active");
}

// Helper function to format time ago (giữ nguyên logic frontend)
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

// Render notifications (giữ nguyên logic frontend)
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
          showDesignDetailModal(notif.designId);
        }
        hideNotifications();
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
    notifications.length;
}

// Mark all notifications as read (clear them) (giữ nguyên logic frontend)
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

// Cập nhật hiển thị người dùng (avatar, tên) (giữ nguyên logic frontend)
function updateUserDisplay() {
  if (currentUser) {
    document.getElementById("userWelcome").textContent = currentUser.name;
    const userAvatarElement = document.getElementById("userAvatar");
    if (userAvatarElement) {
      userAvatarElement.innerHTML = `<img src="${currentUser.avatar}" alt="Avatar" class="w-full h-full rounded-full object-cover">`;
    }
  }
}

// Chuyển tab (giữ nguyên logic frontend)
function showTab(tabName) {
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.add("hidden");
  });

  document.getElementById(tabName + "Tab").classList.remove("hidden");

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

  if (tabName === "upload") {
    document.getElementById("designTitle").value = "";
    document.getElementById("designDescription").value = "";
    document.getElementById("designUpload").value = "";
    document.getElementById("fileNameDisplay").textContent = "";
  }

  if (tabName === "discover") {
    loadDiscoverDesigns();
  } else if (tabName === "library") {
    filterLibrary("all");
  }
}

// Render pagination buttons (giữ nguyên logic frontend)
function renderPagination(totalPages, currentPage, elementId, callback) {
  const paginationContainer = document.getElementById(elementId);
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  const isMobile = window.innerWidth <= 768;
  const maxPagesToShow = isMobile ? 3 : 5;
  let startPage, endPage;

  if (totalPages <= maxPagesToShow) {
    startPage = 1;
    endPage = totalPages;
  } else {
    const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
    const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;

    if (currentPage <= maxPagesBeforeCurrentPage) {
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      startPage = currentPage - maxPagesBeforeCurrentPage;
      endPage = currentPage + maxPagesAfterCurrentPage;
    }
  }

  const prevButton = document.createElement("button");
  prevButton.textContent = translations[currentLanguage].previous || "Trước";
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => callback(currentPage - 1);
  prevButton.classList.add("pagination-prev");
  paginationContainer.appendChild(prevButton);

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

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.classList.toggle("active", i === currentPage);
    pageButton.onclick = () => callback(i);
    paginationContainer.appendChild(pageButton);
  }

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

  const nextButton = document.createElement("button");
  nextButton.textContent = translations[currentLanguage].next || "Sau";
  nextButton.disabled = currentPage === totalPages;
  nextButton.onclick = () => callback(currentPage + 1);
  nextButton.classList.add("pagination-next");
  paginationContainer.appendChild(nextButton);
}

// Tạo card design
function createDesignCard(design, context) {
  const card = document.createElement("div");
  card.className =
    "design-card bg-custom-white rounded-2xl shadow-lg overflow-hidden stagger-item border border-custom cursor-pointer";
  card.style.transform = "translateY(30px)";
  card.onclick = (event) => {
    if (
      event.target.closest("button") &&
      (event.target.closest("button").classList.contains("like-button") ||
        event.target.closest("button").classList.contains("save-button") ||
        event.target.closest("button").classList.contains("comment-button") ||
        event.target.closest("button").classList.contains("delete-button"))
    ) {
      return;
    }
    showDesignDetailModal(design._id); // Use _id from MongoDB
  };

  const title = design[`title_${currentLanguage}`] || design.title;
  const description =
    design[`description_${currentLanguage}`] || design.description;
  const isMyDesign = currentUser && design.authorId === currentUser._id; // Check authorId
  const isLiked =
    currentUser &&
    (likedDesigns[currentUser._id] || []).some((d) => d._id === design._id);
  const isSaved =
    currentUser &&
    (savedDesigns[currentUser._id] || []).some((d) => d._id === design._id);

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
                      <button onclick="event.stopPropagation(); toggleLike('${
                        design._id
                      }')" class="like-button ${isLiked ? "liked" : ""}">
                          <i class="fas fa-heart ${
                            isLiked ? "text-red-500" : "text-custom-secondary"
                          }"></i>
                          <span class="text-sm ml-1">${design.likes}</span>
                      </button>
                      <button onclick="event.stopPropagation(); toggleSave('${
                        design._id
                      }')" class="save-button ${isSaved ? "saved" : ""}">
                          <i class="fas fa-bookmark ${
                            isSaved
                              ? "text-yellow-500"
                              : "text-custom-secondary"
                          }"></i>
                      </button>
                      <button onclick="event.stopPropagation(); showCommentModal('${
                        design._id
                      }')" class="comment-button text-custom-secondary hover:text-purple-600">
                          <i class="fas fa-comment"></i>
                          <span class="text-sm ml-1">${
                            design.comments ? design.comments.length : 0
                          }</span>
                      </button>
                      ${
                        isMyDesign && context === "library"
                          ? `<button onclick="event.stopPropagation(); confirmDeleteDesign('${design._id}')" class="delete-button text-red-500 hover:text-red-700 ml-2">
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

// Hiển thị modal bình luận (dùng cho nút comment trực tiếp trên card) (giữ nguyên logic frontend)
function showCommentModal(designId) {
  if (!currentUser) {
    showLoginModal();
    return;
  }
  currentDesignIdForComment = designId;
  loadComments(designId, "commentList");
  document.getElementById("commentModal").classList.remove("hidden");
}

// Đóng modal bình luận (giữ nguyên logic frontend)
function closeCommentModal() {
  document.getElementById("commentModal").classList.add("hidden");
  currentDesignIdForComment = null;
}

// Hiển thị modal chi tiết design (giữ nguyên logic frontend)
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
async function updateDesignDetailModal(designId) {
  let design = await findDesignById(designId);

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
      (likedDesigns[currentUser._id] || []).some((d) => d._id === design._id);
    detailLikeButton.className = `like-button ${
      isLiked ? "liked" : ""
    } text-custom-secondary hover:text-red-500`;
    detailLikeButton.querySelector("i").className = `fas fa-heart ${
      isLiked ? "text-red-500" : ""
    }`;
    detailLikeButton.onclick = () => {
      toggleLike(design._id);
      updateDesignDetailModal(design._id);
    };

    const detailSaveButton = document.getElementById("detailSaveButton");
    const isSaved =
      currentUser &&
      (savedDesigns[currentUser._id] || []).some((d) => d._id === design._id);
    detailSaveButton.className = `save-button ${
      isSaved ? "saved" : ""
    } text-custom-secondary hover:text-yellow-500`;
    detailSaveButton.querySelector("i").className = `fas fa-bookmark ${
      isSaved ? "text-yellow-500" : ""
    }`;
    detailSaveButton.onclick = () => {
      toggleSave(design._id);
      updateDesignDetailModal(design._id);
    };

    loadComments(designId, "detailCommentList");
  }
}

// Đóng modal chi tiết design (giữ nguyên logic frontend)
function closeDesignDetailModal() {
  document.getElementById("designDetailModal").classList.add("hidden");
  currentDesignIdForDetail = null;
}
