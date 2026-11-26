# La Manchita

Estudio interactivo de la mascota de tinta para la plataforma de noticias. La demo vive en la raíz del proyecto y permite probar el personaje antes de llevarlo a la portada.

## Ejecutar

Con Node.js 24 y npm, desde la raíz del repositorio:

```sh
npm install
npm run dev
```

Abrí http://localhost:5173. Elegí una acción, mové el puntero por la escena o tocala dos veces con una pausa para pasar de curiosidad a salto. También podés enfocar los controles con Tab y activarlos con Enter o Espacio. El saludo, la sorpresa, el salto y la transformación vuelven al reposo al terminar.

## Compilar y probar

```sh
npm run build
npm test
npx playwright install chromium
npm run test:browser
```

La compilación valida TypeScript y genera una web estática en `dist/`. La prueba de navegador inicia su propio servidor en el puerto 5173. Cerrá primero el servidor de desarrollo. Para usar un Chromium instalado, definí `CHROMIUM_PATH`.

## Personaje

La geometría, las luces y el diario son originales y se generan localmente. React Three Fiber organiza la escena, Three.js deforma la malla mediante un morph target y Drei da espesor a las páginas del diario. El reloj de la máquina de estados gobierna los ciclos y las acciones de una sola ejecución. Una curva de GSAP mezcla la pose actual con la siguiente, incluso cuando se interrumpe un gesto.

- `src/motion.ts` contiene los estados, su duración, la mirada amortiguada y los canales de pose.
- `src/Scene.tsx` contiene la malla asimétrica, las articulaciones, el material satinado y el diario.
- `src/Vector.tsx` dibuja la alternativa SVG usando los mismos canales y pivotes.
- `src/App.tsx` conecta puntero, toque, teclado, visibilidad y preferencia de movimiento.

La escena limita la densidad de píxeles a 1,5 y suspende la animación continua fuera de vista. Con movimiento reducido presenta una postura fija por acción. Si WebGL 2 falta o se pierde el contexto, la escena pasa al personaje vectorial. Todo el contenido de la demo funciona sin claves, suscripciones, modelos descargados ni solicitudes de red a terceros.
