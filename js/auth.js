// Đăng ký
function register() {
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

  if (users.find((user) => user.email === email)) {
    showToast(
      "error",
      translations[currentLanguage].emailExists || "Email đã tồn tại!"
    );
    return;
  }

  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password,
    avatar: avatars[Math.floor(Math.random() * avatars.length)], // Gán avatar ngẫu nhiên
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  showToast(
    "success",
    translations[currentLanguage].registerSuccess || "Đăng ký thành công!"
  );
  showLoginModal();
}

// Đăng nhập
function login() {
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

  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    // Load user-specific data
    userDesigns[currentUser.id] =
      JSON.parse(localStorage.getItem(`userDesigns_${currentUser.id}`)) || [];
    likedDesigns[currentUser.id] =
      JSON.parse(localStorage.getItem(`likedDesigns_${currentUser.id}`)) || [];
    searchHistory[currentUser.id] =
      JSON.parse(localStorage.getItem(`searchHistory_${currentUser.id}`)) || [];

    // Chuyển sang view sau đăng nhập
    document.getElementById("preLoginView").classList.add("hidden");
    document.getElementById("postLoginView").classList.remove("hidden");

    closeModal("loginModal");

    // Hiển thị tab mặc định
    showTab("discover");

    // Cập nhật user welcome và avatar
    updateUserDisplay();

    // Tải dữ liệu
    loadDiscoverDesigns();
    loadLibraryDesigns();
    renderNotifications(); // Render notifications for the logged-in user
    showToast(
      "success",
      translations[currentLanguage].welcome + " " + currentUser.name + "!"
    );
  } else {
    showToast(
      "error",
      translations[currentLanguage].loginFailed ||
        "Email hoặc mật khẩu không đúng!"
    );
  }
}

// Kiểm tra auth
function checkAuth() {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    // Load user-specific data
    userDesigns[currentUser.id] =
      JSON.parse(localStorage.getItem(`userDesigns_${currentUser.id}`)) || [];
    likedDesigns[currentUser.id] =
      JSON.parse(localStorage.getItem(`likedDesigns_${currentUser.id}`)) || [];
    searchHistory[currentUser.id] =
      JSON.parse(localStorage.getItem(`searchHistory_${currentUser.id}`)) || [];

    document.getElementById("preLoginView").classList.add("hidden");
    document.getElementById("postLoginView").classList.remove("hidden");
    showTab("discover");
    loadDiscoverDesigns();
    loadLibraryDesigns();
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
function saveProfileChanges() {
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

  currentUser.name = newName;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Update the user in the global users array as well
  const userIndex = users.findIndex((user) => user.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex].name = newName;
    users[userIndex].avatar = currentUser.avatar; // Also update avatar in global users
    localStorage.setItem("users", JSON.stringify(users));
  }

  updateUserDisplay();
  closeModal("profileEditModal");
  showToast(
    "success",
    translations[currentLanguage].profileUpdateSuccess ||
      "Cập nhật profile thành công!"
  );
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

  const userExists = users.some((user) => user.email === email);
  if (!userExists) {
    showToast(
      "error",
      translations[currentLanguage].invalidEmail || "Email không tồn tại!"
    );
    return;
  }

  forgotPasswordUserEmail = email;
  // In a real application, you would send a code to the user's email here.
  // For this demo, we just simulate it.
  showToast(
    "info",
    translations[currentLanguage].codeSentInfo ||
      "Mã xác nhận đã được gửi đến email của bạn (mọi mã đều hợp lệ)."
  );
  document.getElementById("forgotPasswordStep1").classList.add("hidden");
  document.getElementById("forgotPasswordStep2").classList.remove("hidden");
  updateLanguage(); // Update language for step 2 content
}

function resetPassword() {
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

  if (forgotPasswordUserEmail) {
    const userIndex = users.findIndex(
      (user) => user.email === forgotPasswordUserEmail
    );
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem("users", JSON.stringify(users));
      showToast(
        "success",
        translations[currentLanguage].resetPasswordSuccess ||
          "Đặt lại mật khẩu thành công!"
      );
      closeModal("forgotPasswordModal");
      showLoginModal(); // Redirect to login after successful reset
    } else {
      showToast(
        "error",
        translations[currentLanguage].invalidEmail || "Email không tồn tại!"
      );
    }
  } else {
    showToast(
      "error",
      translations[currentLanguage].noEmailFoundForReset ||
        "Không tìm thấy email để đặt lại mật khẩu. Vui lòng thử lại."
    );
  }
}
