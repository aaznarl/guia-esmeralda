# Programación en Laravel

Tabla de contenidos:

[[TOC]]

En profundidad:

- [GraphQL en Laravel](graphql.md)


## Referencias básicas de Laravel

- Documentación: [http://laravel.com/docs](http://laravel.com/docs)
- Repositorio en GitHub: [https://github.com/laravel/laravel](https://github.com/laravel/laravel)
- Repositorio oficial de paquetes laravel: [Packalyst](http://packalyst.com/packages) 


## Crear la Migration

Comandos:

```bash
 php artisan make:migration crear_tablas_escenarios   # Crear las tablas de escenarios
```

### Ejemplo de migration para crear una tabla maestra

```php
<?php
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\TipoOrden;

class CrearTablaTiposordenes extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tiposOrdenes', function(Blueprint $table)
        {
            $table->unsignedInteger('id')->unique();
            $table->string('nombre', TipoOrden::MAX_LONG_NOMBRE);
            $table->string('descripcion', TipoOrden::MAX_LONG_DESCRIPCION)->nullable();
            $table->boolean('obsoleto')->default(0);

            $table->timestamps();
            $table->softDeletes();
        });

        // Poblar la tabla:
        Artisan::call('db:seed', ['--class' => TipoOrdenSeeder::class]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tiposOrdenes');
    }
}
```


### Ejemplo de migration para crear una tabla de datos

```php
<?php
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CrearTablaEscenarios extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('escenarios', function (Blueprint $table) 
        {
            $table->increments('id');

            $table->string('nombre');
            $table->string('descripcion')->nullable();
            $table->boolean('activo')->default(true);

            $table->integer('user_id')->unsigned();
            $table->foreign('user_id')
                ->references('id')->on('users');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('escenarios');
    }
}
````

### Ejemplo de migration para añadir campo a una tabla

```php
<?php
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

use App\Models\Tarea;

class AmpliarTablaTareas extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tareas', function (Blueprint $table) 
        {
            $table->boolean('atomica')->default(true);
            $table->dateTime('fechaFin')->nullable();
            
            $table->integer('user_id')->unsigned();
            $table->foreign('user_id')
                ->references('id')->on('users');
        });
        
        // Si se trata de una tabla maestra, hay que poblarla:
        Artisan::call('db:seed', ['--class' => TiposLiquidacionesSeeder::class]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tiposContacto', function ($table) 
        {
            $table->dropColumn('atomica');
            $table->dropColumn('fechaFin');

            // Verificar el nombre de la constraint en la BD
            $table->dropForeign('tareas_user_id_foreign'); 
            $table->dropColumn('user_id');
        });
    }
}

```

## Crear el Model

Para crear el model seguir estos pasos:

1. Ejecutar ```php artisan make:model Escenario```
2. Copiar el fichero recién creado *Escenario.php* de la carpeta *app* a *app\Models*
3. Modificar el namespace del propio fichero, en el código para poner *namespace App\Models;*
4. Seguir editando el fichero como se indica a continuación.

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Objetivo extends Model
{
    use SoftDeletes;

    protected $table = 'objetivos';    
    protected $guarded = ['id', 'created_at', 'updated_at', 'deleted_at', 'user_id'];

    // Supported casts:
    // https://laravel.com/docs/5.8/eloquent-mutators#attribute-casting
    protected $casts = [
        'activo' => 'boolean',
        'conseguido_at' => 'datetime'
    ];

    public const MAX_LONG_NOMBRE = 80;
    public const MAX_LONG_DESCRIPCION = 500;
    
    /**
     * Usuario propietario del Objetivo
     *
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Tareas asociadas a este objetivo. Relación 1 a N
     *
     */
    public function tareas()
    {
        return $this->hasMany(Tarea::class, 'objetivo_id', 'id');
    }
    
    /**
     * Problemas asociados a este objetivo. Relación N a N
     * Se presupone una tabla de cruce "objetivos_problemas" 
    */
    public function problemas()
    {
        return $this->belongsToMany(Problema::class);
    }
    
    /**
     * Crear un atributo "computado". 
     * 
     * @return float
     */
    public function getNumeroTareasAttribute()
    {
        return $this->tareas->count(); 
    }
}
```



## Crear la Factory

