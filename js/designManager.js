// Tải designs trong tab khám phá
function loadDiscoverDesigns(searchTerm = "", page = 1) {
  const container = document.getElementById("discoverGrid");
  if (!container) return;
  container.innerHTML = "";
  currentPage = page;

  // Load savedDesigns for the current user to correctly reflect 'saved' status
  if (currentUser) {
    savedDesigns[currentUser.id] =
      JSON.parse(localStorage.getItem(`savedDesigns_${currentUser.id}`)) || [];
  }

  const allDesigns = [
    ...sampleDesigns,
    ...(currentUser ? userDesigns[currentUser.id] : []),
  ];
  const filteredDesigns = allDesigns.filter((design) => {
    const title = (
      design[`title_${currentLanguage}`] ||
      design.title ||
      ""
    ).toLowerCase();
    const description = (
      design[`description_${currentLanguage}`] ||
      design.description ||
      ""
    ).toLowerCase();
    const author = (design.author || "").toLowerCase();
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return (
      title.includes(lowerCaseSearchTerm) ||
      description.includes(lowerCaseSearchTerm) ||
      author.includes(lowerCaseSearchTerm) ||
      (design.hashtags &&
        design.hashtags.some((tag) =>
          tag.toLowerCase().includes(lowerCaseSearchTerm)
        ))
    );
  });

  const totalPages = Math.ceil(filteredDesigns.length / designsPerPage);
  const start = (currentPage - 1) * designsPerPage;
  const end = start + designsPerPage;
  const designsToDisplay = filteredDesigns.slice(start, end);

  if (designsToDisplay.length === 0) {
    container.innerHTML = `
              <div class="col-span-full text-center py-12">
                  <i class="fas fa-search text-4xl text-custom-secondary mb-4"></i>
                  <p class="text-custom-secondary">${
                    translations[currentLanguage].noResults ||
                    "Không tìm thấy thiết kế nào phù hợp."
                  }</p>
              </div>
          `;
    document.getElementById("pagination").innerHTML = ""; // Clear pagination
    return;
  }

  designsToDisplay.forEach((design) => {
    const designCard = createDesignCard(design, "discover");
    container.appendChild(designCard);
  });

  renderPagination(totalPages, currentPage, "pagination", (p) =>
    loadDiscoverDesigns(searchTerm, p)
  );
}

// Tìm kiếm designs
function searchDesigns(event) {
  const searchTerm = document.getElementById("designSearchInput").value;
  const clearBtn = document.getElementById("clearSearchBtn");

  if (searchTerm.length > 0) {
    clearBtn.style.display = "block";
  } else {
    clearBtn.style.display = "none";
  }

  if (event.key === "Enter") {
    addSearchTermToHistory(searchTerm);
    loadDiscoverDesigns(searchTerm, 1); // Reset to first page on new search
    document.getElementById("searchHistory").classList.add("hidden");
  } else {
    // Filter history as user types or show all if input is empty
    renderSearchHistory(searchTerm);
    if (searchTerm.trim() === "") {
      document.getElementById("searchHistory").classList.remove("hidden");
    } else {
      // Only show history if there are matching results
      const historyDiv = document.getElementById("searchHistory");
      if (historyDiv && historyDiv.children.length > 0) {
        historyDiv.classList.remove("hidden");
      } else {
        historyDiv.classList.add("hidden");
      }
    }
  }
}

// Clear search input
function clearSearchInput() {
  document.getElementById("designSearchInput").value = "";
  document.getElementById("clearSearchBtn").style.display = "none";
  loadDiscoverDesigns("", 1); // Show all designs, reset to first page
  document.getElementById("searchHistory").classList.add("hidden"); // Hide history
}

// Add search term to history
function addSearchTermToHistory(term) {
  if (!currentUser) return; // Only save history for logged-in users
  term = term.trim();
  if (term === "") return;

  let userSearchHistory = searchHistory[currentUser.id] || [];

  // Remove if already exists to move it to the top
  userSearchHistory = userSearchHistory.filter((item) => item !== term);
  userSearchHistory.unshift(term); // Add to the beginning

  // Keep only the last 5 searches
  if (userSearchHistory.length > 5) {
    userSearchHistory = userSearchHistory.slice(0, 5);
  }
  searchHistory[currentUser.id] = userSearchHistory;
  localStorage.setItem(
    `searchHistory_${currentUser.id}`,
    JSON.stringify(userSearchHistory)
  );
  renderSearchHistory();
}

