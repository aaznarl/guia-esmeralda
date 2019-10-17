# Twill - Panel de Administración

[[TOC]]

## Instalar Twill en un proyecto Laravel

Twill es un paquete de Laravel que incorpora a tu aplicación una interfaz completa de administración, que te permite 
tener fácilmente un CRUD de todas las tablas que desees. Al menos es muy útil para las tablas maestras, y para 
aquellos otros datos para los que necesites una administración rápida.

- [https://twill.io](https://twill.io) - Página principal de Twill
- [Twill demo](https://demo.twill.io/welcome)
- [Step by step - Creating a Twill app](https://spectrum.chat/twill/tips-and-tricks/step-by-step-creating-a-twill-app~ac9bd7f7-d1e3-46a8-8e6f-6075d92cdac7)
  - Post de Pablo Barrios 

Siguiendo la [guía de instalación](https://twill.io/docs/#installation), primero
añadir el paquete *composer* a la aplicación: 

```bash
composer require area17/twill
```

::: warning
Si aparece el error **Fatal error: Allowed memory size of ---- bytes exhausted**
se debe a que composer puede requerir mucha memoria. 
::: 



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

Es bueno crear un _Seeder_ para registrar un usuario de Twill administrador:

1. Crear fichero **database/seeds/TwillUsersSeeder.php**:
   ```php
    <?php
    use Illuminate\Database\Seeder;
    use Carbon\Carbon;
    
    class TwillUsersSeeder extends Seeder
    {
        /**
         * Run the database seeds.
         *
         * @return void
         */
        public function run()
        {
            if (app()->environment() == 'production') return;  // Protección
            
            // Los roles posibles son estos: Admin, Publisher, 'View only', 'SUPERADMIN'
            // Están definidos en A17\Twill\Models\Enums\UserRole
            
            // Usuario Super-administrador
            DB::table('twill_users')->insert([
                'name' => 'Super Admin',
                'email' => 'twill-admin@gmail.com',
                'role' => 'SUPERADMIN',
                'title' => 'Super Admin',
                "password" => Hash::make("secret"),
                'remember_token' => Str::random(10),
                'published' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);
    
        }
    
    }    
   ```
2. Registrar el TwillUsersSeeder en el fichero **database/seeds/DatabaseSeeder.php**:
   ```php
    public function run()
    {
        $this->call(TwillUsersSeeder::class);
    }
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

## Crear un módulo CRUD

La documentación oficial se encuentra aquí: [Twill - cli generator](https://twill.io/docs/#cli-generator).

Para crear un nuevo módulo que se encargue de todo lo relacionado con el CRUD de un modelo, ejecutar 
(ejemplo con el modelo "Escenario"):

```bash
php artisan twill:module escenarios
```

Y se creará:

1. [migration file](#_1-migration-creada-con-twill)
2. [a model](#_2-model-creado-con-twill)
3. [a repository](#_3-repository-creado-con-twill)
4. [a controller](#_4-controller-creado-con-twill)
5. [a form request object](#_5-form-request-creado-con-twill) 
6. [a form view](#_6-form-view-creado-con-twill)
7. Añadir la ruta a **routes/admin.php**:
   ```php
   Route::module('gallifantes');
   ```
8. Añadir una opción de menú en el menú del CMS, en el fichero **config/twill-navigation.php**:
   ```php
   'gallifantes' => [
       'title' => 'Gallifantes',
       'module' => true
   ]
   ``` 
9. Migrar la base de datos:
   ```bash
   php artisan migrate
   ```
10. [Añadir el módulo al panel principal (dashboard) de Twill](#_10-anadir-el-modulo-al-panel-principal-dashboard-de-twill)

Ahora hay que detallar cada uno de los pasos:

## 1. Migration creada con Twill

Es una migration normal, hay que añadir los campos que faltan, y adaptarla a tus necesidades.
[Documentación oficial Migrations](https://twill.io/docs/#migrations)

Si utilizas un modelo existente de antes, es necesario asegurarse de que tiene un campo **published**:

```php
   $table->boolean('published')->default(false);
```

Ejemplo creado: **database/migrations/2019_08_29_193817_create_gallifantes_tables.php**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateGallifantesTables extends Migration
{
    public function up()
    {
        Schema::create('gallifantes', function (Blueprint $table) {
            
            // this will create an id, a "published" column, and soft delete and timestamps columns
            createDefaultTableFields($table);
            
            // feel free to modify the name of this column, but title is supported by default (you would need to specify the name of the column Twill should consider as your "title" column in your module controller if you change it)
            $table->string('title', 200)->nullable();
            
            // your generated model and form include a description field, to get you started, but feel free to get rid of it if you don't need it
            $table->text('description')->nullable();

            // add those 2 colums to enable publication timeframe fields (you can use publish_start_date only if you don't need to provide the ability to specify an end date)
            // $table->timestamp('publish_start_date')->nullable();
            // $table->timestamp('publish_end_date')->nullable();


            // use this column with the HasPosition trait
            // $table->integer('position')->unsigned()->nullable();
        });

        // remove this if you're not going to use any translated field, ie. using the HasTranslation trait. If you do use it, create fields you want translatable in this table instead of the main table above. You do not need to create fields in both tables.
        Schema::create('gallifante_translations', function (Blueprint $table) {
            createDefaultTranslationsTableFields($table, 'gallifante');
            // add some translated fields
            // $table->string('title', 200)->nullable();
            // $table->text('description')->nullable();
        });

        // remove this if you're not going to use slugs, ie. using the HasSlug trait
        Schema::create('gallifante_slugs', function (Blueprint $table) {
            createDefaultSlugsTableFields($table, 'gallifante');
        });

        // remove this if you're not going to use revisions, ie. using the HasRevisions trait
        Schema::create('gallifante_revisions', function (Blueprint $table) {
            createDefaultRevisionsTableFields($table, 'gallifante');
        });
    }

    public function down()
    {
        Schema::dropIfExists('gallifante_revisions');
        Schema::dropIfExists('gallifante_translations');
        Schema::dropIfExists('gallifante_slugs');
        Schema::dropIfExists('gallifantes');
    }
}
```

## 2. Model creado con Twill

Adaptar el fichero creado, y no olvidar ajustar el array _fillable_ para que funcione la
asignación masiva.
[Documentación oficial Models](https://twill.io/docs/#models)

::: warning
Observar que el modelo ha de extender la clase 
**use A17\Twill\Models\Model;**
en lugar de la clase _model_ por defecto de Laravel
:::

Ejemplo creado: **app/Models/Gallifante.php**

```php
<?php

namespace App\Models;
use A17\Twill\Models\Model;

class Gallifante extends Model 
{

    protected $fillable = [
        'published',
        'title',
        'description',
        // 'position',
        // 'public',
        // 'featured',
        // 'publish_start_date',
        // 'publish_end_date',
    ];

    // uncomment and modify this as needed if you use the HasTranslation trait
    // public $translatedAttributes = [
    //     'title',
    //     'description',
    //     'active',
    // ];
    
    // uncomment and modify this as needed if you use the HasSlug trait
    // public $slugAttributes = [
    //     'title',
    // ];

    // add checkbox fields names here (published toggle is itself a checkbox)
    public $checkboxes = [
        'published'
    ];

    // uncomment and modify this as needed if you use the HasMedias trait
    // public $mediasParams = [
    //     'cover' => [
    //         'default' => [
    //             [
    //                 'name' => 'landscape',
    //                 'ratio' => 16 / 9,
    //             ],
    //             [
    //                 'name' => 'portrait',
    //                 'ratio' => 3 / 4,
    //             ],
    //         ],
    //         'mobile' => [
    //             [
    //                 'name' => 'mobile',
    //                 'ratio' => 1,
    //             ],
    //         ],
    //     ],
    // ];
}
```

## 3. Repository creado con Twill

Para ajustar todo lo relacionado con los gallifantes. 
[Documentación oficial Repositories](https://twill.io/docs/#repositories).
Sirve para gestionar:

- filtering:
- custom ordering
- custom form fieds
- custom field preparation before create action
- custom field preparation before save action
- after save actions (like attaching a relationship)
- hydrating the model for preview of revisions

Ejemplo creado: **app/Repositories/GallifanteRepository.php**
  
```php
<?php

namespace App\Repositories;
use A17\Twill\Repositories\ModuleRepository;
use App\Models\Gallifante;

class GallifanteRepository extends ModuleRepository
{

    public function __construct(Gallifante $model)
    {
        $this->model = $model;
    }
}
```  
 
## 4. Controller creado con Twill

Hay que definir las opciones _index/browser/form endpoints_.
[Documentación oficial Controllers](https://twill.io/docs/#controllers).

Se definen cómo aparecen todas las columnas, los filtros, opciones de búsqueda, paginación,
si se muestran los botones de "eliminar", "reordenar", "crear", "editar", si la edición se hace
en un dialog modal, y muchas más opciones.

Ejemplo creado: **app/Http/Controllers/Admin/GallifanteController.php**

```php
<?php

namespace App\Http\Controllers\Admin;
use A17\Twill\Http\Controllers\Admin\ModuleController;

class GallifanteController extends ModuleController
{
    protected $moduleName = 'gallifantes';
    
    /*
     * Key of the index column to use as title/name/anythingelse column
     * This will be the first column in the listing and will have a link to the form
     */
    protected $titleColumnKey = 'nombre';

    /*
     * Deshabilitar la paginación
     */
    protected $perPage = -1;

   /*
    * Specify the default listing order
    */ 
    protected $defaultOrders = ['nombre' => 'asc'];
}
```

## 5. Form Request creado con Twill

Se pueden añadir reglas de validación. Si este fichero no existe no pasa nada.
[Documentación oficial Form Requests](https://twill.io/docs/#form-requests)

Ejemplo creado: **app/Http/Requests/Admin/GallifanteRequest.php**

```php
<?php

namespace App\Http\Requests\Admin;
use A17\Twill\Http\Requests\Admin\Request;

class GallifanteRequest extends Request
{
    public function rulesForCreate()
    {
        return [];
    }

    public function rulesForUpdate()
    {
        return [];
    }
}
```

## 6. Form View creado con Twill

Ahora hay que incluir los campos usando directivas _@formField_.
[Documentación oficial Form Fields](https://twill.io/docs/#form-fields).

Revisar la documentación para todos los posibles tipos de campos:
[Input](https://twill.io/docs/#input) (caja texto, textarea, WYSIWYG),
[Medias](https://twill.io/docs/#medias) (image, slideshow),
Datepicker,
[Select](https://twill.io/docs/#select) (simple, empaquetado, multiselect),
[Block editor](https://twill.io/docs/#block-editor-2),
[Repeater](https://twill.io/docs/#repeater),
Browser de otros modelos relacionados,
[Files](https://twill.io/docs/#files),
[Mapa geográfico](https://twill.io/docs/#map),
[Color](https://twill.io/docs/#color),
Single checkbox, 
Multiple checkboxes,
Radios.

Ejemplo creado: **resources/views/admin/gallifantes/form.blade.php**

```php
@extends('twill::layouts.form')

@section('contentFields')
    
    @formField('input', [
        'name' => 'subtitulo',
        'label' => 'Subtítulo',
        'maxlength' => 100,
        'required' => true,
        'note' => 'Hint message goes here',
        'placeholder' => 'Placeholder goes here',
    ])
    
    @formField('input', [
        'translated' => true,
        'name' => 'subtitle_translated',
        'label' => 'Subtítulo (traducido)',
        'maxlength' => 250,
        'required' => true,
        'type' => 'textarea',
        'rows' => 3
    ])
        
@stop
``` 



## 10. Añadir el módulo al panel principal (dashboard) de Twill

Para que aparezca en el panel principal de Twill, hay que añadirlo a la sección **modules**
de la configuración de Twill.

Ejemplo, en el fichero **config/twill.php**:

```php
return [
    'dashboard' => [
        'modules' => [
            'gallifantes' => [ // module name if you added a morph map entry for it, otherwise FQCN of the model (eg. App\Models\Project)
                'name' => 'gallifantes', // module name
                'label' => 'gallifantes', // optional, if the name of your module above does not work as a label
                'label_singular' => 'gallifante', // optional, if the automated singular version of your name/label above does not work as a label
                'count' => true, // show total count with link to index of this module
                'create' => true, // show link in create new dropdown
                'activity' => true, // show activities on this module in actities list
                'draft' => false, // show drafts of this module for current user 
                'search' => true, // show results for this module in global search
            ]
        ]
    ]
];
```
