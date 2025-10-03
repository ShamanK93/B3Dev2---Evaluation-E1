// Configuration API
const API_URL = 'https://gabistam.github.io/Demo_API/data/projects.json';

// Sélection des éléments DOM
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error');
const projectsGrid = document.getElementById('projectsGrid');
const noResults = document.getElementById('noResults');
const filtersContainer = document.getElementById('filters');
const yearSpan = document.getElementById('year');

// Modal
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

// Affiche l'année courante dans le footer
yearSpan.textContent = new Date().getFullYear();

// Charger les projets depuis l'API
async function loadProjects() {
  try {
    loader.style.display = 'block';
    errorMessage.hidden = true;
    noResults.hidden = true;

    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    displayProjects(data.projects);
    populateTechnologyFilter(data.technologies, data.projects);
  } catch (error) {
    console.error('Erreur de chargement:', error);
    errorMessage.textContent = 'Impossible de charger les projets. Veuillez réessayer.';
    errorMessage.hidden = false;
  } finally {
    loader.style.display = 'none';
  }
}

// Affiche les projets dans la grille
function displayProjects(projects) {
  projectsGrid.innerHTML = '';

  if (projects.length === 0) {
    noResults.hidden = false;
    return;
  }

  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <img src="${project.image}" alt="Aperçu du projet ${project.title}" class="project-image">
      <h4>${project.title}</h4>
      <p class="client">${project.client}</p>
      <div class="tech-list">
        ${project.technologies.map(tech => `<span class="badge">${tech}</span>`).join('')}
      </div>
      <button class="btn-details" data-id="${project.id}">Voir détails</button>
    `;
    projectsGrid.appendChild(card);
  });

  // Ajouter écouteurs sur les boutons détails
  document.querySelectorAll('.btn-details').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = parseInt(e.target.dataset.id, 10);
      openModal(id);
    });
  });
}

// Remplit le menu de filtres
function populateTechnologyFilter(technologies, projects) {
  filtersContainer.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.textContent = 'Tous';
  allBtn.className = 'filter-btn active';
  allBtn.addEventListener('click', () => displayProjects(projects));
  filtersContainer.appendChild(allBtn);

  technologies.forEach(tech => {
    const btn = document.createElement('button');
    btn.textContent = tech;
    btn.className = 'filter-btn';
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filtered = projects.filter(p => p.technologies.includes(tech));
      displayProjects(filtered);
    });
    filtersContainer.appendChild(btn);
  });
}

// Ouvre la modal avec les détails du projet
async function openModal(id) {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    const project = data.projects.find(p => p.id === id);

    if (!project) return;

    modalBody.innerHTML = `
      <h2>${project.title}</h2>
      <p><strong>Client :</strong> ${project.client}</p>
      <p><strong>Catégorie :</strong> ${project.category}</p>
      <p><strong>Année :</strong> ${project.year}</p>
      <p><strong>Durée :</strong> ${project.duration}</p>
      <p>${project.description}</p>
      <ul>
        ${project.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <a href="${project.url}" target="_blank">Visiter le site</a>
    `;

    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'block';
  } catch (error) {
    console.error('Erreur modal:', error);
  }
}
// Gestion du header lors du scroll
let lastScroll = 0;
const header = document.querySelector('.site-header');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > lastScroll && currentScroll > 100) {
    // scroll vers le bas
    header.classList.add('hidden');
  } else {
    // scroll vers le haut
    header.classList.remove('hidden');
  }

  lastScroll = currentScroll;
});

// Fermer la modal
modalClose.addEventListener('click', closeModal);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  modal.style.display = 'none';
}

// Lancer le chargement après le DOM prêt
document.addEventListener('DOMContentLoaded', loadProjects);