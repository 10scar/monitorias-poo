## JSON

`Hacer una funnción serialize()` que arma el objeto. 

```json
{
  "size": 3,
  "players": 3,
  "index": 2,
  "timeline": [
    [null, null, null, null, null, null, null, null, null],
    ["0", null, null, null, null, null, null, null, null],
    ["0", null, null, null, "1", null, null, null, null]
  ]
}
```

```js
function serialize() {
  return {
    size,
    players,
    index,
    timeline: timeline.map(snapshot => snapshot.toArray())
  };
}
```


| Campo      | Qué guarda                                                        |
| ---------- | ----------------------------------------------------------------- |
| `size`     | Lado del tablero. Un 3 es un tablero 3×3.                         |
| `players`  | Cuántos jugadores hay. Las marcas van de `"0"` a `"players - 1"`. |
| `index`    | Qué instantánea se está viendo.                                   |
| `timeline` | Cada tablero, del más viejo al más nuevo.                         |




`saveJSON` recibe el data de la anterior función, lo descarga como `timeline.json`. Lo pueden dejar como un botón. O si quieren pueden investigar sobre el localStorage y como se guarda ahí.

Hacer una función `deserialize(data)`, restaura `size` y `players`, fija el tamaño de celda y reconstruye `timeline` con `createQuadrille`.