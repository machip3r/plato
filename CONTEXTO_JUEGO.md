# PLATO — contexto general del juego

## Qué es

PLATO es un juego social de cartas alrededor de un pozo común, llamado **el Plato**. En cada ronda, cada participante aporta una ficha, recibe dos cartas y decide si pasa o apuesta a que una tercera carta tenga un valor estrictamente comprendido entre los valores de sus dos cartas. La primera apuesta acertada termina la ronda y cobra del Plato; lo que quede se conserva para la siguiente.

La versión actual es un prototipo local para web, iOS y Android: una persona juega contra bots automáticos. No requiere cuenta, servidor ni conexión entre jugadores. Las fichas son gratuitas, ficticias, no transferibles y no tienen valor en efectivo ni canje.

## Objetivo y conceptos

- **Plato / pozo:** fichas comunes aportadas por los antes y las apuestas perdidas. Persiste entre rondas.
- **Ante:** aporte obligatorio de 1 ficha al comienzo de cada ronda para quienes participan.
- **Mano:** las dos cartas iniciales de un jugador.
- **Apuesta:** riesgo de que una tercera carta caiga dentro del intervalo estricto de la mano.
- **Dealer:** posición que rota una silla hacia la derecha al comenzar cada ronda. El dealer también participa si puede pagar el ante.
- **Turno:** orden empezando por la silla inmediatamente a la derecha del dealer y continuando alrededor de la mesa.

No hay una condición de victoria total por quedarse sin fichas ni una duración fija. La partida continúa hasta que el anfitrión la cierre; entonces se presenta el resultado y puede consultarse el historial.

## Cartas y probabilidades

Se usa una baraja americana infinita con 13 valores y 4 palos:

| Valor | Carta |
|---:|---|
| 1–10 | As (1) y cartas numéricas |
| 11 | Jota |
| 12 | Reina |
| 13 | Rey |

Los palos son corazones, diamantes, tréboles y picas. Cada robo se genera de forma independiente con reemplazo: cada valor tiene probabilidad `1/13` y cada combinación de palo y valor `1/52`. Una carta puede volver a salir; no se agota el mazo. Para decidir si se gana solo importa el valor, no el palo.

La probabilidad exacta de acertar una apuesta es:

`cantidad de valores enteros entre las dos cartas / 13`

Por ejemplo, con 4 y 9 hay cuatro valores ganadores (5, 6, 7 y 8), así que la probabilidad es `4/13`, aproximadamente 30.8%. Si los valores son iguales o consecutivos, la probabilidad es 0%; la interfaz lo indica. En cualquier otro caso, pasar o apostar son decisiones válidas, incluso con una probabilidad baja.

## Preparar una partida

1. La pantalla inicial propone al azar una mesa de 2 a 8 plazas en total: la persona y de 1 a 7 bots. Se puede pedir otra composición antes de empezar.
2. Al comenzar una partida nueva, cada participante inicia con **1,000 fichas**. El saldo no se recarga dentro de esa partida.
3. Se elige al azar el dealer inicial.
4. La partida empieza con la primera ronda. La pantalla mantiene visibles la mesa, participantes, Plato, cartas propias y acciones disponibles; también ofrece historial de acciones.

Al iniciar una ronda participan las personas sentadas que no estén mirando y tengan al menos 1 ficha. Si hay menos de dos participantes con fondos suficientes para el ante, la mesa queda en espera. Quien no pueda pagar el ante se sienta fuera de esa ronda sin perder una ficha.

## Cómo se juega una ronda

1. **Ante:** cada participante paga 1 ficha; esa ficha se suma al Plato.
2. **Reparto:** cada participante recibe dos cartas. Los robos son independientes.
3. **Turnos:** comienza la persona a la derecha del dealer, incluyendo al dealer al llegar su turno. Las personas que no juegan esa ronda no tienen mano ni turno.
4. **Decisión:** en su turno, cada jugador puede pasar o apostar una cantidad entera entre 1 y el menor de estos dos límites:
   - el Plato actual;
   - su saldo actual.
5. **Resolución de apuesta:** se roba una tercera carta y se compara su valor con las dos cartas iniciales:
   - **Acierto:** el tercer valor está estrictamente entre ambos valores. El jugador recibe de su saldo el premio equivalente a la apuesta, el Plato disminuye por esa cantidad y la ronda termina inmediatamente.
   - **Fallo:** cualquier otro valor. La apuesta se suma al Plato y se descuenta del saldo del jugador. El turno continúa.
6. **Fin sin ganador:** si todo el mundo pasa o pierde su apuesta y nadie acierta, la ronda termina sin premio. El Plato queda para la ronda siguiente.

El pago por acierto es exactamente la cantidad apostada, retirada del Plato; no es un multiplicador. Las apuestas perdidas aumentan el Plato por la misma cantidad. Un acierto parcial no vacía necesariamente el pozo: el remanente sigue en la mesa.