// Render search history
function renderSearchHistory(filterTerm = "") {
  if (!currentUser) return; // Only render history for logged-in users

  const historyDiv = document.getElementById("searchHistory");
  if (!historyDiv) return;
  historyDiv.innerHTML = "";

  const userSearchHistory = searchHistory[currentUser.id] || [];
  const filteredHistory = userSearchHistory.filter((item) =>
    item.toLowerCase().includes(filterTerm.toLowerCase())
  );

  if (filteredHistory.length > 0) {
    historyDiv.classList.remove("hidden");
  } else {
    historyDiv.classList.add("hidden");
    return;
  }

  filteredHistory.forEach((term) => {
    const itemDiv = document.createElement("div");
    itemDiv.textContent = term;
    itemDiv.onclick = () => {
      document.getElementById("designSearchInput").value = term;
      loadDiscoverDesigns(term, 1); // Apply search term and reset page
      historyDiv.classList.add("hidden");
      document.getElementById("clearSearchBtn").style.display = "block";
    };
    historyDiv.appendChild(itemDiv);
  });
}

// Show search history on focus
function showSearchHistory() {
  if (!currentUser) return; // Only show history for logged-in users
  renderSearchHistory(document.getElementById("designSearchInput").value);
  document.getElementById("searchHistory").classList.remove("hidden"); // Ensure it's visible if there's content
}

// Tải designs trong thư viện
function loadLibraryDesigns(filter = "all", page = 1) {
  const container = document.getElementById("libraryGrid");
  if (!container) return;
  container.innerHTML = "";
  currentPage = page;
  currentFilter = filter;

  if (!currentUser) {
    container.innerHTML = `
              <div class="col-span-full text-center py-12">
                  <p class="text-custom-secondary">${
                    translations[currentLanguage].loginToViewLibrary ||
                    "Vui lòng đăng nhập để xem thư viện của bạn."
                  }</p>
              </div>
          `;
    document.getElementById("libraryPagination").innerHTML = ""; // Clear pagination
    return;
  }

  // Load user-specific data to ensure it's up-to-date
  userDesigns[currentUser.id] =
    JSON.parse(localStorage.getItem(`userDesigns_${currentUser.id}`)) || [];
  likedDesigns[currentUser.id] =
    JSON.parse(localStorage.getItem(`likedDesigns_${currentUser.id}`)) || [];
  savedDesigns[currentUser.id] =
    JSON.parse(localStorage.getItem(`savedDesigns_${currentUser.id}`)) || [];

  let designsToDisplay = [];
  const userUploadedDesigns = userDesigns[currentUser.id] || [];
  const userLikedDesigns = likedDesigns[currentUser.id] || [];
  const userSavedDesigns = savedDesigns[currentUser.id] || [];

  if (filter === "myDesigns") {
    designsToDisplay = userUploadedDesigns;
  } else if (filter === "likedDesigns") {
    designsToDisplay = userLikedDesigns;
  } else if (filter === "savedDesigns") {
    designsToDisplay = userSavedDesigns;
  } else {
    // 'all' - combine unique designs from all three categories
    const allUniqueDesigns = new Map();
    [...userUploadedDesigns, ...userLikedDesigns, ...userSavedDesigns].forEach(
      (design) => {
        allUniqueDesigns.set(design.id, design);
      }
    );
    designsToDisplay = Array.from(allUniqueDesigns.values());
  }

  const totalPages = Math.ceil(designsToDisplay.length / designsPerPage);
  const start = (currentPage - 1) * designsPerPage;
  const end = start + designsPerPage;
  const paginatedDesigns = designsToDisplay.slice(start, end);

  if (paginatedDesigns.length === 0) {
    container.innerHTML = `
              <div class="col-span-full text-center py-12">
                  <i class="fas fa-folder-open text-4xl text-custom-secondary mb-4"></i>
                  <p class="text-custom-secondary">${
                    translations[currentLanguage].noDesigns ||
                    "Chưa có thiết kế nào trong thư viện"
                  }</p>
              </div>
          `;
    document.getElementById("libraryPagination").innerHTML = ""; // Clear pagination
    return;
  }

  paginatedDesigns.forEach((design) => {
    const designCard = createDesignCard(design, "library");
    container.appendChild(designCard);
  });

  renderPagination(totalPages, currentPage, "libraryPagination", (p) =>
    loadLibraryDesigns(filter, p)
  );
}

