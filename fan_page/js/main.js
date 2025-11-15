// js/main.js

// Claves para localStorage
const THEME_KEY = "fanpage_theme";
const FONT_KEY = "fanpage_font_scale";

// Valores por defecto
let currentTheme = "dark";
let currentFontScale = 1;

// ---------- Inicialización cuando el DOM está listo ----------
$(function () {
    // 1) Recuperar configuraciones previas (tema + font size)
    loadPreferences();

    // 2) Configurar eventos de accesibilidad (tamaño fuente + tema)
    setupAccessibilityControls();

    // 3) Configurar menú responsive
    setupNavigation();

    // 4) Configurar validación / panel de contacto (si existen)
    setupContactForms();
});

// ---------- Preferencias de usuario ----------
function loadPreferences() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const savedScale = localStorage.getItem(FONT_KEY);

    if (savedTheme === "light" || savedTheme === "dark") {
        currentTheme = savedTheme;
    }

    if (savedScale) {
        const parsed = parseFloat(savedScale);
        if (!isNaN(parsed) && parsed > 0.7 && parsed < 1.6) {
            currentFontScale = parsed;
        }
    }

    applyTheme();
    applyFontScale();
}

function applyTheme() {
    // Usamos una clase en <body> para cambiar colores desde CSS
    if (currentTheme === "light") {
        $("body").addClass("light-theme");
    } else {
        $("body").removeClass("light-theme");
    }
}

function applyFontScale() {
    // Modificamos el font-size base del <html>
    const baseSize = 16; // px
    const newSize = baseSize * currentFontScale;
    $("html").css("font-size", newSize + "px");
}

// ---------- Controles de accesibilidad ----------
function setupAccessibilityControls() {
    // Botones se obtienen por ID (document.getElementById) pero usando jQuery
    $("#font-increase").on("click", function () {
        // aumentar con límite superior
        if (currentFontScale < 1.5) {
            currentFontScale += 0.1;
            currentFontScale = Number(currentFontScale.toFixed(2));
            localStorage.setItem(FONT_KEY, currentFontScale);
            applyFontScale();
        }
    });

    $("#font-decrease").on("click", function () {
        // disminuir con límite inferior
        if (currentFontScale > 0.8) {
            currentFontScale -= 0.1;
            currentFontScale = Number(currentFontScale.toFixed(2));
            localStorage.setItem(FONT_KEY, currentFontScale);
            applyFontScale();
        }
    });

    $("#theme-toggle").on("click", function () {
        currentTheme = currentTheme === "dark" ? "light" : "dark";
        localStorage.setItem(THEME_KEY, currentTheme);
        applyTheme();
        // feedback rápido al usuario
        const label = currentTheme === "dark" ? "Modo oscuro" : "Modo claro";
        $(this).text(label);
    });

    // Ajustar texto del botón de modo cuando carga
    const initialLabel = currentTheme === "dark" ? "Oscuro" : "Claro";
    $("#theme-toggle").text(initialLabel);
}

// ---------- Navegación responsive ----------
function setupNavigation() {
    $("#nav-toggle").on("click", function () {
        $("#nav-list").toggleClass("open");
    });

    // Cerrar menú al tocar un link en mobile
    $(".nav-link").on("click", function () {
        $("#nav-list").removeClass("open");
    });
}

// ---------- Validación y panel de contacto (soporta formulario de la página y panel flotante) ----------
function setupContactForms() {
    // Formularios posibles: el de la página (`#contact-form`) y el flotante (`#floating-contact-form-el`)
    if ($("#contact-form").length) {
        bindContactFormValidation("#contact-form");
    }

    if ($("#floating-contact-form-el").length) {
        bindContactFormValidation("#floating-contact-form-el");
    }

    // Comportamiento del panel flotante (mostrar toggle al bajar)
    setupFloatingContact();
}

function bindContactFormValidation(formSelector) {
    const $form = $(formSelector);
    const $status = $form.find('.form-status');

    $form.on('submit', function (event) {
        event.preventDefault();
        clearErrors($form);

        // Obtener valores por nombre (funciona tanto para formulario normal como para el flotante)
        const nombre = $form.find('[name="nombre"]').val() ? $form.find('[name="nombre"]').val().trim() : '';
        const email = $form.find('[name="email"]').val() ? $form.find('[name="email"]').val().trim() : '';
        const mensaje = $form.find('[name="mensaje"]').val() ? $form.find('[name="mensaje"]').val().trim() : '';

        let isValid = true;

        const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/;
        if (!nombre) {
            showErrorFor($form, 'nombre', 'Por favor ingresá tu nombre.');
            isValid = false;
        } else if (!nombreRegex.test(nombre)) {
            showErrorFor($form, 'nombre', 'Usá solo letras y al menos 2 caracteres.');
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            showErrorFor($form, 'email', 'El email es obligatorio.');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showErrorFor($form, 'email', 'Ingresá un email válido.');
            isValid = false;
        }

        if (!mensaje) {
            showErrorFor($form, 'mensaje', 'Escribí un mensaje.');
            isValid = false;
        } else if (mensaje.length < 10) {
            showErrorFor($form, 'mensaje', 'El mensaje debe tener al menos 10 caracteres.');
            isValid = false;
        }

        if (!isValid) {
            $status.text('Revisá los campos en rojo.').css('color', '#f97373');
            return;
        }

        // Simular envío: mostrar feedback claro (heurística: visibilidad del estado del sistema)
        $status.text('Tus datos fueron enviados correctamente. ¡Gracias por contactarme!').css('color', '#22c55e');
        // Resetear contenido del formulario para evitar doble envío accidental
        $form[0].reset();
    });
}

function showErrorFor($form, fieldName, message) {
    const $input = $form.find('[name="' + fieldName + '"]');
    $input.addClass('error');
    // Buscar span de error asociado: primero por id, luego por siguiente .error-message
    const id = $input.attr('id');
    if (id && $form.find('#' + id + '-error').length) {
        $form.find('#' + id + '-error').text(message);
    } else if ($input.next('.error-message').length) {
        $input.next('.error-message').text(message);
    } else {
        // crear/mostrar un elemento de error simple
        $input.after('<span class="error-message">' + message + '</span>');
    }
}

function clearErrors($context) {
    if (!$context) {
        $context = $(document);
    }
    $context.find('input, textarea').removeClass('error');
    $context.find('.error-message').text('');
}

function setupFloatingContact() {
    const $panel = $('#floating-contact');
    const $toggle = $('#contact-toggle');
    const $body = $('#floating-contact-form');
    const $close = $('#floating-contact-close');

    if (!$panel.length) return;

    // Mostrar el botón toggle cuando el usuario se desplaza hacia abajo
    $(window).on('scroll', function () {
        const y = window.scrollY || window.pageYOffset;
        if (y > 200) {
            $panel.attr('aria-hidden', 'false').addClass('visible');
        } else {
            $panel.attr('aria-hidden', 'true').removeClass('visible');
            // cerramos el body si está abierto
            $body.prop('hidden', true);
            $toggle.attr('aria-expanded', 'false');
        }
    });

    $toggle.on('click', function () {
        const expanded = $(this).attr('aria-expanded') === 'true';
        if (expanded) {
            $body.prop('hidden', true);
            $(this).attr('aria-expanded', 'false');
        } else {
            $body.prop('hidden', false);
            $(this).attr('aria-expanded', 'true');
            // mover foco al primer input
            $body.find('input, textarea').first().focus();
        }
    });

    $close.on('click', function () {
        $body.prop('hidden', true);
        $toggle.attr('aria-expanded', 'false').focus();
    });
}