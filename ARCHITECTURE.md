# Estructura del proyecto

PLATO separa las reglas del juego, la sesión de mesa y la presentación. Las rutas de Expo Router solo conectan estas piezas.

```text
src/
├── app/                       # Rutas y layout de Expo Router
├── game/                      # Motor de reglas en TypeScript puro
├── features/
│   └── table/
│       ├── screens/           # Pantalla principal y entrada web/native
│       ├── components/
│       │   ├── animations/    # Reparto, pases y partículas
│       │   ├── cards/         # Cartas, abanicos y manos reveladas
│       │   ├── dialogs/       # Salida y cierre de partida
│       │   ├── help/          # Guía inicial y ayuda contextual
│       │   ├── table/         # Tablero, geometría, HUD y controles
│       │   └── *.tsx          # Cabecera, preparación, historial y estados
│       ├── hooks/             # Sesión local y suscripciones de React
│       ├── preferences/       # Estado y persistencia de preferencias
│       ├── services/          # Audio y respuesta háptica
│       ├── utils/             # Formato de fichas y elección de mesa
│       └── types.ts           # Acciones preparadas y estados de presentación
└── ui/                        # Tipografías, colores, iconos y avatares

assets/                        # Recursos estáticos; rutas independientes de src/
scripts/                       # Herramientas de mantenimiento de recursos
```

## Responsabilidades y dependencias

- `game/` no importa React, componentes, almacenamiento ni APIs del dispositivo. Las reglas y la contabilidad se mantienen aquí para poder compartirlas con una futura autoridad de servidor.
- `features/table/screens/PlatoGameScreen.tsx` coordina la sesión, los diálogos y las secciones de pantalla. La preparación, cabecera y estados de partida tienen componentes propios.
- `features/table/hooks/useLocalMatch.ts` coordina comandos, turnos automáticos, acciones anticipadas y el momento de confirmar una animación. Los tipos de presentación viven en `types.ts`, para que las animaciones no dependan del hook.
- `features/table/components/table/tableGeometry.ts` es la referencia común para posiciones y tiempos de llegada. El tablero y las animaciones comparten estos cálculos para evitar saltos entre sus posiciones.
- `preferences/tablePreferences.ts` mantiene el estado y sus escrituras; `hooks/useTablePreferences.ts` lo conecta con React. Audio y vibración pueden consultar las preferencias sin depender de un hook.
- `services/` adapta los efectos del dispositivo y respeta las preferencias. Los fallos de un efecto decorativo no interrumpen la partida.
- `ui/` contiene elementos visuales compartidos y no depende de la sesión de mesa ni del motor del juego.

## Dónde hacer cambios

| Cambio | Ubicación |
| --- | --- |
| Reglas, probabilidades o bots | `src/game/` |
| Turnos, cola de acciones o anfitrión | `src/features/table/hooks/useLocalMatch.ts` |
| Composición general de la pantalla | `src/features/table/screens/PlatoGameScreen.tsx` |
| Preparación de partida | `src/features/table/components/TableSetup.tsx` |
| Layout de mesa y posiciones | `src/features/table/components/table/` |
| Aspecto de cartas | `src/features/table/components/cards/` |
| Reparto y efectos visuales | `src/features/table/components/animations/` |
| Sonidos o vibración | `src/features/table/services/` |
| Ajustes y guía de primera partida | `src/features/table/components/help/TableHelp.tsx` |
| Fuentes y paleta | `src/ui/fonts.ts`, `src/ui/theme.ts` |

## Convenciones

- Colocar un componente en la funcionalidad que lo utiliza. Moverlo a `ui/` cuando sea compartido e independiente del juego.
- Mantener los estilos junto al componente que los usa. Los componentes extraídos conservan únicamente sus propios estilos.
- Usar imports explícitos. Conservar `GameScreen.tsx`, `GameScreen.native.tsx` y `GameScreen.web.tsx` juntos: la entrada web carga Skia antes de importar la pantalla. Evitar un barrel que importe anticipadamente toda la interfaz.
- Mantener los recursos en `assets/` y actualizar los `require()` estáticos cuando se mueva un archivo consumidor.
- Conservar la clave de almacenamiento `plato.table-preferences.v1`. Mover archivos no implica migrar ni borrar preferencias.
- Actualizar esta guía si cambia una frontera de responsabilidades. Ejecutar `pnpm lint` y `pnpm typecheck` después de una reorganización; no añadir pruebas ni generar builds de producción salvo que se solicite.
