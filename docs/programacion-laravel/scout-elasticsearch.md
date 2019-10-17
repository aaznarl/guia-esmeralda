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

## Configurar el Model Indexer

Según se indica en la [configuración de laravel](https://laravel.com/docs/5.8/scout#configuring-model-indexes),
es necesario configurar el **index** de elasticsearch. Se hace en fichero propio para ello:

```php
/*  app\IndexConfigurators\AsientosIndexConfigurator.php  */
<?php

namespace App\IndexConfigurators;

use ScoutElastic\IndexConfigurator;
use ScoutElastic\Migratable;

class AsientosIndexConfigurator extends IndexConfigurator
{
    use Migratable;

    /**
     * @var array
     */
    protected $settings = [
        'analysis' => [
            'analyzer' => [
                'es_std' => [
                    'type' => 'standard',
                    'stopwords' => '_spanish_'
                ]
            ]
        ]
    ];
}
```

Para vacíar todos los registros indexados y volver a importarlos:

```bash
# Creates an Elasticsearch index:
php artisan elastic:create-index "App\IndexConfigurators\AsientosIndexConfigurator"

# Updates settings and mappings of an Elasticsearch index
php artisan elastic:update-index "App\IndexConfigurators\AsientosIndexConfigurator"

# Drops an Elasticsearch index
php artisan elastic:drop-index "App\IndexConfigurators\AsientosIndexConfigurator"


# remove all of a model's records from your search indexes
php artisan scout:flush "App\Models\Asiento"

# Importar desde la BD todos los registros en el índice elasticsearch
php artisan scout:import "App\Models\Asiento"
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
            'lugar' => [
                'type' => 'text'
            ]
        ]
    ];
}
```

Si por alguna razón se modifica el array **$mapping**, hay que actualizarlo:

```bash
php artisan elastic:update-mapping "App\Models\Asiento"
```



## Haciendo búsquedas

Para probar las búsquedas, se puede utilizar _Tinker_ por ejemplo. Como se puede ver en la 
[documentación de Laravel](https://laravel.com/docs/5.8/scout#searching):

```bash
// performed on the index specified by the model's searchableAs method:
$orders = App\Order::search('Star Trek')->get();   

// you may use the within method to specify a custom index that should be searched instead:
$orders = App\Order::search('Star Trek')
    ->within('tv_shows_popularity_desc')
    ->get();
```




