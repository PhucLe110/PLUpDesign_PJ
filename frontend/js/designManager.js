// Tải designs trong tab khám phá
async function loadDiscoverDesigns(searchTerm = "", page = 1) {
  const container = document.getElementById("discoverGrid");
  if (!container) return;
  container.innerHTML = "";
  currentPage = page;

  try {
    const response = await fetch(`${API_BASE_URL}/designs`, {
      headers: getAuthHeaders(), // Include auth headers if user is logged in
    });
    const allDesigns = await response.json();

    // Filter designs based on search term
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
  } catch (error) {
    console.error("Error loading discover designs:", error);
    showToast("error", "Không thể tải thiết kế. Vui lòng thử lại.");
  }
}

// Tìm kiếm designs (giữ nguyên logic frontend)
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
    renderSearchHistory(searchTerm);
    const historyDiv = document.getElementById("searchHistory");
    if (historyDiv) {
      if (searchTerm.trim() === "") {
        historyDiv.classList.remove("hidden");
      } else {
        // Only show history if there are matching results
        if (historyDiv.children.length > 0) {
          historyDiv.classList.remove("hidden");
        } else {
          historyDiv.classList.add("hidden");
        }
      }
    }
  }
}

// Clear search input (giữ nguyên logic frontend)
function clearSearchInput() {
  document.getElementById("designSearchInput").value = "";
  document.getElementById("clearSearchBtn").style.display = "none";
  loadDiscoverDesigns("", 1); // Show all designs, reset to first page
  document.getElementById("searchHistory").classList.add("hidden"); // Hide history
}

// Add search term to history (giữ nguyên logic frontend)
function addSearchTermToHistory(term) {
  if (!currentUser) return;
  term = term.trim();
  if (term === "") return;

  let userSearchHistory = searchHistory[currentUser._id] || [];

  userSearchHistory = userSearchHistory.filter((item) => item !== term);
  userSearchHistory.unshift(term);

  if (userSearchHistory.length > 5) {
    userSearchHistory = userSearchHistory.slice(0, 5);
  }
  searchHistory[currentUser._id] = userSearchHistory;
  localStorage.setItem(
    `searchHistory_${currentUser._id}`,
    JSON.stringify(userSearchHistory)
  );
  renderSearchHistory();
}

// Render search history (giữ nguyên logic frontend)
function renderSearchHistory(filterTerm = "") {
  if (!currentUser) return;

  const historyDiv = document.getElementById("searchHistory");
  if (!historyDiv) return;
  historyDiv.innerHTML = "";

  const userSearchHistory = searchHistory[currentUser._id] || [];
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
      loadDiscoverDesigns(term, 1);
      historyDiv.classList.add("hidden");
      document.getElementById("clearSearchBtn").style.display = "block";
    };
    historyDiv.appendChild(itemDiv);
  });
}

// Show search history on focus (giữ nguyên logic frontend)
function showSearchHistory() {
  if (!currentUser) return;
  renderSearchHistory(document.getElementById("designSearchInput").value);
  document.getElementById("searchHistory").classList.remove("hidden");
}

