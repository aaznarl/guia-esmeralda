# Laravel Scout con ElasticSearch

[[TOC]]

## Instalación de Scout y de ElasticSearch

Primero, seguir las instrucciones para añadir [Laravel Scout](https://laravel.com/docs/5.8/scout) al proyecto, y configurarlo:

```bash
composer require laravel/scout
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

Después, instalar el paquete [babenkoivan/scout-elasticsearch-driver](https://github.com/babenkoivan/scout-elasticsearch-driver#installation)
y configurarlo:

```bash
composer require babenkoivan/scout-elasticsearch-driver
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
php artisan vendor:publish --provider="ScoutElastic\ScoutElasticServiceProvider"
```

## Crear un índice (configurar Model Indexer)

Según se indica en la [configuración de laravel](https://laravel.com/docs/5.8/scout#configuring-model-indexes),
es necesario configurar el **index** de elasticsearch.

Por cada "grupo de datos" o model sobre el que se quiera buscar, hay que crear un **Model indexer**, que se encargará 
de indexar todos los objetos de ese *model*. Dado que la configuración de todos los índices que vamos a crear casi seguro
que tienen la misma configuración, parece buena idea hacer un índice base con un *trait*. 

Para cada model, creamos su *Index Configurator*:

```php
<?php
namespace App\IndexConfigurators;

use ScoutElastic\IndexConfigurator;
use ScoutElastic\Migratable;
use App\IndexConfigurators\TraitIndexConfigurator;

class ContactosIndexConfigurator extends IndexConfigurator
{
    use Migratable;
    use TraitIndexConfigurator;

    public function __construct()
    {
        $this->settings = $this->plantillaSettingsPorDefecto();
    }
}
```

Basado en el trait que define la función **plantillaSettingsPorDefecto**:

```php
<?php
namespace App\IndexConfigurators;

trait TraitIndexConfigurator
{
    public function plantillaSettingsPorDefecto()
    {
        return         [
            'max_ngram_diff' => 4,

            'analysis' => [

                'filter' => [

                    'spanish_stop' => [
                        'type' => 'stop',
                        'stopwords' => '_spanish_'
                    ],

                    'spanish_keywords' => [
                        'type' => 'keyword_marker',
                        'keywords' => ['ejemplo']
                    ],

                    'spanish_stemmer' => [
                        'type' => 'stemmer',
                        'language' => 'light_spanish'
                    ]

                ],

                'tokenizer' => [

                    'lares2_tokenizer_ngram' => [
                        'type' => 'nGram',
                        'min_gram' => 3,
                        'max_gram' => 7,
                        'token_chars' => ['letter', 'digit']
                    ],

                    'lares2_tokenizer_edge_ngram' => [
                        'type' => 'edge_ngram',
                        'min_gram' => 3,
                        'max_gram' => 10,
                        'token_chars' => ['letter', 'digit']
                    ]

                ],


                'analyzer' => [

                    'es_std' => [
                        'type' => 'standard',
                        'stopwords' => '_spanish_'
                    ],

                    'lares2_analyzer_ngram' => [
                        'type' => 'custom',
                        'tokenizer' => 'lares2_tokenizer_ngram',
                        'filter' => ['asciifolding', 'lowercase', 'spanish_stop']
                    ],

                    'lares2_analyzer_edge_ngram' => [
                        'type' => 'custom',
                        'tokenizer' => 'lares2_tokenizer_edge_ngram',
                        'filter' => ['asciifolding', 'lowercase', 'spanish_stop']
                    ],

                    'lares2_analyzer_stemmer' => [
                        'type' => 'spanish',
                        'filter' => ['asciifolding', 'lowercase', 'spanish_stop', 'spanish_keywords', 'spanish_stemmer']
                    ],

                    'default' => [
                        'type' => 'spanish',
                        'filter' => ['asciifolding', 'lowercase', 'spanish_stop', 'spanish_keywords', 'spanish_stemmer']
                    ]

                ]
            ]
        ];
    }
}
```



## Configuración del modelo

A continuación se muestra el ejemplo con un modelo "**Asiento**":

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use ScoutElastic\Searchable;    // En lugar de Laravel\Scout\Searchable

class Asiento extends Model
{
    use Searchable;
    
    protected $indexConfigurator = AsientosIndexConfigurator::class;

    protected $searchRules = [
        AsientosSearchRule::class
    ];

    // Here you can specify a mapping for model fields
    protected $mapping = [
        'properties' => [
            'id' =>      ['type' => 'keyword'],
            'user_id' => ['type' => 'keyword'],
            'nombre' =>  ['type' => 'text', 'analyzer' => 'lares2_analyzer_ngram'],
            'lugar' =>   ['type' => 'text' ]
        ]
    ];

    /**
     * Get the indexable data array for the model.
     * Esta es la información que se envía al ElasticSearch para que sea indexada. Si eliminas este método
     * se utiliza por defecto:
     *
     *              return $this->toArray();
     *
     * @return array
     */
    public function toSearchableArray()
    {
        return
            [
                'id' => $this->id,
                'user_id' => $this->user_id,
                'nombre' => $this->nombre,
                'descripcion' => $this->descripcion,
                'cuerpo' => $this->cuerpo,
                'obsoleto' => $this->obsoleto
            ];
    }


}
```

Si por alguna razón se modifica el array **$mapping**, hay que actualizarlo:

```bash
php artisan elastic:update-mapping "App\Models\Asiento"
```


## Comandos para operar con un índice

Para vacíar todos los registros indexados y volver a importarlos:

```bash
# Creates an Elasticsearch index:
php artisan elastic:create-index "App\IndexConfigurators\AsientosIndexConfigurator"

# Updates settings and mappings of an Elasticsearch index
php artisan elastic:update-index "App\IndexConfigurators\AsientosIndexConfigurator"

# Updates mapping (Si por alguna razón se modifica el array $mapping, hay que actualizarlo)
php artisan elastic:update-mapping "App\Models\Asiento"

# Drops an Elasticsearch index
php artisan elastic:drop-index "App\IndexConfigurators\AsientosIndexConfigurator"


# remove all of a model's records from your search indexes
php artisan scout:flush "App\Models\Asiento"

# Importar desde la BD todos los registros en el índice elasticsearch
php artisan scout:import "App\Models\Asiento"
```



## Haciendo búsquedas

Para probar las búsquedas en línea de comandos, se puede utilizar _Tinker_ por ejemplo. Como se puede ver en la 
[documentación de Laravel](https://laravel.com/docs/5.8/scout#searching):

```bash
// performed on the index specified by the model's searchableAs method:
$orders = App\Order::search('Star Trek')->get();   

// you may use the within method to specify a custom index that should be searched instead:
$orders = App\Order::search('Star Trek')
    ->within('tv_shows_popularity_desc')
    ->get();
```

Ejemplo del código PHP para hacer una búsquedas (ver [documentación aquí](https://github.com/babenkoivan/scout-elasticsearch-driver#usage)):

```php
return Contacto::search( 'Pepe' )
  
    // specify columns to select
    ->select(['nombre', 'apellidos'])

    // filter
    ->where('user_id', $usuario->id )
    ->where('obsoleto', false)

    // sort
    ->orderBy('edad', 'asc')

    // collapse by field
    ->collapse('brand')

    // set offset
    ->from(0 )
 
    // set limit
    ->take(50 )

    // get results
    ->get();
```

Si sólo quieres obtener el número de elementos, se puede usar el método **count**:

```php
Contacto::search('phone') 
    ->count();
```

Puedes usar *:

```php
Contacto::search('*')
    ->where('user_id', 1)
    ->get();
```
