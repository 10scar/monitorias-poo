# Ecos en la Niebla

Proyecto 1 de **Programación Orientada a Objetos**: un laberinto de exploración
construido con **p5.js** y **p5.quadrille.js**.

La linterna abre la niebla (**Reveal**) y el explorador solo puede caminar por
lo que ya conoce (**Walk**). Las dos mecánicas se necesitan: caminar revela,
revelar habilita rutas. El objetivo es recoger los tres ecos y cruzar el Umbral.

## Cómo ejecutar

El proyecto no necesita instalación ni conexión a internet: las librerías están
vendorizadas en `lib/`.

1. Abre `index.html` en el navegador, o
2. sirve la carpeta con un servidor local:

```bash
cd proyecto1
python3 -m http.server 8000
# http://localhost:8000
```

La semilla se puede fijar por URL para repetir un laberinto:

```
http://localhost:8000/?seed=4176
```

## Controles

| Acción | Control |
| --- | --- |
| Caminar a una celda explorada | Clic |
| Replanificar mientras camina | Clic en otra celda explorada |
| Nuevo laberinto | `R`, el botón del panel o el del overlay de victoria |

## Estructura

```
proyecto1/
├── index.html
├── INFORME.md
├── README.md
├── css/estilos.css
├── lib/                    p5.js 2.3.4 + p5.quadrille 3.5.0
├── assets/                 capturas para las presentaciones
├── presentaciones/
│   ├── proyecto.html
│   ├── clean-code.html
│   └── deck/               estilos, navegación y resaltado
└── js/
    ├── config.js           constantes, colores y textos de configuración
    ├── main.js             ciclo de vida de p5
    ├── core/Cell.js        value object de celda
    ├── world/              Dungeon, Relic, Portal
    ├── entities/           Explorer
    ├── mechanics/          Walk, Reveal
    ├── ui/                 Hud
    └── game/               Game (orquestador)
```

## Documentación

- [`INFORME.md`](INFORME.md): informe de la entrega (objetivos, mecánicas,
  decisiones de diseño, conclusiones y referencias).
- [`presentaciones/proyecto.html`](presentaciones/proyecto.html): recorrido
  visual por el juego, las mecánicas, los resultados y las conclusiones.
- [`presentaciones/clean-code.html`](presentaciones/clean-code.html): nueve
  ejemplos de código malo → código limpio, aplicados a Quadrille y p5.

Las dos presentaciones comparten el motor de diapositivas de
`presentaciones/deck/` (estilos, navegación y resaltado de código). Conserva
esa carpeta junto a los HTML.

## Créditos y uso académico

- Curso: Programación Orientada a Objetos. Monitoría: **Oscar Gutiérrez**.
- Las ideas de capas, `path()`, `reach()` y las *display functions* se apoyan en
  los capítulos **Walk**, **Reveal** y **Shine** de *Grid-Based Game
  Programming* de Jean Pierre Charalambos. El código fue adaptado, reorganizado
  en clases propias y comentado para esta entrega.
- p5.js se distribuye bajo LGPL-2.1; p5.quadrille.js bajo GPL-3.0. Ver
  [`lib/LICENSES.md`](lib/LICENSES.md).
- Material con fines exclusivamente académicos.
