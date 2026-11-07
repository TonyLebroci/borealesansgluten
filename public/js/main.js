// Boréale sans gluten — script unique, sans build.

document.addEventListener("DOMContentLoaded", () => {
  initNavMobile();
  initConfirmation();
  initCarte();
  initMenuDansContact();
  initFaq();
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

// ---- La carte du chef (menu.html) -----------------------------------------
// Un plat par service (boutons radio). Le résumé « Votre menu » se remplit et le
// bouton envoie le choix au formulaire de contact (?menu=…).
function initCarte() {
  const carte = document.querySelector(".menu-carte");
  if (!carte) return;
  const services = [...carte.querySelectorAll(".service")];
  const cta = carte.querySelector(".resume-cta");
  const effacer = carte.querySelector(".resume-effacer");
  const compte = carte.querySelector(".resume-compte");
  const barre = carte.querySelector(".resume-barre");
  const barreCompte = carte.querySelector(".resume-barre-compte");
  const resume = carte.querySelector(".menu-resume");

  const mettreAJour = () => {
    const lignes = [];
    services.forEach((s) => {
      const choix = s.querySelector(".plat-choix:checked");
      const li = carte.querySelector(`.resume-liste li[data-service="${s.dataset.service}"]`);
      li.classList.toggle("choisi", !!choix);
      li.querySelector(".resume-plat").textContent = choix ? choix.value : "À choisir";
      if (choix) lignes.push(`${s.dataset.libelle} : ${choix.value}`);
    });
    const n = lignes.length;
    compte.textContent = n;
    barreCompte.textContent = `${n}/${services.length}`;
    effacer.hidden = n === 0;
    cta.href = n ? `contact.html?menu=${encodeURIComponent(lignes.join("\n"))}` : "contact.html";
    cta.firstChild.textContent = n ? "Proposer ce menu " : "Réserver une soirée ";
    afficherBarre();
  };

  // Mobile : petite barre « Votre menu » tant que le résumé n'est pas à l'écran.
  let resumeVisible = false;
  let carteVisible = false;
  const afficherBarre = () => {
    const n = carte.querySelectorAll(".plat-choix:checked").length;
    barre.hidden = !(n > 0 && carteVisible && !resumeVisible);
  };
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((e) => { resumeVisible = e[0].isIntersecting; afficherBarre(); }).observe(resume);
    new IntersectionObserver((e) => { carteVisible = e[0].isIntersecting; afficherBarre(); }).observe(carte.querySelector(".menu-services"));
  }

  carte.addEventListener("change", (e) => {
    if (!e.target.classList.contains("plat-choix")) return;
    mettreAJour();
  });
  effacer.addEventListener("click", () => {
    carte.querySelectorAll(".plat-choix:checked").forEach((r) => { r.checked = false; });
    mettreAJour();
  });

  // Pastilles des services : celle du service à l'écran est mise en évidence.
  const liens = [...carte.querySelectorAll(".services-nav a")];
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entrees) => {
      entrees.forEach((en) => {
        if (!en.isIntersecting) return;
        liens.forEach((l) => {
          const actif = l.hash === `#${en.target.id}`;
          l.classList.toggle("actif", actif);
          // Sur cellulaire, la rangée de pastilles défile pour garder la bonne à l'écran.
          if (actif) l.closest("ul").scrollTo({ left: l.parentElement.offsetLeft - 8, behavior: "smooth" });
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    services.forEach((s) => obs.observe(s));
  }

  // Photo d'un plat, dans une fenêtre (élément <dialog> natif).
  const dialog = carte.querySelector(".photo-dialog");
  const img = dialog.querySelector("img");
  const legende = dialog.querySelector(".photo-legende");
  carte.querySelectorAll(".plat-photo").forEach((b) => {
    b.addEventListener("click", () => {
      img.src = b.dataset.src;
      img.alt = b.dataset.alt;
      img.width = b.dataset.w;
      img.height = b.dataset.h;
      legende.textContent = b.closest(".plat").querySelector(".plat-nom").textContent;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else window.open(b.dataset.src, "_blank");
    });
  });
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });

  mettreAJour();
}

// ---- Contact : menu choisi sur la page Menu --------------------------
function initMenuDansContact() {
  const menu = new URLSearchParams(window.location.search).get("menu");
  const message = document.querySelector(".contact-form textarea");
  if (!menu || !message || message.value) return;
  message.value = `Menu souhaité :\n${menu.split("\n").map((l) => `– ${l}`).join("\n")}\n\n`;
}

// ---- FAQ : sommaire qui suit la lecture + accordéon (page Comment ça marche) ----
// Sans JS, tout reste ouvert et lisible ; la classe .js active les animations.
function initFaq() {
  const section = document.querySelector(".faq-section");
  if (!section) return;
  document.documentElement.classList.add("js");

  const ouvrir = (item, ouvert) => {
    item.classList.toggle("ouvert", ouvert);
    item.querySelector(".faq-q button").setAttribute("aria-expanded", ouvert ? "true" : "false");
  };

  section.querySelectorAll(".faq-item").forEach((item) => {
    item.querySelector(".faq-q button").addEventListener("click", () => {
      const ouvert = !item.classList.contains("ouvert");
      // Une seule réponse ouverte à la fois dans un thème : la lecture reste calme.
      item.parentElement.querySelectorAll(".faq-item.ouvert").forEach((autre) => ouvrir(autre, false));
      ouvrir(item, ouvert);
    });
  });

  // Sommaire : le thème en cours de lecture est mis en évidence.
  const liens = [...section.querySelectorAll(".faq-onglet")];
  const marquer = (id) => liens.forEach((l) => l.setAttribute("aria-current", l.hash === "#" + id ? "true" : "false"));
  marquer(section.querySelector(".faq-groupe").id);
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entrees) => {
      entrees.forEach((e) => { if (e.isIntersecting) marquer(e.target.id); });
    }, { rootMargin: "-35% 0px -60% 0px" });
    section.querySelectorAll(".faq-groupe").forEach((g) => obs.observe(g));
  }

  // La première réponse est ouverte d'entrée : le visiteur voit tout de suite le principe.
  ouvrir(section.querySelector(".faq-item"), true);
}