Para crear el fichero, ejecutar ([referencia](https://laravel.com/docs/5.8/database-testing#generating-factories)):

```bash
php artisan make:factory PostFactory --model=Post
```

Ejemplo de código completo para crear una factory:

```php
<?php
use Faker\Generator as Faker;
use App\Models\User;

$factory->define(User::class, function (Faker $faker) {
    static $password;
    
    // A todos los usuarios les ponemos de contraseña "secret"
    return [
        'name' => substr( $faker->name, 0, User::MAX_LONG_NAME ),
        'observaciones' => $faker->realText(User::MAX_LONG_OBSERVACIONES),
        'email' => $faker->unique()->safeEmail,
        'email_verified_at' => now(),
        'vegetariano' => random_int(1,3) === 1 ? true : false,
        'password' => $password ?: $password = bcrypt('secret'),
        'remember_token' => Str::random(10)
    ];
});

```


## Crear el Seeder

Herramientas:

  * [laravel-factory-prefill](https://github.com/Naoray/laravel-factory-prefill#laravel-factory-prefill) - Factories are a great concept and I really love to use them for testing purposes, but it sucks to write every needed column name and associated faker methods by hand. **Te escribe las factories de forma rápida para no tener que escribir cada campo**, que es un tostón. **tontería pero útil**.
  * [iSeed](https://github.com/orangehill/iseed) - Inverse seed generator (iSeed) is a Laravel package that provides a method to generate a new seed file based on data from the existing database table.

Comandos:

```bash
php artisan make:seeder UsersSeeder        # Crear un seeder
php artisan db:seed --class=UsersSeeder    # Ejecutar un seeder concreto (poblar la BD)

# Si haces un nueva clase seeder y al intentar ejecutarla con 
#     php artisan db:seed --clas=MiSeeder 
# te dice que Class not found, tienes que ejecutar:
composer dump-autoload
```

Existen 2 tipos de seeders:

- **Seeders de tablas maestras**: En cuyo caso deben ser llamados desde la propia migration (y sólo desde la migration que crea el correspondiente model), y **sí** deben ejecutarse en producción.
- **Seeders de datos falsos**: En cuyo caso sólo sirven para poblar las tablas de datos, con datos falsos, para ser utilizados en desarrollo, preproducción, laboratorios y pruebas, pero **nunca** deben ejecutarse en producción. 


### Ejemplo seeder de tabla maestra

```php
<?php
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    /**
     * Crear los 2 tipos de roles que han de existir siempre
     *
     * @return void
     * @throws Exception
     */
    public function run()
    {
        $ahora = new \Carbon\Carbon();

        DB::table('roles')->insert([
            [
                'id' => Rol::ID_ADMINISTRADOR,
                'rol' => 'Administrador',
                'descripcion' => 'Administrador del sistema, con capacidad de ver todos los registros de todos los usuarios, y tocar cualquier configuración.',
                'habilitado' => true,
                'created_at' => $ahora
            ],
            [
                'id' => Rol::ID_RECEPTOR_ERRORES,
                'rol' => 'Receptor de errores',
                'descripcion' => 'Las personas con este rol recibirán los errores que se produzcan en la aplicación',
                'habilitado' => true,
                'created_at' => $ahora
            ]
        ]);
    }
}
```


### Ejemplo seeder de datos falsos

```php
<?php
use Illuminate\Database\Seeder;
use App\Models\Objetivo;
use App\Models\User;

class ObjetivosSeeder extends Seeder
{
    /**
     * A un usuario meterle objetivos que tiene ese usuario.
     * Le añadimos entre 1 y 3 objetivos (aleatorio) a cada usuario 
     *
     * @return void
     * @throws Exception
     */
    public function run()
    {
        if (app()->environment() == 'production') return;  // Protección
        
        // Puedo crear 4 usuarios si no hubiera un UserSeeder antes (que debería haberlo):
        factory(User::class, 4)->create();
        
        User::all()->each( function( User $usuario)
        {
            $usuario->objetivos()->saveMany(
                factory( Objetivo::class, rand(1,3) )->make()
            );
        });
        
    }
}
```


## Gestión de errores en Laravel

Para registrar apropiadamente los errores nos vamos a aprovechar de las propias herramientas de Laravel, que 
tiene un [potente sistema de logging](https://laravel.com/docs/5.8/logging). Este sistema ya ha pensado en como 
configurar muy bien los diferentes entornos (production, local, dev, test) y también los posibles canales de log:

| Canal de log	| Description | 
| ------------	| ----------- |
| stack	        | A wrapper to facilitate creating "multi-channel" channels | 
| single	    | A single file or path based logger channel (StreamHandler) |
| daily	        | A RotatingFileHandler based Monolog driver which rotates daily |
| slack	        | A SlackWebhookHandler based Monolog driver |
| papertrail	| A SyslogUdpHandler based Monolog driver |
| syslog	    | A SyslogHandler based Monolog driver |
| errorlog	    | A ErrorLogHandler based Monolog driver |
| monolog	    | A Monolog factory driver that may use any supported Monolog handler |
| custom	    | A driver that calls a specified factory to create a channel |

La función que recoge todos los errores de la aplicación se encuentra en “**app/Exceptions/Handler.php**”:

```php
/**
 * Report or log an exception.
 *
 * @param  \Exception  $exception
 * @return void
 */
public function report(Exception $exception)
{
    //parent::report($exception);
    Log::error($exception->message);
}
```




