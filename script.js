let activities = []; 
function getStartOfWeek(date) {
  const day = date.getDay(); 
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff));
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

let currentWeekStart = getStartOfWeek(new Date());

document.addEventListener("DOMContentLoaded", function () {
  const addButton = document.querySelector(".addButton");
  const overlayContainer = document.getElementById("overlay-container");

  updateWeekTitle();
  renderActivities();
  enableSlotClickListeners();

  document.getElementById("prevWeek").addEventListener("click", () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    updateWeekTitle();
    renderActivities();
    enableSlotClickListeners();
  });

  document.getElementById("nextWeek").addEventListener("click", () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    updateWeekTitle();
    renderActivities();
    enableSlotClickListeners();
  });

  if (addButton && overlayContainer) {
    addButton.addEventListener("click", function (e) {
      e.preventDefault();

      fetch("createActivityOverlay.html")
        .then(response => response.text())
        .then(html => {
          overlayContainer.innerHTML = html;

          setTimeout(() => {
            const closeBtn = document.querySelector(".close-button");
            const cancelBtn = document.querySelector(".cancel-button");
            const confirmBtn = document.querySelector(".confirm-button");

            const closeOverlay = () => overlayContainer.innerHTML = "";

            if (closeBtn) closeBtn.addEventListener("click", closeOverlay);
            if (cancelBtn) cancelBtn.addEventListener("click", closeOverlay);

            if (confirmBtn) {
              confirmBtn.addEventListener("click", () => {
                const name = document.querySelector('input[placeholder="Enter activity name"]').value;
                const type = document.querySelector('select:nth-of-type(1)').value;
                const difficulty = document.querySelector('select:nth-of-type(2)').value;
                const date = document.querySelector('input[type="date"]').value;
                const timeFrom = document.querySelectorAll('input[type="time"]')[0].value;
                const timeTo = document.querySelectorAll('input[type="time"]')[1].value;
                const description = document.querySelector('textarea').value;

                if (!name || !date || !timeFrom || !timeTo) {
                  alert("Please fill in all required fields");
                  return;
                }

                const activity = {
                  name,
                  type,
                  difficulty,
                  date,
                  timeFrom,
                  timeTo,
                  description
                };

                activities.push(activity);
                renderActivities();
                enableSlotClickListeners();
                alert("Activity created");
                closeOverlay();
              });
            }
          }, 10);
        })
        .catch(error => console.error("Error loading overlay:", error));
    });
  } else {
    console.warn("Add button or overlay container not found");
  }
});

function updateWeekTitle() {
  const start = new Date(currentWeekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const formatted = `${formatDate(start)} – ${formatDate(end)}`;
  document.getElementById("weekTitle").textContent = formatted;
}

function renderActivities() {
  document.querySelectorAll('.timeSlot').forEach(slot => {
    slot.innerHTML = "";
    slot.style.backgroundColor = "";
    slot.removeAttribute("data-activity-name");
    slot.removeAttribute("data-type");
    slot.removeAttribute("data-difficulty");
    slot.removeAttribute("data-time");
    slot.removeAttribute("data-date");
    slot.removeAttribute("data-description");
  });

  const weekStart = new Date(currentWeekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  activities.forEach(activity => {
    const activityDate = new Date(activity.date);
    if (activityDate < weekStart || activityDate > weekEnd) return; 

    const day = activityDate.toLocaleDateString('en-US', { weekday: 'short' });
    const dayColumn = [...document.querySelectorAll('.dayColumn')].find(col =>
      col.querySelector('.dayHeader')?.textContent === day
    );

    if (!dayColumn) return;

    const fromHour = parseInt(activity.timeFrom.split(":")[0]);
    const toHour = parseInt(activity.timeTo.split(":")[0]);
    const timeSlots = dayColumn.querySelectorAll('.timeSlot');

    for (let i = fromHour; i < toHour; i++) {
      const slot = timeSlots[i];
      slot.style.backgroundColor = getColorByDifficulty(activity.difficulty);

      slot.dataset.activityName = activity.name;
      slot.dataset.type = activity.type;
      slot.dataset.difficulty = activity.difficulty;
      slot.dataset.time = `${activity.timeFrom} - ${activity.timeTo}`;
      slot.dataset.date = activity.date;
      slot.dataset.description = activity.description;
    }
  });
}

function enableSlotClickListeners() {
  document.querySelectorAll('.timeSlot').forEach(slot => {
    slot.onclick = function () {
      if (slot.dataset.activityName) {
        alert(
          `Name: ${slot.dataset.activityName}\n` +
          `Type: ${slot.dataset.type}\n` +
          `Difficulty: ${slot.dataset.difficulty}\n` +
          `Time: ${slot.dataset.time}\n` +
          `Date: ${slot.dataset.date}\n` +
          `Description: ${slot.dataset.description}`
        );
      } else {
        alert("This slot is empty.");
      }
    };
  });
}

function getColorByDifficulty(difficulty) {
  switch (difficulty.toLowerCase()) {
    case "easy": return "#fbacbe";
    case "medium": return "#fc8eac";
    case "hard": return "#e63946";
    case "demon": return "#8f2947";
    default: return "#999";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("toggleDarkMode");

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);
  });

  const savedMode = localStorage.getItem("darkMode");
  if (savedMode === "true") {
    document.body.classList.add("dark-mode");
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const savedMode = localStorage.getItem("darkMode");

  if (savedMode === "true") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const isMobile = window.innerWidth < 600; 

  if (isMobile) {
    document.getElementById("mobile-warning").style.display = "block";
  }
});

// document.addEventListener("DOMContentLoaded", () => {
//   if (window.innerWidth < 768) {
//     document.getElementById("mobile-warning").style.display = "block";
//   }
// });

