// Variables globales alterables
let windowHeight,
    mousePos,
    mouseDocPos,
    moveMouseCounter = 0;
// Variables globales inalterables, son para organización y nada más.
const CLOSEST_TAG = "closest",
    MIN_SCROLL_COUNT = 4,
    OTHER_SCROLL_COUNT = 3,
    MOVE_MOUSE_INTERVAL = 300;

// Como mover la barra lateral
function scroll(scrollTop) {
    $("body").stop().animate({ scrollTop }, windowHeight * 0.5);
}
// ¿El usuario trata de mover las diapositivas? chequealo cada tanto.
function moveMouse() {
    $(window).trigger("mousemove");
    let scrollPos = $(window).scrollTop();
    const HOVERED_NAV = $(".navegation").hasClass("hovered"),
        ANIMATED_NAV = $("body").is(":animated"),
        WIN_FOURTH = windowHeight / 10;
    let shouldChange = ((mousePos <= WIN_FOURTH) && mousePos >= 0) || ((mousePos >= WIN_FOURTH * 3) && (mousePos <= windowHeight));
    if (shouldChange) {
        moveMouseCounter++;
    } else {
        moveMouseCounter = 0;
    }
    const CORRECT_COUNTER = ((moveMouseCounter - MIN_SCROLL_COUNT) %
        OTHER_SCROLL_COUNT === 0
    ) && (moveMouseCounter - MIN_SCROLL_COUNT >= 0);
    let scrollChange = windowHeight - (scrollPos % windowHeight);
    if (!(HOVERED_NAV || ANIMATED_NAV) && CORRECT_COUNTER && shouldChange) {
        scrollPos += mousePos < WIN_FOURTH ? -scrollChange : scrollChange;
        scroll(scrollPos);
    }
}
// Encontrar la seccion que está más cerca y marcarlo en el navegador
function getNearest() {
    const $SECTIONS = $("main").children();
    let closestEl = $.grep($SECTIONS, (el, i) => {
        return $(el).offset().top >= $(window).scrollTop()
    })[0] || $SECTIONS.last();

    const $NAV = $(".navegation").children("nav"),
        EL_SELECTOR = `[href="#${$(closestEl).attr("id")}"]`,
        EL_I = $SECTIONS.index(closestEl);

    EL_I == $SECTIONS.length - 1 ?
        $(".bottom-corner").fadeOut() :
        $(".bottom-corner").fadeIn();
    EL_I == 0 ?
        $(".top-corner").fadeOut() :
        $(".top-corner").fadeIn();
    // Estos deben ir vacíos ...
    $NAV.children()
        .children("a")
        .not(EL_SELECTOR)
        .text("◦")
        .removeClass(CLOSEST_TAG);
    // pero estos eneros
    $NAV.find(EL_SELECTOR)
        .text("•")
        .addClass(CLOSEST_TAG);
}
// ¿Hay algun texto que se va de su contenedor?
//Entonces deberiamos dividirlo en varias columnas.

// ¿Está pronto el documento?
$(document).ready(function () {
    windowHeight = $("#win").height();

    // Enlista todas las secciones
    for (section of $("main").children()) {
        $(".navegation").children("nav").append(
            `<li>
      <a href="#${$(section).attr("id")}">◦</a>
    </li>`);
    }

    getNearest();

    // Esta pasando el cursor sobre el navegador?
    $(".navegator").on({
        mouseenter: function () {
            $(this).addClass("hovered");
        },
        mouseleave: function () {
            $(this).removeClass("hovered")
        }
    });
    let mouseMoveInterval = setInterval(moveMouse, MOVE_MOUSE_INTERVAL)

    // Quiere el usuario ir a la siguiente diapositiva?
    let counter = 0;
    $("#down-arrow").on("click", function (e) {
        counter++;
        clearInterval(mouseMoveInterval);
        let scrollPos = $(window).scrollTop();
        scrollPos += (windowHeight - scrollPos % windowHeight);
        scroll(scrollPos);
        mouseDocPos = e.pageY;
        mousePos = mouseDocPos - $(window).scrollTop();
        mouseMoveInterval = setInterval(moveMouse, MOVE_MOUSE_INTERVAL);
        if (counter == 1) {
            $(this).trigger("click");
        } else {
            counter = 0;
        }
    });

    // ¿Se movio el mouse?
    $(window).mousemove(function (e) {
        mouseDocPos = e.pageY || mouseDocPos;
        mousePos = mouseDocPos - $(window).scrollTop();
    });

    // ¿Se movió el documento?
    let prevScroll = 0;
    $(document).scroll(function (e) {
        $(window).trigger("mousemove", e);
        const CUR_SCROLL = $(window).scrollTop();
        mouseDocPos += CUR_SCROLL - prevScroll;
        mousePos = mouseDocPos - CUR_SCROLL;
        getNearest();
        prevScroll = CUR_SCROLL;
    });
});

$(window).resize(function () {
    windowHeight = $("#win").height(); /*$(window).height() / $("main").children().length*/
});