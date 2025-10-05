// Đăng ký
async function register() {
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById(
    "registerConfirmPassword"
  ).value;

  if (!name || !email || !password || !confirmPassword) {
    showToast(
      "error",
      translations[currentLanguage].fillAllFields ||
        "Vui lòng điền đầy đủ thông tin!"
    );
    return;
  }

  if (password !== confirmPassword) {
    showToast(
      "error",
      translations[currentLanguage].passwordNotMatch ||
        "Mật khẩu xác nhận không khớp!"
    );
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast(
        "success",
        translations[currentLanguage].registerSuccess || "Đăng ký thành công!"
      );
      showLoginModal();
    } else {
      showToast("error", data.message || "Đăng ký thất bại!");
    }
  } catch (error) {
    console.error("Registration error:", error);
    showToast("error", "Đã xảy ra lỗi khi đăng ký.");
  }
}

// Đăng nhập
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showToast(
      "error",
      translations[currentLanguage].fillAllFields ||
        "Vui lòng điền đầy đủ thông tin!"
    );
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      currentUser = data; // Store user data including token
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      // Load user-specific data from localStorage (for liked/saved/history)
      likedDesigns[currentUser._id] =
        JSON.parse(localStorage.getItem(`likedDesigns_${currentUser._id}`)) ||
        [];
      savedDesigns[currentUser._id] =
        JSON.parse(localStorage.getItem(`savedDesigns_${currentUser._id}`)) ||
        [];
      searchHistory[currentUser._id] =
        JSON.parse(localStorage.getItem(`searchHistory_${currentUser._id}`)) ||
        [];

      document.getElementById("preLoginView").classList.add("hidden");
      document.getElementById("postLoginView").classList.remove("hidden");

      closeModal("loginModal");

      showTab("discover");
      updateUserDisplay();
      renderNotifications(); // Render notifications for the logged-in user
      showToast(
        "success",
        translations[currentLanguage].welcome + " " + currentUser.name + "!"
      );
    } else {
      showToast(
        "error",
        data.message ||
          translations[currentLanguage].loginFailed ||
          "Email hoặc mật khẩu không đúng!"
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    showToast("error", "Đã xảy ra lỗi khi đăng nhập.");
  }
}

// Kiểm tra auth
function checkAuth() {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    // Load user-specific data from localStorage (for liked/saved/history)
    likedDesigns[currentUser._id] =
      JSON.parse(localStorage.getItem(`likedDesigns_${currentUser._id}`)) || [];
    savedDesigns[currentUser._id] =
      JSON.parse(localStorage.getItem(`savedDesigns_${currentUser._id}`)) || [];
    searchHistory[currentUser._id] =
      JSON.parse(localStorage.getItem(`searchHistory_${currentUser._id}`)) ||
      [];

    document.getElementById("preLoginView").classList.add("hidden");
    document.getElementById("postLoginView").classList.remove("hidden");
    showTab("discover");
    updateUserDisplay();
    renderNotifications();
  }
}

// Xác nhận đăng xuất
function confirmLogout() {
  showConfirmationModal(
    translations[currentLanguage].confirmLogoutTitle || "Xác nhận đăng xuất",
    translations[currentLanguage].confirmLogoutMessage ||
      "Bạn có chắc chắn muốn đăng xuất không?",
    logout
  );
}

// Đăng xuất
function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  // Clear local user-specific data
  likedDesigns = {};
  savedDesigns = {};
  searchHistory = {};

  document.getElementById("preLoginView").classList.remove("hidden");
  document.getElementById("postLoginView").classList.add("hidden");
  showToast(
    "info",
    translations[currentLanguage].loggedOut || "Bạn đã đăng xuất."
  );
}

// Hiển thị modal chỉnh sửa profile
function showProfileEditModal() {
  if (!currentUser) {
    showLoginModal();
    return;
  }

  document.getElementById("editProfileName").value = currentUser.name;

  const profileAvatarGrid = document.getElementById("profileAvatarGrid");
  profileAvatarGrid.innerHTML = "";
  avatars.forEach((avatarUrl) => {
    const img = document.createElement("img");
    img.src = avatarUrl;
    img.className =
      "w-16 h-16 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform";
    img.classList.toggle("border-4", avatarUrl === currentUser.avatar); // Highlight current avatar
    img.classList.toggle("border-purple-500", avatarUrl === currentUser.avatar);
    img.onclick = () => selectProfileAvatar(avatarUrl);
    profileAvatarGrid.appendChild(img);
  });
  document.getElementById("profileEditModal").classList.remove("hidden");
}