// Tải designs trong thư viện
async function loadLibraryDesigns(filter = "all", page = 1) {
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
    document.getElementById("libraryPagination").innerHTML = "";
    return;
  }

  let designsToDisplay = [];
  try {
    const response = await fetch(`${API_BASE_URL}/designs`, {
      headers: getAuthHeaders(),
    });
    const allDesigns = await response.json();

    // Filter designs based on the current user and filter type
    const userUploadedDesigns = allDesigns.filter(
      (d) => d.authorId === currentUser._id
    );
    const userLikedDesigns = (likedDesigns[currentUser._id] || [])
      .map((d) => allDesigns.find((ad) => ad._id === d._id))
      .filter(Boolean);
    const userSavedDesigns = (savedDesigns[currentUser._id] || [])
      .map((d) => allDesigns.find((ad) => ad._id === d._id))
      .filter(Boolean);

    if (filter === "myDesigns") {
      designsToDisplay = userUploadedDesigns;
    } else if (filter === "likedDesigns") {
      designsToDisplay = userLikedDesigns;
    } else if (filter === "savedDesigns") {
      designsToDisplay = userSavedDesigns;
    } else {
      const allUniqueDesigns = new Map();
      [
        ...userUploadedDesigns,
        ...userLikedDesigns,
        ...userSavedDesigns,
      ].forEach((design) => {
        allUniqueDesigns.set(design._id, design);
      });
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
      document.getElementById("libraryPagination").innerHTML = "";
      return;
    }

    paginatedDesigns.forEach((design) => {
      const designCard = createDesignCard(design, "library");
      container.appendChild(designCard);
    });

    renderPagination(totalPages, currentPage, "libraryPagination", (p) =>
      loadLibraryDesigns(filter, p)
    );
  } catch (error) {
    console.error("Error loading library designs:", error);
    showToast("error", "Không thể tải thư viện. Vui lòng thử lại.");
  }
}

// Lọc thư viện (giữ nguyên logic frontend)
function filterLibrary(filter) {
  document.querySelectorAll("#libraryTab button").forEach((btn) => {
    btn.classList.remove("bg-purple-200", "dark:bg-gray-600");
  });
  document
    .getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`)
    .classList.add("bg-purple-200", "dark:bg-gray-600");
  loadLibraryDesigns(filter, 1);
}

// Like/Unlike design
async function toggleLike(designId) {
  if (!currentUser) {
    showLoginModal();
    return;
  }

  let design = await findDesignById(designId);
  if (!design) return;

  let userLikedDesigns = likedDesigns[currentUser._id] || [];
  const isCurrentlyLiked = userLikedDesigns.some((d) => d._id === design._id);

  let newLikesCount = design.likes;
  if (isCurrentlyLiked) {
    newLikesCount--;
    userLikedDesigns = userLikedDesigns.filter((d) => d._id !== design._id);
  } else {
    newLikesCount++;
    userLikedDesigns.push({ _id: design._id }); // Store only ID for liked/saved
  }

  try {
    const response = await fetch(`${API_BASE_URL}/designs/${designId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ likes: newLikesCount }),
    });

    if (response.ok) {
      design.likes = newLikesCount; // Update local design object
      likedDesigns[currentUser._id] = userLikedDesigns;
      localStorage.setItem(
        `likedDesigns_${currentUser._id}`,
        JSON.stringify(userLikedDesigns)
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
    } else {
      const errorData = await response.json();
      showToast("error", errorData.message || "Không thể cập nhật lượt thích.");
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    showToast("error", "Đã xảy ra lỗi khi cập nhật lượt thích.");
  }
}

