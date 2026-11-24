# Portada de PLATO

**Ruta:** `/` · **Modo:** Persuade · **Destino jugable:** `/play`.

La portada funciona como vestíbulo: presenta el mecanismo con una mano de demostración y permite elegir cómo jugar. Hereda las fuentes y los materiales del juego; el verde ocupa la sección principal, el amarillo distingue las acciones y el rojo aparece en las cartas y los palos. La composición se adapta de dos columnas en escritorio a una secuencia vertical en móvil.

- `screens/LandingScreen.tsx`: composición, navegación por secciones y acceso al juego. Los ajustes de mesa se encuentran únicamente en el juego.
- `components/LandingHeader.tsx`: navegación fija sobre el contenido. El fondo de papel se transforma progresivamente en cristal translúcido con blur intenso y una capa de papel más opaca durante los primeros 48 px de desplazamiento; usa Expo BlurView y un BlurTargetView en Android. Los saltos a secciones descuentan la altura real de la barra.
- `components/TablePreview.tsx`: demostración interactiva con las cartas y avatares reales de la app. Reparte una pareja, entrega una tercera carta y la voltea; respeta movimiento reducido y limpia animaciones y temporizadores.
- `components/PlayModes.tsx`: bots disponibles y modos público/privado en preparación. Los detalles se despliegan en el mismo contexto; no se inventan salas, jugadores conectados ni formularios sin servicio.
- `components/HowToPlay.tsx`: ejemplo visual y secuencia de reglas.
- `theme.ts`: colores propios de la portada, sin cambiar la paleta del tablero.

La demostración es ilustrativa y no modifica fichas ni sesiones. La portada no necesita inicializar Skia; la ruta de juego conserva su cargador web. No añadir bucles de movimiento decorativos, urgencia artificial, contadores de usuarios ficticios ni botones de multijugador que aparenten estar operativos.

`HeaderGlass.web.tsx` aplica un desenfoque de fondo de 48 px, conservando el tono translúcido y dejando los controles nítidos. La implementación nativa reutiliza Expo BlurView con intensidad máxima y mayor fuerza en Android.

El material de cristal se renderiza directamente bajo los controles, fuera de cualquier contenedor con opacidad animada. Solo se desvanece la cubierta opaca de papel inicial; no se superponen velos claros sobre el blur.
