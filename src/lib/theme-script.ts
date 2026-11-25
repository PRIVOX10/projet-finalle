export const THEME_KEY = "kandili-theme";

// Exécuté avant le premier affichage : évite un flash clair en mode sombre.
// Sans choix enregistré, le site suit le réglage de l'appareil.
export const THEME_SCRIPT = `(function(){try{
var k=${JSON.stringify(THEME_KEY)},d=document.documentElement,m=matchMedia("(prefers-color-scheme: dark)");
function a(){d.setAttribute("data-theme",localStorage.getItem(k)||(m.matches?"dark":"light"))}
a();m.addEventListener("change",a)
}catch(e){}})()`;