// Lọc thư viện
function filterLibrary(filter) {
  document.querySelectorAll("#libraryTab button").forEach((btn) => {
    btn.classList.remove("bg-purple-200", "dark:bg-gray-600");
  });
  document
    .getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`)
    .classList.add("bg-purple-200", "dark:bg-gray-600");
  loadLibraryDesigns(filter, 1); // Reset to first page on new filter
}

// Like/Unlike design
function toggleLike(designId) {
  if (!currentUser) {
    showLoginModal();
    return;
  }

  // Find the design in sampleDesigns
  let design = sampleDesigns.find((d) => d.id === designId);

  // If not found in sampleDesigns, check user's uploaded designs
  if (!design && currentUser && userDesigns[currentUser.id]) {
    design = userDesigns[currentUser.id].find((d) => d.id === designId);
  }

  if (design) {
    let userLikedDesigns = likedDesigns[currentUser.id] || [];
    const isCurrentlyLiked = userLikedDesigns.some((d) => d.id === design.id);

    if (isCurrentlyLiked) {
      design.likes--;
      userLikedDesigns = userLikedDesigns.filter((d) => d.id !== design.id);
    } else {
      design.likes++;
      userLikedDesigns.push({ ...design }); // Add a copy to likedDesigns
    }
    likedDesigns[currentUser.id] = userLikedDesigns;
    localStorage.setItem(
      `likedDesigns_${currentUser.id}`,
      JSON.stringify(userLikedDesigns)
    );

    // Update userDesigns if the liked design is one of the user's own
    const userDesignIndex = (userDesigns[currentUser.id] || []).findIndex(
      (d) => d.id === design.id
    );
    if (userDesignIndex !== -1) {
      userDesigns[currentUser.id][userDesignIndex].likes = design.likes;
      localStorage.setItem(
        `userDesigns_${currentUser.id}`,
        JSON.stringify(userDesigns[currentUser.id])
      );
    }
    // Update sample designs if it's a sample design (for persistence across sessions)
    const sampleDesignIndex = sampleDesigns.findIndex(
      (d) => d.id === design.id
    );
    if (sampleDesignIndex !== -1) {
      sampleDesigns[sampleDesignIndex].likes = design.likes;
      localStorage.setItem("sampleDesigns", JSON.stringify(sampleDesigns)); // Save updated sampleDesigns
    }

    loadDiscoverDesigns(
      document.getElementById("designSearchInput").value,
      currentPage
    );
    loadLibraryDesigns(currentFilter, currentPage);
    // If detail modal is open, update its like count
    if (
      !document
        .getElementById("designDetailModal")
        .classList.contains("hidden") &&
      currentDesignIdForDetail === designId
    ) {
      updateDesignDetailModal(designId);
    }
  }
}

// Toggle Save design
function toggleSave(designId) {
  if (!currentUser) {
    showLoginModal();
    return;
  }

  let design = findDesignById(designId);

  if (design) {
    let userSavedDesigns = savedDesigns[currentUser.id] || [];
    const isCurrentlySaved = userSavedDesigns.some((d) => d.id === design.id);

    if (isCurrentlySaved) {
      userSavedDesigns = userSavedDesigns.filter((d) => d.id !== design.id);
    } else {
      userSavedDesigns.push({ ...design }); // Add a copy to savedDesigns
    }
    savedDesigns[currentUser.id] = userSavedDesigns;
    localStorage.setItem(
      `savedDesigns_${currentUser.id}`,
      JSON.stringify(userSavedDesigns)
    );

    loadDiscoverDesigns(
      document.getElementById("designSearchInput").value,
      currentPage
    );
    loadLibraryDesigns(currentFilter, currentPage);
    if (
      !document
        .getElementById("designDetailModal")
        .classList.contains("hidden") &&
      currentDesignIdForDetail === designId
    ) {
      updateDesignDetailModal(designId);
    }
  }
}

// Tải bình luận
function loadComments(designId, commentListId) {
  // Find the design in sampleDesigns
  let design = findDesignById(designId);

  const commentList = document.getElementById(commentListId);
  if (!commentList) return;
  commentList.innerHTML = "";

  if (design && design.comments && design.comments.length > 0) {
    design.comments.forEach((comment, index) => {
      const commentDiv = document.createElement("div");
      commentDiv.className = "flex items-start gap-3 mb-2";
      commentDiv.id = `comment-${comment.id}`; // Add ID for easy access

      const isMyComment = currentUser && comment.author === currentUser.name;
      const commentTime = new Date(comment.timestamp);
      const currentTime = new Date();
      const timeDiff = (currentTime - commentTime) / (1000 * 60); // in minutes
      const canEdit = isMyComment && timeDiff <= 5; // Can edit within 5 minutes

      commentDiv.innerHTML = `
                  <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                      ${comment.author.charAt(0).toUpperCase()}
                  </div>
                  <div class="flex-1">
                      <p class="text-sm font-semibold text-custom-primary">${
                        comment.author
                      }</p>
                      <p class="text-sm text-custom-secondary" id="comment-text-${
                        comment.id
                      }">${comment.text}</p>
                      <input type="text" id="edit-comment-input-${
                        comment.id
                      }" class="hidden w-full px-2 py-1 border border-custom rounded-md bg-custom-white text-custom-primary text-sm" value="${
        comment.text
      }">
                      <span class="text-xs text-custom-secondary">${new Date(
                        comment.timestamp
                      ).toLocaleString()}</span>
                      ${
                        isMyComment
                          ? `
                              <div class="flex gap-2 mt-1">
                                  ${
                                    canEdit
                                      ? `<button onclick="editComment(${designId}, ${comment.id}, '${commentListId}')" class="text-xs text-blue-500 hover:underline" id="edit-btn-${comment.id}" data-i18n="editComment">${translations[currentLanguage].editComment}</button>`
                                      : ""
                                  }
                                  <button onclick="confirmDeleteComment(${designId}, ${
                              comment.id
                            }, '${commentListId}')" class="text-xs text-red-500 hover:underline" data-i18n="deleteComment">${
                              translations[currentLanguage].deleteComment
                            }</button>
                              </div>
                          `
                          : ""
                      }
                  </div>
              `;
      commentList.appendChild(commentDiv);
    });
  } else {
    commentList.innerHTML = `<p class="text-custom-secondary text-sm">${
      translations[currentLanguage].noComments || "Chưa có bình luận nào."
    }</p>`;
  }
}

// Thêm bình luận
function addComment(designId, inputId, listId) {
  const commentInput = document.getElementById(inputId);
  const commentText = commentInput.value.trim();

  if (!commentText) return;

  // Find the design in sampleDesigns
  let design = findDesignById(designId);

  if (design) {
    if (!design.comments) {
      design.comments = [];
    }
    const newComment = {
      id: Date.now(), // Unique ID for the comment
      author: currentUser.name,
      text: commentText,
      timestamp: new Date().toISOString(),
    };
    design.comments.push(newComment);
    commentInput.value = "";
    loadComments(designId, listId);

    // Update local storage for user designs if it's a user's own design
    updateDesignInStorage(design);

    loadDiscoverDesigns(
      document.getElementById("designSearchInput").value,
      currentPage
    ); // Refresh discover tab to update comment count
    loadLibraryDesigns(currentFilter, currentPage); // Refresh library tab to update comment count
    updateDesignDetailModal(designId); // Update detail modal if open
  }
}

// Sửa bình luận
function editComment(designId, commentId, listId) {
  const commentTextElement = document.getElementById(
    `comment-text-${commentId}`
  );
  const editInput = document.getElementById(`edit-comment-input-${commentId}`);
  const editButton = document.getElementById(`edit-btn-${commentId}`);

  if (commentTextElement.classList.contains("hidden")) {
    // Save edited comment
    const newText = editInput.value.trim();
    if (!newText) {
      showToast(
        "error",
        translations[currentLanguage].commentCannotBeEmpty ||
          "Bình luận không được để trống!"
      );
      return;
    }

    let design = findDesignById(designId);
    if (design) {
      const commentIndex = design.comments.findIndex((c) => c.id === commentId);
      if (commentIndex !== -1) {
        design.comments[commentIndex].text = newText;
        // Update storage
        updateDesignInStorage(design);
        loadComments(designId, listId);
        updateDesignDetailModal(designId); // Refresh detail modal if open
      }
    }
    editButton.textContent = translations[currentLanguage].editComment;
    commentTextElement.classList.remove("hidden");
    editInput.classList.add("hidden");
  } else {
    // Enable editing
    commentTextElement.classList.add("hidden");
    editInput.classList.remove("hidden");
    editInput.focus();
    editButton.textContent = translations[currentLanguage].saveComment;
  }
}

// Xác nhận xóa bình luận
function confirmDeleteComment(designId, commentId, listId) {
  showConfirmationModal(
    translations[currentLanguage].confirmDeleteCommentTitle ||
      "Xác nhận xóa bình luận",
    translations[currentLanguage].confirmDeleteCommentMessage ||
      "Bạn có chắc chắn muốn xóa bình luận này không?",
    () => deleteComment(designId, commentId, listId)
  );
}

// Xóa bình luận
function deleteComment(designId, commentId, listId) {
  let design = findDesignById(designId); // Corrected: pass designId directly

  if (design) {
    const initialCommentCount = design.comments.length;
    design.comments = design.comments.filter(
      (comment) => comment.id !== commentId
    );

    if (design.comments.length < initialCommentCount) {
      // Update storage
      updateDesignInStorage(design);
      loadComments(designId, listId);
      updateDesignDetailModal(designId); // Refresh detail modal if open
      showToast(
        "success",
        translations[currentLanguage].commentDeleted || "Bình luận đã được xóa."
      );
    } else {
      showToast(
        "error",
        translations[currentLanguage].commentNotFound ||
          "Không tìm thấy bình luận để xóa."
      );
    }
  }
}

// Helper function to find a design by ID across sample and user designs
function findDesignById(designId) {
  let design = sampleDesigns.find((d) => d.id === designId);
  if (!design && currentUser && userDesigns[currentUser.id]) {
    design = userDesigns[currentUser.id].find((d) => d.id === designId);
  }
  return design;
}

// Helper function to update a design in storage (both sample and user designs)
function updateDesignInStorage(updatedDesign) {
  const sampleDesignIndex = sampleDesigns.findIndex(
    (d) => d.id === updatedDesign.id
  );
  if (sampleDesignIndex !== -1) {
    sampleDesigns[sampleDesignIndex] = updatedDesign;
    localStorage.setItem("sampleDesigns", JSON.stringify(sampleDesigns)); // Save updated sampleDesigns
  }

  if (currentUser && userDesigns[currentUser.id]) {
    const userDesignIndex = userDesigns[currentUser.id].findIndex(
      (d) => d.id === updatedDesign.id
    );
    if (userDesignIndex !== -1) {
      userDesigns[currentUser.id][userDesignIndex] = updatedDesign;
      localStorage.setItem(
        `userDesigns_${currentUser.id}`,
        JSON.stringify(userDesigns[currentUser.id])
      );
    }
  }
}

// Display selected file name
function displayFileName() {
  const fileInput = document.getElementById("designUpload");
  const fileNameDisplay = document.getElementById("fileNameDisplay");
  if (fileInput && fileNameDisplay) {
    if (fileInput.files.length > 0) {
      fileNameDisplay.textContent = `${
        translations[currentLanguage].selectedFile || "File đã chọn"
      }: ${fileInput.files[0].name}`;
    } else {
      fileNameDisplay.textContent = "";
    }
  }
}

// Upload design
function uploadDesign() {
  if (!currentUser) {
    showLoginModal();
    return;
  }

  const title = document.getElementById("designTitle").value;
  const description = document.getElementById("designDescription").value;
  const fileInput = document.getElementById("designUpload");

  if (!title || !description || !fileInput.files[0]) {
    showToast(
      "error",
      translations[currentLanguage].fillAllFields ||
        "Vui lòng điền đầy đủ thông tin và chọn file!"
    );
    return;
  }

  // Mô phỏng upload file
  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    // Phân tích AI trước khi upload
    analyzeDesignForUpload(title, description, e.target.result);
  };

  reader.readAsDataURL(file);
}

// Phân tích AI cho upload
function analyzeDesignForUpload(title, description, imageData) {
  // Mô phỏng phân tích AI
  const isDuplicate = Math.random() < 0.3; // 30% chance of being duplicate
  const creativityScore = isDuplicate ? "45%" : "85%";
  const aiResultText = isDuplicate
    ? translations[currentLanguage].aiResultDuplicate ||
      "Thiết kế trùng lặp với sản phẩm khác"
    : translations[currentLanguage].aiResultSuccess ||
      "Thiết kế đạt chuẩn để chia sẻ";
  const aiSuggestionsText = isDuplicate
    ? translations[currentLanguage].aiSuggestionDuplicate ||
      "Thiết kế có thể trùng lặp, cân nhắc chỉnh sửa."
    : translations[currentLanguage].aiSuggestionsDesc ||
      "Có thể thêm hiệu ứng chuyển động nhẹ";
  const aiBackground = isDuplicate
    ? "linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)"
    : "linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)";

  currentDesignForAnalysis = {
    id: Date.now(),
    title: title,
    description: description,
    image: imageData,
    isDuplicate: isDuplicate,
  };

  document.getElementById("aiAnalysisModal").classList.remove("hidden");
  document.getElementById("creativityScore").textContent = creativityScore;
  document.getElementById("aiResultText").textContent = aiResultText;
  document.getElementById("aiSuggestionsText").textContent = aiSuggestionsText;
  document.querySelector(".ai-analysis").style.background = aiBackground;
  document.getElementById("aiAnalysisImage").src = imageData; // Display uploaded image

  // Render buttons for upload flow
  const aiAnalysisButtons = document.getElementById("aiAnalysisButtons");
  aiAnalysisButtons.innerHTML = `
      <button
          onclick="approveDesign()"
          class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          data-i18n="approve"
      >
          ${translations[currentLanguage].approve || "Phê duyệt"}
      </button>
      <button
          onclick="rejectDesign()"
          class="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
          data-i18n="reject"
      >
          ${translations[currentLanguage].reject || "Từ chối"}
      </button>
      <button
          onclick="closeAIAnalysis()"
          class="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
          data-i18n="close"
      >
          ${translations[currentLanguage].close || "Đóng"}
      </button>
  `;
}

// Đóng phân tích AI
function closeAIAnalysis() {
  document.getElementById("aiAnalysisModal").classList.add("hidden");
  currentDesignForAnalysis = null; // Clear analysis data
}

// Phê duyệt design
function approveDesign() {
  if (currentDesignForAnalysis && !currentDesignForAnalysis.isDuplicate) {
    const newDesign = {
      id: currentDesignForAnalysis.id,
      title: currentDesignForAnalysis.title,
      description: currentDesignForAnalysis.description,
      author: currentUser.name,
      likes: 0,
      comments: [],
      image: currentDesignForAnalysis.image, // Use the actual uploaded image data
      liked: false,
      saved: false,
      title_en: currentDesignForAnalysis.title,
      title_jp: currentDesignForAnalysis.title,
      description_en: currentDesignForAnalysis.description,
      description_jp: currentDesignForAnalysis.description,
      hashtags: ["new", "design", "upload"], // Example hashtags
    };

    if (!userDesigns[currentUser.id]) {
      userDesigns[currentUser.id] = [];
    }
    userDesigns[currentUser.id].push(newDesign);
    localStorage.setItem(
      `userDesigns_${currentUser.id}`,
      JSON.stringify(userDesigns[currentUser.id])
    );

    // Reset form
    document.getElementById("designTitle").value = "";
    document.getElementById("designDescription").value = "";
    document.getElementById("designUpload").value = "";
    document.getElementById("fileNameDisplay").textContent = ""; // Clear file name display

    showToast(
      "success",
      translations[currentLanguage].uploadSuccess ||
        "Upload thiết kế thành công!"
    );
    closeAIAnalysis();
    showTab("library");
    filterLibrary("myDesigns"); // Show user's designs after upload
  } else {
    showToast(
      "error",
      translations[currentLanguage].duplicateDesign ||
        "Thiết kế bị trùng lặp, không thể upload!"
    );
  }
}

// Từ chối design
function rejectDesign() {
  showToast(
    "info",
    translations[currentLanguage].designRejected || "Thiết kế đã bị từ chối!"
  );
  closeAIAnalysis();
}

// Function to confirm deletion of a design
function confirmDeleteDesign(designId) {
  showConfirmationModal(
    translations[currentLanguage].deleteDesignConfirmTitle ||
      "Xác nhận xóa thiết kế",
    translations[currentLanguage].deleteDesignConfirmMessage ||
      "Bạn có chắc chắn muốn xóa thiết kế này không? Hành động này không thể hoàn tác.",
    () => deleteDesign(designId)
  );
}

// Function to delete a design
function deleteDesign(designId) {
  if (!currentUser) {
    showToast(
      "error",
      translations[currentLanguage].loginRequired ||
        "Bạn cần đăng nhập để thực hiện hành động này."
    );
    return;
  }

  let designDeleted = false;

  // Remove from user's uploaded designs
  if (userDesigns[currentUser.id]) {
    const initialLength = userDesigns[currentUser.id].length;
    userDesigns[currentUser.id] = userDesigns[currentUser.id].filter(
      (design) => design.id !== designId
    );
    if (userDesigns[currentUser.id].length < initialLength) {
      localStorage.setItem(
        `userDesigns_${currentUser.id}`,
        JSON.stringify(userDesigns[currentUser.id])
      );
      designDeleted = true;
    }
  }

  // Also remove from liked designs if it was liked by the current user
  if (likedDesigns[currentUser.id]) {
    const initialLength = likedDesigns[currentUser.id].length;
    likedDesigns[currentUser.id] = likedDesigns[currentUser.id].filter(
      (design) => design.id !== designId
    );
    if (likedDesigns[currentUser.id].length < initialLength) {
      localStorage.setItem(
        `likedDesigns_${currentUser.id}`,
        JSON.stringify(likedDesigns[currentUser.id])
      );
    }
  }

  // Also remove from saved designs if it was saved by the current user
  if (savedDesigns[currentUser.id]) {
    const initialLength = savedDesigns[currentUser.id].length;
    savedDesigns[currentUser.id] = savedDesigns[currentUser.id].filter(
      (design) => design.id !== designId
    );
    if (savedDesigns[currentUser.id].length < initialLength) {
      localStorage.setItem(
        `savedDesigns_${currentUser.id}`,
        JSON.stringify(savedDesigns[currentUser.id])
      );
    }
  }

  if (designDeleted) {
    showToast(
      "success",
      translations[currentLanguage].deleteSuccess ||
        "Thiết kế đã được xóa thành công!"
    );
    // Refresh both discover and library tabs to reflect changes
    loadDiscoverDesigns(
      document.getElementById("designSearchInput").value,
      currentPage
    );
    loadLibraryDesigns(currentFilter, currentPage);
    // Close detail modal if the deleted design was open
    if (currentDesignIdForDetail === designId) {
      closeDesignDetailModal();
    }
  } else {
    showToast(
      "error",
      translations[currentLanguage].deleteError || "Không thể xóa thiết kế."
    );
  }
}

// Function to confirm deletion of all user's designs
function confirmDeleteAllMyDesigns() {
  if (!currentUser) {
    showToast(
      "error",
      translations[currentLanguage].loginRequired ||
        "Bạn cần đăng nhập để thực hiện hành động này."
    );
    return;
  }

  showConfirmationModal(
    translations[currentLanguage].deleteAllMyDesignsConfirmTitle ||
      "Xác nhận xóa tất cả thiết kế",
    translations[currentLanguage].deleteAllMyDesignsConfirmMessage ||
      "Bạn có chắc chắn muốn xóa TẤT CẢ thiết kế của mình không? Hành động này không thể hoàn tác.",
    deleteAllMyDesigns
  );
}

// Function to delete all user's designs
function deleteAllMyDesigns() {
  if (!currentUser) return;

  if (userDesigns[currentUser.id]) {
    userDesigns[currentUser.id] = [];
    localStorage.setItem(
      `userDesigns_${currentUser.id}`,
      JSON.stringify(userDesigns[currentUser.id])
    );

    // Also remove these designs from likedDesigns if they were liked by the current user
    if (likedDesigns[currentUser.id]) {
      likedDesigns[currentUser.id] = likedDesigns[currentUser.id].filter(
        (design) => design.author !== currentUser.name
      );
      localStorage.setItem(
        `likedDesigns_${currentUser.id}`,
        JSON.stringify(likedDesigns[currentUser.id])
      );
    }

    // Also remove these designs from savedDesigns if they were saved by the current user
    if (savedDesigns[currentUser.id]) {
      savedDesigns[currentUser.id] = savedDesigns[currentUser.id].filter(
        (design) => design.author !== currentUser.name
      );
      localStorage.setItem(
        `savedDesigns_${currentUser.id}`,
        JSON.stringify(savedDesigns[currentUser.id])
      );
    }

    showToast(
      "success",
      translations[currentLanguage].allDesignsDeletedSuccess ||
        "Tất cả thiết kế của bạn đã được xóa thành công!"
    );
    loadDiscoverDesigns(
      document.getElementById("designSearchInput").value,
      currentPage
    );
    loadLibraryDesigns(currentFilter, currentPage);
  } else {
    showToast(
      "info",
      translations[currentLanguage].noDesignsToDelete ||
        "Bạn không có thiết kế nào để xóa."
    );
  }
}