### Ejemplo

El Plato tiene 12 fichas y el jugador tiene 40. Puede apostar de 1 a 12. Apuesta 5:

- Si acierta, su saldo aumenta en 5 y el Plato baja a 7. La ronda termina.
- Si falla, su saldo baja en 5 y el Plato sube a 17. Sigue el turno.

## Dealer, tiempos y automatización

- El dealer se mueve una silla a la derecha en cada ronda. Si está mirando, se avanza hasta un jugador activo para asignar el dealer de la ronda.
- Si un jugador humano no actúa en **60 segundos**, pasa automáticamente.
- Los bots esperan aproximadamente **2.3 a 3.4 segundos** antes de actuar.
- Los bots usan una política de riesgo: pasan manos iguales, apuestas imposibles o manos con probabilidad menor al 15%; de lo contrario apuestan una fracción de 25% a 85% del límite disponible, calculada según su probabilidad.
- Las manos apostadas se revelan al iniciar la apuesta y permanecen visibles. Las manos que pasan quedan ocultas.

## Salir, mirar y volver

Entre rondas, la persona puede dejar su asiento. Si es anfitriona debe elegir un bot activo como nuevo anfitrión y decidir si se queda mirando o sale de la pantalla. Conserva saldo e historial; al mirar no recibe cartas ni paga ante. Puede solicitar volver a jugar desde una ronda posterior.

Si el anfitrión pasa el control a un bot y la mesa sigue abierta, la ronda siguiente se inicia automáticamente tras una pausa de 7 segundos mientras alguien mira la mesa. Si no hay suficientes participantes con fondos, la mesa espera hasta que pueda continuar. Salir de la pantalla pausa la simulación local; al volver a mirar se reanuda. Este estado solo existe en memoria y no es una sesión en red.

El anfitrión puede cerrar la partida. El cierre es definitivo para esa mesa: se conserva la posibilidad de ver el resultado y el historial, pero una partida nueva comienza con saldos reiniciados.

## Historial y estado de fichas

El historial registra por ronda los antes, pases, apuestas, resultado de las apuestas, saldo posterior y tamaño del Plato después de la acción. Puede filtrarse por jugador y expandirse por ronda. Los pases por tiempo agotado quedan identificados. Consultar el historial no detiene la partida.

Los balances son por jugador y el Plato es compartido. No hay depósitos, retiros, premios con valor monetario ni transferencias. Quedarse sin fichas impide pagar futuros antes y apuestas; el jugador puede quedar fuera de rondas, y la mesa espera si ya no hay al menos dos personas financiadas para participar.

## Especificaciones resumidas

| Área | Especificación actual |
|---|---|
| Plataformas | Web, iOS y Android (Expo / React Native) |
| Modo disponible | Partida local individual contra bots |
| Jugadores | 2–8 en total: 1 persona + 1–7 bots |
| Saldo inicial | 1,000 fichas ficticias por jugador |
| Ante | 1 ficha por jugador activo, por ronda |
| Valores y palos | 1–13; corazones, diamantes, tréboles y picas |
| Modelo de robo | Independiente, uniforme, con reemplazo |
| Apuesta mínima | 1 ficha |
| Apuesta máxima | Menor entre Plato actual y saldo del jugador |
| Condición de acierto | Tercer valor estrictamente entre los dos iniciales |
| Fin de ronda | Primer acierto, o todos pasan/fallan |
| Fin de partida | Cierre por el anfitrión |
| Tiempo humano | 60 segundos; vencido el plazo, pasa |
| Tiempo de bots | 2.3–3.4 segundos por decisión |
| Red / cuentas | No disponibles en este prototipo |
| Economía real | Ninguna; fichas sin valor ni canje |

## Implementación y alcance actual

Las reglas, secuencia de turnos, robos, decisiones de bots y contabilidad están en `src/game` como TypeScript independiente de la interfaz. La pantalla y los controles están en `src/components`, con lógica de sesión local en `src/hooks/useLocalMatch.ts`. La estructura apunta a compartir el núcleo entre web y móvil y permitir una futura autoridad de servidor, pero multijugador en red, cuentas y persistencia no forman parte de la versión actual.

La dirección visual del producto combina tipografía de cartel suizo con una sala de cartas cálida: mesa ovalada de fieltro, madera, latón, señales rojas y retratos expresivos. La composición prioriza móvil y pone la mesa al centro, con el Plato y los participantes a la vista y las acciones al alcance del pulgar.

## Notas para mantener este contexto

Este documento describe la versión implementada y las decisiones vigentes de `PRODUCT.md`. Si el comportamiento cambia, actualizar primero la especificación afectada y contrastarla con el núcleo del juego. El brief original contemplaba una baraja española, pero quedó supersedido por la baraja americana infinita descrita aquí.