// Toggle Save design
async function toggleSave(designId) {
  if (!currentUser) {
    showLoginModal();
    return;
  }

  let design = await findDesignById(designId);
  if (!design) return;

  let userSavedDesigns = savedDesigns[currentUser._id] || [];
  const isCurrentlySaved = userSavedDesigns.some((d) => d._id === design._id);

  if (isCurrentlySaved) {
    userSavedDesigns = userSavedDesigns.filter((d) => d._id !== design._id);
  } else {
    userSavedDesigns.push({ _id: design._id }); // Store only ID for liked/saved
  }

  savedDesigns[currentUser._id] = userSavedDesigns;
  localStorage.setItem(
    `savedDesigns_${currentUser._id}`,
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

// Tải bình luận
async function loadComments(designId, commentListId) {
  const commentList = document.getElementById(commentListId);
  if (!commentList) return;
  commentList.innerHTML = "";

  try {
    const response = await fetch(`${API_BASE_URL}/designs/${designId}`, {
      headers: getAuthHeaders(),
    });
    const design = await response.json();

    if (design && design.comments && design.comments.length > 0) {
      design.comments.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      ); // Sort by time
      for (const comment of design.comments) {
        const commentDiv = document.createElement("div");
        commentDiv.className = "flex items-start gap-3 mb-2";
        commentDiv.id = `comment-${comment._id}`;

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
                          comment._id
                        }">${comment.text}</p>
                        <input type="text" id="edit-comment-input-${
                          comment._id
                        }" class="hidden w-full px-2 py-1 border border-custom rounded-md bg-custom-white text-custom-primary text-sm" value="${
          comment.text
        }">
                        <span class="text-xs text-custom-secondary">${formatTimeAgo(
                          comment.timestamp
                        )}</span>
                        ${
                          isMyComment
                            ? `
                                <div class="flex gap-2 mt-1">
                                    ${
                                      canEdit
                                        ? `<button onclick="editComment('${designId}', '${comment._id}', '${commentListId}')" class="text-xs text-blue-500 hover:underline" id="edit-btn-${comment._id}" data-i18n="editComment">${translations[currentLanguage].editComment}</button>`
                                        : ""
                                    }
                                    <button onclick="confirmDeleteComment('${designId}', '${
                                comment._id
                              }', '${commentListId}')" class="text-xs text-red-500 hover:underline" data-i18n="deleteComment">${
                                translations[currentLanguage].deleteComment
                              }</button>
                                </div>
                            `
                            : ""
                        }
                    </div>
                `;
        commentList.appendChild(commentDiv);
      }
    } else {
      commentList.innerHTML = `<p class="text-custom-secondary text-sm">${
        translations[currentLanguage].noComments || "Chưa có bình luận nào."
      }</p>`;
    }
  } catch (error) {
    console.error("Error loading comments:", error);
    showToast("error", "Không thể tải bình luận. Vui lòng thử lại.");
  }
}

// Thêm bình luận
async function addComment(designId, inputId, listId) {
  if (!currentUser) {
    showLoginModal();
    return;
  }
  const commentInput = document.getElementById(inputId);
  const commentText = commentInput.value.trim();

  if (!commentText) {
    showToast(
      "error",
      translations[currentLanguage].commentCannotBeEmpty ||
        "Bình luận không được để trống!"
    );
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/designs/${designId}/comments`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: commentText }),
      }
    );

    if (response.ok) {
      commentInput.value = "";
      loadComments(designId, listId);
      loadDiscoverDesigns(
        document.getElementById("designSearchInput").value,
        currentPage
      );
      loadLibraryDesigns(currentFilter, currentPage);
      updateDesignDetailModal(designId);
    } else {
      const errorData = await response.json();
      showToast("error", errorData.message || "Không thể thêm bình luận.");
    }
  } catch (error) {
    console.error("Error adding comment:", error);
    showToast("error", "Đã xảy ra lỗi khi thêm bình luận.");
  }
}

