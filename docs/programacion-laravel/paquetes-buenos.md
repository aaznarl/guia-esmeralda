# Paquetes destacados a instalar

[[TOC]]


## Twill - Panel de Administración

Twill es un paquete de Laravel que incorpora a tu aplicación una interfaz completa de administración, que te permite 
tener fácilmente un CRUD de todas las tablas que desees. Al menos es muy útil para las tablas maestras, y para 
aquellos otros datos para los que necesites una administración rápida.

- [https://twill.io](https://twill.io) - Página principal de Twill

Siguiendo la [guía de instalación](https://twill.io/docs/#installation). Al ejecutar:

```bash
php artisan twill:install

# Aparece:
Copied File [/vendor/area17/twill/migrations/create_tags_tables.php] To [/database/migrations/2019_08_24_30001_create_tags_tables.php]
... y varias más...
Copied File [/vendor/area17/twill/config/twill-publish.php] To [/config/twill.php]
Copied File [/vendor/area17/twill/config/twill-navigation.php] To [/config/twill-navigation.php]
Copied File [/vendor/area17/twill/config/translatable.php] To [/config/translatable.php]
Publishing complete.
Copied Directory [/vendor/area17/twill/dist] To [/public]
```

En el fichero _.env_, no hay que poner el puerto en el parámetro _ADMIN_APP_URL_:

```
# Twill
ADMIN_APP_URL=localhost
ADMIN_APP_PATH=admin

MEDIA_LIBRARY_ENDPOINT_TYPE=local
MEDIA_LIBRARY_IMAGE_SERVICE=A17\Twill\Services\MediaLibrary\Glide
```

Hay que añadir algunos scripts al fichero **package.json**:

```json
"scripts": {
        "twill-build": "rm -f public/hot && npm run twill-copy-blocks && cd vendor/area17/twill && npm ci && npm run prod && cp -R public/* ${INIT_CWD}/public",
        "twill-copy-blocks": "npm run twill-clean-blocks && mkdir -p resources/assets/js/blocks/ && cp -R resources/assets/js/blocks/ vendor/area17/twill/frontend/js/components/blocks/customs/",
        "twill-clean-blocks": "rm -rf vendor/area17/twill/frontend/js/components/blocks/customs",
        "twill-dev": "mkdir -p vendor/area17/twill/public && npm run twill-copy-blocks && concurrently \"cd vendor/area17/twill && npm ci && npm run hot\" \"npm run twill-watch\" && npm run twill-clean-blocks",
        "twill-watch": "concurrently \"watch 'npm run twill-hot' vendor/area17/twill/public --wait=2 --interval=0.1\" \"npm run twill-watch-blocks\"",
        "twill-hot": "cd vendor/area17/twill && cp -R public/* ${INIT_CWD}/public",
        "twill-watch-blocks": "watch 'npm run twill-copy-blocks' resources/assets/js/blocks --wait=2 --interval=0.1"        
},
```

Para compilar los assets de Twill:

```bash
docker-compose exec workspace
yarn run twill-build
exit
```

Al compilar los assets de Twill (css y js), se recrea el fichero _public/mix-manifest.json_. Para que después,
al compilar los paquetes de nuestra propia aplicación, no machaque ese fichero sino que añada las referencias
a los ficheros css y js de nuestra aplicación, es necesario modificar el fichero **webpack.mix.js**.
 
Primero, añadir el paquete _laravel-mix-merge-manifest_ al proyecto:

```bash
yarn add laravel-mix-merge-manifest --dev
yarn add concurrently watch --dev
```

Usarlo en la configuración de Mix (fichero _laravel-mix-merge-manifest_):

```js
require('laravel-mix-merge-manifest');
mix.mergeManifest();
```   

Y ahora ya, compilar los assets del proyecto y lanzar el servidor de desarrollo:

```bash
yarn watch
```   

En el fichero _public/mix-manifest.json_ se habrán mezclado las referencias a los assets de Twill, con
las referencias a los assets del propio proyecto.
   
Añadir al fichero _.gitignore_:

```
# Assets de Twill
public/assets/admin
public/mix-manifest.json
public/hot

```

### Crear un módulos CRUD

La documentación oficial se encuentra aquí: [Twill - cli generator](https://twill.io/docs/#cli-generator).

Para crear un nuevo módulo que se encargue de todo lo relacionado con el CRUD de un modelo, ejecutar 
(ejemplo con el modelo "Escenario"):

```bash
php artisan twill:module escenarios
```

Y se creará:

- migration file
- a model
- a repository
- a controller
- a form request object 
- a form view.

Configurar también:

1. Añadir la ruta en **routes/admin.php**:
   ```php
   Route::module('escenarios');
   ```
2. Insertar la opción del menú en el CMS, en **config/twill-navigation.php**.
3. Configurar los campos del formulario en **resources/views/admin/escenarios/form.blade.php**
4. Configurar las opciones de los índices y columnas, si es necesario,
   en **app/Http/Controllers/xxxxx.php**


