# H. Digital Agency — Sitio Web Profesional

## 📋 Descripción
Sitio web de una agencia digital española con estética brutalista, diseñado para presentar servicios de web design, software, IA, legal compliance, apps móviles y SEO/marketing digital.

## 📁 Archivos Incluidos

### Página Principal
- **index.html** — Página de inicio con hero section, servicios, identidad, proceso y contacto

### Páginas de Servicios
- **paginas-web.html** — Diseño y desarrollo web
- **legal-rgpd.html** — Cumplimiento legal RGPD/cookies
- **software-medida.html** — Software personalizado
- **ia-automation.html** — Automatización con IA
- **apps-moviles.html** — Desarrollo de apps móviles
- **seo-marketing.html** — SEO y marketing digital

### Recursos Multimedia
- **logopng.png** — Logo de H.
- **75b658b9-7631-4d36-a604-e0ba8a9c7337_0.mp4** — Video del logo H. rotando

## 🚀 Cómo Ejecutar

### Opción 1: Abrir Directamente (Recomendado)
1. Navega a `c:\Users\hodei\Desktop\PROYECTOS\H.com\`
2. Haz doble clic en `index.html`
3. Se abrirá automáticamente en tu navegador

### Opción 2: Usar un Servidor Local
```powershell
cd c:\Users\hodei\Desktop\PROYECTOS\H.com
python -m http.server 8000
```
Luego abre `http://localhost:8000` en tu navegador.

### Opción 3: Live Server en VS Code
1. Instala la extensión "Live Server"
2. Click derecho en `index.html`
3. Selecciona "Open with Live Server"

## 🎨 Características de Diseño

### Estética Brutalista
- **Fondo**: Negro puro (#080808)
- **Acento principal**: Amarillo ácido (#C8FF00)
- **Secundario**: Gris concreto (#8C8C7A)
- **Tipografía**: Bebas Neue (headings) + DM Mono (body)

### Características Técnicas
- Single Page Application (SPA)
- Responsive design (mobile-first)
- Animaciones con IntersectionObserver
- Sin librerías externas (vanilla CSS/JS)
- Formulario de contacto funcional
- Video hero con fallback

## 📱 Secciones Principales

1. **Hero** — Video, headline masivo y subline staggered
2. **Servicios** — 6 cards clicables que llevan a páginas detalladas
3. **Identidad** — 3 bloques: FULL STACK / 100% LEGAL / IA FIRST
4. **Proceso** — 4 pasos de trabajo con línea animada
5. **Contacto** — Formulario profesional con información de contacto
6. **Footer** — Copyright y "Hecho en Madrid"

## 🔧 Personalización

### Cambiar Colores
En `index.html`, busca `:root` y modifica:
```css
:root {
    --black: #080808;
    --white: #ffffff;
    --acid-yellow: #C8FF00;
    --concrete-gray: #8C8C7A;
}
```

### Cambiar Información de Contacto
En `index.html`, busca la sección `CONTACTO` y actualiza:
- Email: `info@h.digital`
- Teléfono: `+34 91 XXX XXXX`
- Ubicación: Actualiza coordenadas si es necesario

### Cambiar Logo
Reemplaza `logopng.png` con tu logo. Mantén la altura de 40px en el header.

### Cambiar Video
Reemplaza `75b658b9-7631-4d36-a604-e0ba8a9c7337_0.mp4` con otro archivo. El sitio muestra un fallback si no encuentra el video.

## 📊 Navegación

La barra de navegación fija permite acceder a:
- SERVICIOS → 6 tipos de servicios con páginas detalladas
- LEGAL → Información sobre cumplimiento
- SOFTWARE → Detalles de desarrollo custom
- IA → Automatización inteligente
- CONTACTO → Formulario profesional
- EMPEZAR → Botón CTA hacia contacto

## 💡 Funcionalidades JavaScript

- Menú hamburguesa responsivo
- Animaciones de scroll
- Typewriter effect en bloques de identidad
- Splatter effect en service cards
- Blur de partículas flotantes en hero
- Validación de formulario

## 📄 Estructura de Archivos

```
H.com/
├── index.html                    (página principal)
├── paginas-web.html             (servicio 1)
├── legal-rgpd.html              (servicio 2)
├── software-medida.html         (servicio 3)
├── ia-automation.html           (servicio 4)
├── apps-moviles.html            (servicio 5)
├── seo-marketing.html           (servicio 6)
├── logopng.png                  (logo)
├── 75b658b9-7631-4d36...mp4    (video hero)
└── README.md                    (este archivo)
```

## 🌐 Compatibilidad

- ✅ Chrome/Edge/Firefox/Safari
- ✅ Responsive (mobile, tablet, desktop)
- ✅ HTML5 nativo
- ✅ CSS3 custom properties
- ✅ Vanilla JavaScript (sin dependencies)

## 📝 Notas

- Todo el código está en archivos HTML únicos (CSS + JS embebido)
- No requiere compilación ni build process
- Compatible con cualquier servidor web
- Fácil de personalizar y mantener
- Performance optimizado

---

**H. Digital Agency © 2025 — Hecho en Madrid**