// Sửa bình luận
async function editComment(designId, commentId, listId) {
  if (!currentUser) {
    showLoginModal();
    return;
  }

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

    try {
      const response = await fetch(
        `${API_BASE_URL}/designs/${designId}/comments/${commentId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ text: newText }),
        }
      );

      if (response.ok) {
        loadComments(designId, listId);
        updateDesignDetailModal(designId);
        editButton.textContent = translations[currentLanguage].editComment;
        commentTextElement.classList.remove("hidden");
        editInput.classList.add("hidden");
      } else {
        const errorData = await response.json();
        showToast("error", errorData.message || "Không thể sửa bình luận.");
      }
    } catch (error) {
      console.error("Error editing comment:", error);
      showToast("error", "Đã xảy ra lỗi khi sửa bình luận.");
    }
  } else {
    // Enable editing
    commentTextElement.classList.add("hidden");
    editInput.classList.remove("hidden");
    editInput.focus();
    editButton.textContent = translations[currentLanguage].saveComment;
  }
}

// Xác nhận xóa bình luận (giữ nguyên logic frontend)
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
async function deleteComment(designId, commentId, listId) {
  if (!currentUser) {
    showLoginModal();
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/designs/${designId}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (response.ok) {
      loadComments(designId, listId);
      loadDiscoverDesigns(
        document.getElementById("designSearchInput").value,
        currentPage
      );
      loadLibraryDesigns(currentFilter, currentPage);
      updateDesignDetailModal(designId);
      showToast(
        "success",
        translations[currentLanguage].commentDeleted || "Bình luận đã được xóa."
      );
    } else {
      const errorData = await response.json();
      showToast("error", errorData.message || "Không thể xóa bình luận.");
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    showToast("error", "Đã xảy ra lỗi khi xóa bình luận.");
  }
}

// Helper function to find a design by ID (now fetches from API)
async function findDesignById(designId) {
  try {
    const response = await fetch(`${API_BASE_URL}/designs/${designId}`, {
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Error finding design by ID:", error);
    return null;
  }
}

// Helper function to update a design in storage (no longer needed for backend designs)
// This function is now effectively replaced by direct API calls in toggleLike, addComment, etc.
// For liked/saved status, we update local storage for quick UI feedback.
// function updateDesignInStorage(updatedDesign) { /* ... */ }

// Display selected file name (giữ nguyên logic frontend)
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

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    analyzeDesignForUpload(title, description, e.target.result);
  };

  reader.readAsDataURL(file);
}

// Phân tích AI cho upload (giữ nguyên logic mô phỏng frontend)
function analyzeDesignForUpload(title, description, imageData) {
  const isDuplicate = Math.random() < 0.3;
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
  document.getElementById("aiAnalysisImage").src = imageData;

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

// Đóng phân tích AI (giữ nguyên logic frontend)
function closeAIAnalysis() {
  document.getElementById("aiAnalysisModal").classList.add("hidden");
  currentDesignForAnalysis = null;
}

// Phê duyệt design (gửi lên backend)
async function approveDesign() {
  if (currentDesignForAnalysis && !currentDesignForAnalysis.isDuplicate) {
    try {
      const response = await fetch(`${API_BASE_URL}/designs`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: currentDesignForAnalysis.title,
          description: currentDesignForAnalysis.description,
          image: currentDesignForAnalysis.image,
          hashtags: ["new", "design", "upload"], // Example hashtags
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form
        document.getElementById("designTitle").value = "";
        document.getElementById("designDescription").value = "";
        document.getElementById("designUpload").value = "";
        document.getElementById("fileNameDisplay").textContent = "";

        showToast(
          "success",
          translations[currentLanguage].uploadSuccess ||
            "Upload thiết kế thành công!"
        );
        closeAIAnalysis();
        showTab("library");
        filterLibrary("myDesigns"); // Show user's designs after upload
      } else {
        showToast("error", data.message || "Upload thiết kế thất bại!");
      }
    } catch (error) {
      console.error("Error uploading design:", error);
      showToast("error", "Đã xảy ra lỗi khi upload thiết kế.");
    }
  } else {
    showToast(
      "error",
      translations[currentLanguage].duplicateDesign ||
        "Thiết kế bị trùng lặp, không thể upload!"
    );
  }
}

// Từ chối design (giữ nguyên logic frontend)
function rejectDesign() {
  showToast(
    "info",
    translations[currentLanguage].designRejected || "Thiết kế đã bị từ chối!"
  );
  closeAIAnalysis();
}

// Function to confirm deletion of a design (giữ nguyên logic frontend)
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
async function deleteDesign(designId) {
  if (!currentUser) {
    showToast(
      "error",
      translations[currentLanguage].loginRequired ||
        "Bạn cần đăng nhập để thực hiện hành động này."
    );
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/designs/${designId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      // Remove from liked/saved locally if it was there
      likedDesigns[currentUser._id] = (
        likedDesigns[currentUser._id] || []
      ).filter((d) => d._id !== designId);
      localStorage.setItem(
        `likedDesigns_${currentUser._id}`,
        JSON.stringify(likedDesigns[currentUser._id])
      );

      savedDesigns[currentUser._id] = (
        savedDesigns[currentUser._id] || []
      ).filter((d) => d._id !== designId);
      localStorage.setItem(
        `savedDesigns_${currentUser._id}`,
        JSON.stringify(savedDesigns[currentUser._id])
      );

      showToast(
        "success",
        translations[currentLanguage].deleteSuccess ||
          "Thiết kế đã được xóa thành công!"
      );
      loadDiscoverDesigns(
        document.getElementById("designSearchInput").value,
        currentPage
      );
      loadLibraryDesigns(currentFilter, currentPage);
      if (currentDesignIdForDetail === designId) {
        closeDesignDetailModal();
      }
    } else {
      const errorData = await response.json();
      showToast("error", errorData.message || "Không thể xóa thiết kế.");
    }
  } catch (error) {
    console.error("Error deleting design:", error);
    showToast("error", "Đã xảy ra lỗi khi xóa thiết kế.");
  }
}

// Function to confirm deletion of all user's designs (giữ nguyên logic frontend)
async function confirmDeleteAllMyDesigns() {
  if (!currentUser) {
    showToast(
      "error",
      translations[currentLanguage].loginRequired ||
        "Bạn cần đăng nhập để thực hiện hành động này."
    );
    return;
  }

  // Fetch all designs by the current user first
  try {
    const response = await fetch(`${API_BASE_URL}/designs`, {
      headers: getAuthHeaders(),
    });
    const allDesigns = await response.json();
    const userDesigns = allDesigns.filter(
      (d) => d.authorId === currentUser._id
    );

    if (userDesigns.length === 0) {
      showToast(
        "info",
        translations[currentLanguage].noDesignsToDelete ||
          "Bạn không có thiết kế nào để xóa."
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
  } catch (error) {
    console.error("Error fetching user designs for bulk delete:", error);
    showToast("error", "Không thể tải thiết kế của bạn để xóa.");
  }
}

// Function to delete all user's designs
async function deleteAllMyDesigns() {
  if (!currentUser) return;

  try {
    const response = await fetch(`${API_BASE_URL}/designs`, {
      headers: getAuthHeaders(),
    });
    const allDesigns = await response.json();
    const userDesignsToDelete = allDesigns.filter(
      (d) => d.authorId === currentUser._id
    );

    if (userDesignsToDelete.length === 0) {
      showToast(
        "info",
        translations[currentLanguage].noDesignsToDelete ||
          "Bạn không có thiết kế nào để xóa."
      );
      return;
    }

    // Delete each design one by one (or implement a bulk delete API if available)
    const deletePromises = userDesignsToDelete.map((design) =>
      fetch(`${API_BASE_URL}/designs/${design._id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
    );

    const results = await Promise.all(deletePromises);
    const successfulDeletes = results.filter((res) => res.ok).length;

    if (successfulDeletes === userDesignsToDelete.length) {
      // Clear liked/saved locally for these designs
      likedDesigns[currentUser._id] = (
        likedDesigns[currentUser._id] || []
      ).filter((d) => !userDesignsToDelete.some((ud) => ud._id === d._id));
      localStorage.setItem(
        `likedDesigns_${currentUser._id}`,
        JSON.stringify(likedDesigns[currentUser._id])
      );

      savedDesigns[currentUser._id] = (
        savedDesigns[currentUser._id] || []
      ).filter((d) => !userDesignsToDelete.some((ud) => ud._id === d._id));
      localStorage.setItem(
        `savedDesigns_${currentUser._id}`,
        JSON.stringify(savedDesigns[currentUser._id])
      );

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
      showToast("error", "Một số thiết kế không thể xóa. Vui lòng thử lại.");
    }
  } catch (error) {
    console.error("Error deleting all designs:", error);
    showToast("error", "Đã xảy ra lỗi khi xóa tất cả thiết kế.");
  }
}
