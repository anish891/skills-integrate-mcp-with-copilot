// ...existing code...

// Admin modal elements
const adminIcon = document.getElementById("admin-icon");
const adminModal = document.getElementById("admin-modal");
const closeAdminModal = document.getElementById("close-admin-modal");
const adminLoginForm = document.getElementById("admin-login-form");
const adminLoginMessage = document.getElementById("admin-login-message");

let isAdmin = false;

if (adminIcon) {
  adminIcon.addEventListener("click", () => {
    adminModal.classList.remove("hidden");
    adminLoginMessage.classList.add("hidden");
    adminLoginForm.reset();
  });
}
if (closeAdminModal) {
  closeAdminModal.addEventListener("click", () => {
    adminModal.classList.add("hidden");
  });
}

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("admin-username").value;
    const password = document.getElementById("admin-password").value;
    // Demo: username: teacher, password: secret123
    if (username === "teacher" && password === "secret123") {
      isAdmin = true;
      adminLoginMessage.textContent = "Login successful! You are now in admin mode.";
      adminLoginMessage.className = "success";
      adminLoginMessage.classList.remove("hidden");
      setTimeout(() => {
        adminModal.classList.add("hidden");
        fetchActivities();
      }, 1000);
    } else {
      adminLoginMessage.textContent = "Invalid credentials.";
      adminLoginMessage.className = "error";
      adminLoginMessage.classList.remove("hidden");
    }
  });
}

async function fetchActivities() {
  try {
    const response = await fetch("/activities");
    const activities = await response.json();
    activitiesList.innerHTML = "";
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
    Object.entries(activities).forEach(([name, details]) => {
      const card = document.createElement("div");
      card.className = "activity-card";
      card.innerHTML = `
        <h4>${name}</h4>
        <p>${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <p><strong>Max Participants:</strong> ${details.max_participants}</p>
        <div class="participants-section">
          <h5>Participants</h5>
          <ul>
            ${details.participants && details.participants.length > 0
              ? details.participants.map(email => `<li><span class="participant-email">${email}</span>${isAdmin ? `<button class="delete-btn" data-activity="${name}" data-email="${email}">Remove</button>` : ''}</li>`).join("")
              : '<p>No participants yet.</p>'}
          </ul>
        </div>
      `;
      activitiesList.appendChild(card);
      // Add option to select dropdown
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });
    // Add event listeners to delete buttons (admin only)
    if (isAdmin) {
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    }
  } catch (error) {
    activitiesList.innerHTML =
      "<p>Failed to load activities. Please try again later.</p>";
    console.error("Error fetching activities:", error);
  }
}

async function handleUnregister(event) {
  const button = event.target;
  const activity = button.getAttribute("data-activity");
  const email = button.getAttribute("data-email");
  try {
    const response = await fetch(
      `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
      {
        method: "DELETE",
      }
    );
    const result = await response.json();
    if (response.ok) {
      button.parentElement.remove();
      messageDiv.textContent = result.message || "Unregistered successfully.";
      messageDiv.className = "success";
    } else {
      messageDiv.textContent = result.detail || "Failed to unregister.";
      messageDiv.className = "error";
    }
    messageDiv.classList.remove("hidden");
  } catch (error) {
    messageDiv.textContent = "Error unregistering participant.";
    messageDiv.className = "error";
    messageDiv.classList.remove("hidden");
  }
}

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const activity = document.getElementById("activity").value;
  try {
    const response = await fetch(`/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`, {
      method: "POST"
    });
    const result = await response.json();
    if (response.ok) {
      messageDiv.textContent = result.message || "Signed up successfully!";
      messageDiv.className = "success";
      fetchActivities();
    } else {
      messageDiv.textContent = result.detail || "Failed to sign up.";
      messageDiv.className = "error";
    }
    messageDiv.classList.remove("hidden");
  } catch (error) {
    messageDiv.textContent = "Error signing up.";
    messageDiv.className = "error";
    messageDiv.classList.remove("hidden");
  }
});

fetchActivities();