// Chọn avatar trong modal chỉnh sửa profile
function selectProfileAvatar(avatarUrl) {
  if (currentUser) {
    currentUser.avatar = avatarUrl;
    // Update UI to show selected avatar
    const profileAvatarGrid = document.getElementById("profileAvatarGrid");
    Array.from(profileAvatarGrid.children).forEach((img) => {
      img.classList.remove("border-4", "border-purple-500");
      if (img.src === avatarUrl) {
        img.classList.add("border-4", "border-purple-500");
      }
    });
  }
}

// Lưu thay đổi profile
async function saveProfileChanges() {
  if (!currentUser) return;

  const newName = document.getElementById("editProfileName").value.trim();
  if (newName === "") {
    showToast(
      "error",
      translations[currentLanguage].profileUpdateError ||
        "Tên không được để trống!"
    );
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: newName, avatar: currentUser.avatar }),
    });

    const data = await response.json();

    if (response.ok) {
      currentUser.name = data.name;
      currentUser.avatar = data.avatar;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      updateUserDisplay();
      closeModal("profileEditModal");
      showToast(
        "success",
        translations[currentLanguage].profileUpdateSuccess ||
          "Cập nhật profile thành công!"
      );
    } else {
      showToast("error", data.message || "Cập nhật profile thất bại!");
    }
  } catch (error) {
    console.error("Profile update error:", error);
    showToast("error", "Đã xảy ra lỗi khi cập nhật profile.");
  }
}

// New functions for Forgot Password flow
function showForgotPasswordModal() {
  closeModal("loginModal"); // Close login modal if open
  document.getElementById("forgotPasswordModal").classList.remove("hidden");
  document.getElementById("forgotPasswordStep1").classList.remove("hidden");
  document.getElementById("forgotPasswordStep2").classList.add("hidden");
  document.getElementById("forgotPasswordEmail").value = ""; // Clear email input
  document.getElementById("resetCode").value = ""; // Clear code input
  document.getElementById("newPassword").value = ""; // Clear new password input
  document.getElementById("confirmNewPassword").value = ""; // Clear confirm new password input
  forgotPasswordUserEmail = null; // Reset stored email
  updateLanguage(); // Update language for modal content
}

function sendResetCode() {
  const email = document.getElementById("forgotPasswordEmail").value.trim();
  if (!email) {
    showToast(
      "error",
      translations[currentLanguage].enterEmailForCode ||
        "Vui lòng nhập email của bạn."
    );
    return;
  }

  // In a real application, you would send a code to the user's email here.
  // For this demo, we just simulate it.
  forgotPasswordUserEmail = email; // Store email for the next step
  showToast(
    "info",
    translations[currentLanguage].codeSentInfo ||
      "Mã xác nhận đã được gửi đến email của bạn (mọi mã đều hợp lệ)."
  );
  document.getElementById("forgotPasswordStep1").classList.add("hidden");
  document.getElementById("forgotPasswordStep2").classList.remove("hidden");
  updateLanguage(); // Update language for step 2 content
}

async function resetPassword() {
  const resetCode = document.getElementById("resetCode").value.trim();
  const newPassword = document.getElementById("newPassword").value;
  const confirmNewPassword =
    document.getElementById("confirmNewPassword").value;

  if (!resetCode || !newPassword || !confirmNewPassword) {
    showToast(
      "error",
      translations[currentLanguage].fillAllFields ||
        "Vui lòng điền đầy đủ thông tin!"
    );
    return;
  }

  // For this demo, any code is valid. In a real app, you'd validate the code.
  // if (resetCode !== "YOUR_VALID_CODE") {
  //     showToast("error", translations[currentLanguage].invalidCode || "Mã xác nhận không đúng!");
  //     return;
  // }

  if (newPassword !== confirmNewPassword) {
    showToast(
      "error",
      translations[currentLanguage].passwordNotMatch ||
        "Mật khẩu xác nhận không khớp!"
    );
    return;
  }

  if (!forgotPasswordUserEmail) {
    showToast(
      "error",
      translations[currentLanguage].noEmailFoundForReset ||
        "Không tìm thấy email để đặt lại mật khẩu. Vui lòng thử lại."
    );
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: forgotPasswordUserEmail, newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast(
        "success",
        translations[currentLanguage].resetPasswordSuccess ||
          "Đặt lại mật khẩu thành công!"
      );
      closeModal("forgotPasswordModal");
      showLoginModal(); // Redirect to login after successful reset
    } else {
      showToast("error", data.message || "Đặt lại mật khẩu thất bại!");
    }
  } catch (error) {
    console.error("Password reset error:", error);
    showToast("error", "Đã xảy ra lỗi khi đặt lại mật khẩu.");
  }
}
