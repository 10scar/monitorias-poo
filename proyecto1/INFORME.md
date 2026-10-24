# Ecos en la Niebla

### Proyecto 1 — Programación Orientada a Objetos

**Mecánicas:** Walk + Reveal · **Apoyo visual:** Shine  
**Monitoría:** Oscar Gutiérrez  
**Año:** 2026

---

## Índice

1. [Resumen](#1-resumen)
2. [Objetivos](#2-objetivos)
3. [El juego](#3-el-juego)
4. [Mecánicas implementadas](#4-mecánicas-implementadas)
5. [Decisiones de diseño](#5-decisiones-de-diseño)
6. [Limitaciones y trabajo futuro](#6-limitaciones-y-trabajo-futuro)
7. [Conclusiones](#7-conclusiones)
8. [Referencias](#8-referencias)
9. [Anexo: ejecución y créditos](#9-anexo-ejecución-y-créditos)

---

## 1. Resumen

**Ecos en la Niebla** es un juego de exploración sobre una cuadrícula
desarrollado con p5.js 2.3.4 y p5.quadrille.js 3.5.0. El jugador recorre un
laberinto generado con `maze()`, ilumina su entorno con una linterna y debe
recoger tres ecos antes de cruzar el Umbral.

El proyecto implementa las mecánicas **Walk** y **Reveal**. Walk calcula y
ejecuta rutas; Reveal administra la visibilidad y la memoria del terreno. La
conexión entre ambas es la máscara `known`: una celda de piso se habilita para el
desplazamiento cuando la linterna la revela. **Shine** se emplea como apoyo de
presentación para dibujar la niebla, los ecos y el Umbral.

El código está dividido en clases y archivos independientes, las librerías están
incluidas en el proyecto y el juego funciona sin conexión.

---

## 2. Objetivos

**Objetivo general:** implementar un juego de cuadrícula funcional con p5.js y
p5.quadrille.js, aplicando programación orientada a objetos y componiendo dos
mecánicas que se afecten mutuamente.

**Objetivos específicos:**

- Implementar Walk como planificación sobre una consulta del tablero y consumo
  animado de la ruta.
- Implementar Reveal como una capa de niebla con estados de luz, memoria y
  territorio no explorado.
- Conectar ambas mecánicas mediante la máscara de paso `known`.
- Separar el mundo, las mecánicas, la interfaz y la coordinación en clases con
  responsabilidades definidas.
- Verificar el juego en escritorio y en una ventana angosta, sin errores de
  consola.
- Documentar el proyecto en un informe y en dos presentaciones.

---

## 3. El juego

### 3.1 Concepto

El explorador comienza en el centro de un laberinto que no puede ver. La linterna
revela un radio de celdas a su alrededor; lo ya visto permanece en penumbra y lo
nunca visitado continúa oculto. El jugador debe recoger tres ecos distribuidos
por el laberinto y llegar al Umbral, que permanece sellado hasta reunirlos.

### 3.2 Reglas

1. El jugador selecciona una celda de piso que ya haya sido explorada.
2. El juego calcula una ruta con `path()` sobre las celdas conocidas y el
   explorador la recorre paso a paso.
3. Cada paso actualiza la niebla y, cuando corresponde, recoge un eco.
4. Al reunir los tres ecos, el Umbral se abre y puede cruzarse.
5. La tecla `R` o el botón del panel generan un laberinto nuevo con otra
   semilla.

No existe condición de derrota: el reto es la exploración.

### 3.3 Controles

| Acción | Control |
| --- | --- |
| Caminar a una celda explorada | Clic |
| Replanificar mientras camina | Clic en otra celda explorada |
| Nuevo laberinto | `R`, botón del panel o botón del overlay |
| Repetir un laberinto | Abrir `index.html?seed=N` |

### 3.4 Interfaz

El canvas dibuja el laberinto, la niebla, los ecos, el Umbral y el explorador. El
panel lateral, construido en DOM, muestra el objetivo, los ecos recuperados, los
pasos, el estado de la partida, la leyenda y un botón de reinicio. Los mensajes
contextuales se anuncian mediante `aria-live`.

---

## 4. Mecánicas implementadas

### 4.1 Walk

El jugador hace clic en una celda de piso ya explorada. `Dungeon.path()` consulta
la máscara `known` y devuelve una lista de movimientos. `Walk.planTo()` inicia el
recorrido y `Walk.update()` consume un paso por intervalo de tiempo.

La animación interpola la posición visual, mientras la celda lógica cambia al
completar cada paso. Un clic durante el recorrido reemplaza el plan desde la
última celda alcanzada. Si `path()` devuelve una lista vacía, el jugador no se
mueve: el destino puede ser un muro, una celda no explorada o la misma celda
actual.

La separación entre planificación y ejecución permite reemplazar una ruta sin
alterar el estado del tablero. La velocidad se regula con `deltaTime` y la
posición de dibujo se interpola con `lerp`.

### 4.2 Reveal

`Reveal` mantiene tres estructuras: `explored`, que registra la memoria de la
linterna; `lit`, que registra el radio actual; y `alpha`, que controla la
opacidad de la niebla. En cada paso, la mecánica marca las celdas dentro del
radio y llama a `Dungeon.unlock()` para habilitar las celdas de piso en `known`.

La niebla se dibuja con tres estados: luz actual, memoria y territorio no
explorado. El alfa se interpola para suavizar el borde de la luz. La
implementación utiliza un radio euclidiano; la luz atraviesa paredes y no aplica
línea de visión.

### 4.3 Composición de las mecánicas

Walk modifica la posición del explorador; Reveal actualiza la máscara `known`; y
esa máscara condiciona la siguiente ruta que Walk puede calcular.

Sin Walk, la linterna permanecería inmóvil y no se produciría nueva información.
Sin Reveal, `known` contendría todo el laberinto y cualquier ruta sería posible
desde el primer clic. La dependencia es mutua y necesaria.

### 4.4 Shine como apoyo de presentación

Las mecánicas evaluadas son Walk y Reveal. Shine se utiliza para el acabado
visual: la niebla, los ecos y el Umbral son celdas que contienen funciones de
dibujo y reciben el estado por `options`.

Shine no modifica reglas ni estado del juego; solo presenta la información que
Reveal ya calculó. Un detalle técnico relevante es que
`options.origin = 'center'` se pasa dentro de `options`, no como parámetro de
`drawQuadrille`.

---

## 5. Decisiones de diseño

| Decisión | Justificación |
| --- | --- |
| Inicio en el centro | La esquina dejaba media área de luz fuera del tablero. `_pickSpawn()` elige el piso más cercano al centro. |
| Máscara `known` | Convierte la niebla en una restricción real de pathfinding y no solo en un efecto visual. |
| Niebla con memoria | Los tres estados permiten planificar el regreso y hacen que el mapa se construya durante la exploración. |
| Semilla visible y reproducible | El HUD muestra la semilla y `?seed=N` permite repetir un laberinto durante la sustentación. |
| HUD en DOM | Separa la interfaz del canvas y facilita el acceso a los contadores, mensajes y botones. |
| Librerías incluidas en `lib/` | El proyecto funciona sin conexión y conserva versiones reproducibles de p5.js y p5.quadrille.js. |

Se descartaron las minas y la condición de derrota porque desplazaban el foco
hacia el buscaminas; el movimiento con flechas porque no ejercitaba `path()`; y
el temporizador porque añadía una tercera mecánica de recursos fuera del alcance
de la entrega.

---

## 6. Limitaciones y trabajo futuro

La luz utiliza un radio euclidiano y atraviesa paredes. Tampoco se incorporaron
audio ni pruebas unitarias automatizadas, y los laberintos se generan
automáticamente sin niveles autorales.

Como trabajo futuro se propone incorporar línea de visión mediante
*shadowcasting*, pruebas unitarias de Dungeon, Cell y Reveal, audio, niveles
autorales y una integración más completa de Shine. En el Proyecto 3, los ecos y
el Umbral pueden modelarse con Behave y Meet como objetos con estado y
comportamiento propio.

---

## 7. Conclusiones

Las dos mecánicas se integran mediante la máscara `known`. Walk produce nueva
información y Reveal habilita nuevas rutas; la planificación sobre las celdas
exploradas convierte la niebla en una restricción real y no en un efecto visual.
La memoria de las celdas visitadas permite planificar el regreso, y la separación
entre posición lógica y posición de dibujo mantiene estable la animación.

El proyecto permitió aplicar encapsulamiento, composición y responsabilidades
únicas en un caso concreto. La verificación funcional y la revisión del código
mostraron que las decisiones de nombres, configuración y límites entre clases
reducen el costo de los cambios. Se comprobaron catorce casos funcionales en
escritorio y en una ventana de 420 píxeles, desde un servidor local y mediante
`file://`, sin errores de consola.

### Artículos y fuentes externas consultadas

- Charalambos, J. P. (2024). *p5.quadrille.js: P5.js quadrille library*.
  SoftwareX, 27, 101838.
- Charalambos, J. P. (s. f.). *Grid-Based Game Programming*. Capítulos Walk,
  Reveal y Shine.
- Martin, R. C. (2008). *Clean Code*. Prentice Hall; Fowler, M. (2018).
  *Refactoring* (2.ª ed.). Addison-Wesley.
- Sicart, M. (2008). Defining game mechanics. *Game Studies, 8*(2); Järvinen, A.
  (2008). *Games without Frontiers*. University of Tampere.

---

## 8. Referencias

Charalambos, J. P. (2024). p5.quadrille.js: P5.js quadrille library.
*SoftwareX, 27*, 101838. https://doi.org/10.1016/j.softx.2024.101838

Charalambos, J. P. (s. f.). *Grid-Based Game Programming*. Recuperado en octubre
de 2026 de https://gbgs.gitlab.io/docs/ — capítulos *Mechanics*, *Walk*,
*Reveal* y *Shine*. Material del curso, de acceso restringido.

Fowler, M. (2018). *Refactoring: Improving the Design of Existing Code* (2.ª ed.).
Addison-Wesley.

Järvinen, A. (2008). *Games without Frontiers: Theories and Methods for Game
Studies and Design* [Tesis doctoral]. University of Tampere.

Martin, R. C. (2008). *Clean Code: A Handbook of Agile Software Craftsmanship*.
Prentice Hall.

McDermott, R. (s. f.). *clean-code-javascript* [Repositorio]. GitHub.
https://github.com/ryanmcdermott/clean-code-javascript

p5.js. (s. f.). *Reference*. https://p5js.org/reference/

Salen, K., & Zimmerman, E. (2004). *Rules of Play: Game Design Fundamentals*.
MIT Press.

Sicart, M. (2008). Defining game mechanics. *Game Studies, 8*(2).
https://gamestudies.org/0802/articles/sicart

---

## 9. Anexo: ejecución y créditos

### Ejecución

```bash
cd proyecto1
python3 -m http.server 8000
```

Abrir `http://localhost:8000`. También se puede abrir `index.html` directamente
en el navegador. Para repetir un laberinto:

```text
http://localhost:8000/?seed=4176
```

### Créditos

- Curso: Programación Orientada a Objetos.
- Monitoría y montaje del ejemplo: **Oscar Gutiérrez**.
- Inspiración conceptual y patrones de API: capítulos *Walk*, *Reveal* y
  *Shine* de *Grid-Based Game Programming* (Jean Pierre Charalambos). El código
  fue adaptado, dividido en clases y comentado.
- Librerías: p5.js (LGPL-2.1) y p5.quadrille.js (GPL-3.0). Ver
  `lib/LICENSES.md`.

Este material tiene fines exclusivamente académicos.
