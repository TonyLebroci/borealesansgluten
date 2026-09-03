# CLAUDE.md

Ce fichier guide Claude (et toute personne qui reprend ce dépôt) sur ce projet.

## Aperçu

Site vitrine statique (en français) pour **Boréale sans gluten**, chef à domicile (Chef Philippe
Blais) offrant une cuisine boréale gastronomique 100% sans gluten. Aucun framework, aucune étape de
compilation — HTML/CSS/JS écrits à la main, servis tels quels. Bâti selon la méthode des skills
`site-vitrine` / `nouveau-site-client`.

**Client tiers, pas le développeur.** Le domaine `boréalesansgluten.ca` est déjà activé côté client
sur son compte Cloudflare (confirmé par Tony le 3 septembre 2026). Le domaine et l'hébergement
Cloudflare doivent rester au nom du client — voir la section « Propriété » du skill `site-vitrine`
avant de toucher au DNS ou au compte Cloudflare.

## État du projet (3 septembre 2026)

Structure et contenu en place à partir du brief fourni par Tony (textes réels du chef tirés de ses
publications Instagram @borealesansgluten, photos de plats et du chef fournies dans `Photos/`).
Chercher `[texte entre crochets]`, « À compléter » et « À confirmer avec le client » dans les
fichiers `public/*.html` : ce sont les marqueurs de contenu manquant, volontairement non inventé
(courriel, téléphone, zone desservie, tarification, parcours du chef, délai de réservation). Un
document `.docx` récapitulant ces éléments a été livré à Tony pour le chef.

## Repository layout

- `public/` — tout ce qui est publié. Rien d'autre ne doit y être déposé.
- `medias-sources/` — originaux renommés, jamais servis (`logo.jpg`, `hero-action-*.jpg`,
  `plat-*.jpg`, issus de `Photos/`).
- `outils/convertir-images.py` — redimensionne + convertit en WebP (voir section Images).
- `wrangler.jsonc` — config de déploiement Cloudflare Workers (racine du dépôt, non publié).
- `Photos/` — dépôt brut fourni par Tony, dans `.gitignore`, jamais publié.

## Pages

`index.html`, `menu.html`, `services.html`, `a-propos.html`, `contact.html`, `404.html`,
`confidentialite.html` — chacune un document HTML autonome, en-tête et pied de page dupliqués (pas
de moteur de gabarit). Tout changement au header/nav/footer doit être répercuté dans **tous** les
fichiers, y compris `404.html` (liens racine-relatifs, `/index.html`).

## Palette et typographie

Variables CSS dans `public/css/style.css` (`:root`) : `--forest` (fond, échantillonné du fond du
logo fourni, ≈ `#0b1712`), `--amber` (accent, ≈ `#c98a4b`, évoque l'érable et le cuivre), `--cream`
(texte clair). Polices Google Fonts : **Fraunces** (titres, serif éditorial) et **Inter** (texte
courant).

Logo : icône extraite du fichier `Photos/LOGO.jpg` (fond vert foncé) par seuillage + canal alpha —
voir `outils/` pour la méthode si à refaire (script exécuté en session, non conservé). Le texte
« Boréale / Sans gluten » est en CSS (`.logo-text`), pas dans l'image.

## Développement

```bash
python3 -m http.server 8765 --directory public
```

Puis ouvrir `http://localhost:8765/index.html`.

## Déploiement

Cloudflare Workers (assets statiques), `wrangler.jsonc` avec `html_handling:
"auto-trailing-slash"` et `not_found_handling: "404-page"`. Pas de commande de build — `public/`
est publié tel quel. Nom du Worker : `borealesansgluten` (sans accents, voir contrainte du skill).

**Déploiement automatique par Git prévu.** Le dépôt GitHub doit être connecté au Worker Cloudflare
via l'app GitHub "Cloudflare Workers and Pages" (voir §10 du skill `nouveau-site-client` pour l'ordre
exact des étapes). Chaque `git push` sur `main` déclenche alors un build Cloudflare automatique.

## Images

Un seul fichier `.webp` par photo dans `public/images/`. Toujours `width`/`height` explicites sur
`<img>`, `loading="lazy"` sous la ligne de flottaison. Pour ajouter une vraie photo :

```bash
python3 outils/convertir-images.py medias-sources/ma-photo.jpg 1400
```

Le script affiche les dimensions à recopier dans les attributs `width`/`height`.

Les photos actuelles proviennent du dossier `Photos/` fourni par Tony (photos personnelles du chef
et de ses assiettes) — pas d'une séance photo professionnelle dédiée. À évaluer avec le client si une
séance photo culinaire serait bénéfique.

## Formulaire de contact

`contact.html` poste vers FormSubmit.co — **l'adresse de destination n'est pas configurée**
(`EMAIL-A-CONFIGURER@borealesansgluten.ca` dans l'attribut `action`). La remplacer par la vraie
adresse, puis cliquer le courriel de confirmation que FormSubmit envoie au premier envoi. Le champ
`_honey` est un piège à pourriel (anti-spam), doit rester caché. La confirmation d'envoi est une
modale centrée (`afficherConfirmation` dans `js/main.js`), déclenchée par `?envoye=1`.

**Ne jamais ajouter de champ lié à la santé au formulaire web.** Les allergies alimentaires sont
mentionnées comme discutées hors formulaire, directement avec le chef.

## Tiers et confidentialité (Loi 25)

Aucun témoin n'est déposé par ce site : pas d'iframe tierce chargée automatiquement. Si un widget
tiers est ajouté (carte, agenda, chat, système de réservation), suivre le patron « chargé au clic »
documenté dans le skill `site-vitrine`, et mettre à jour `public/confidentialite.html` **dans le
même commit**.

## Domaine avec accent (IDN)

`boréalesansgluten.ca` existe en punycode sous `xn--boralesansgluten-dqb.ca` — c'est la forme utilisée
dans tous les `<link rel="canonical">`, `sitemap.xml`, `robots.txt` et le champ `_next` du formulaire.
La version ASCII `borealesansgluten.ca` (sans accent) n'existe pas comme domaine réel ; elle n'est
utilisée que comme partie d'adresse courriel provisoire à confirmer.

## Vérification avant toute déclaration de « terminé »

Après tout changement, vérifier que tous les liens internes de toutes les pages renvoient 200 (y
compris `404.html` et le sitemap), tester le menu mobile en Playwright (voir skill
`nouveau-site-client` §7 pour le piège `backdrop-filter`), et tester dans le navigateur, pas
seulement le fichier isolé.
