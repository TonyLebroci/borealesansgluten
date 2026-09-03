// Boréale sans gluten — script unique, sans build.

document.addEventListener("DOMContentLoaded", () => {
  initNavMobile();
  initConfirmation();
});

// ---- Menu mobile -----------------------------------------------------------
function initNavMobile() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  if (!header || !toggle) return;

  toggle.addEventListener("click", () => {
    const ouvert = header.classList.toggle("open");
    toggle.setAttribute("aria-expanded", ouvert ? "true" : "false");
  });

  header.querySelectorAll(".main-nav a").forEach((lien) => {
    lien.addEventListener("click", () => header.classList.remove("open"));
  });
}

// ---- Modale de confirmation d'envoi (formulaire de contact) ---------------
function initConfirmation() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("envoye") !== "1") return;
  afficherConfirmation();
}

function afficherConfirmation() {
  const backdrop = document.createElement("div");
  backdrop.className = "confirmation-backdrop";
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");
  backdrop.innerHTML = `
    <div class="confirmation-modal">
      <button class="confirmation-close" aria-label="Fermer">&times;</button>
      <h2>Message envoyé</h2>
      <p>Merci ! Votre message a bien été transmis à Boréale sans gluten. Chef Phil vous répondra rapidement.</p>
      <button class="btn btn-primary confirmation-ok">Fermer</button>
    </div>
  `;
  document.body.appendChild(backdrop);
  document.body.style.overflow = "hidden";

  const fermer = () => {
    backdrop.remove();
    document.body.style.overflow = "";
  };
  backdrop.querySelector(".confirmation-close").addEventListener("click", fermer);
  backdrop.querySelector(".confirmation-ok").addEventListener("click", fermer);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) fermer(); });
  document.addEventListener("keydown", function onEsc(e) {
    if (e.key === "Escape") { fermer(); document.removeEventListener("keydown", onEsc); }
  });
}
