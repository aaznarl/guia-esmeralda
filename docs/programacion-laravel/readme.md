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

### Ejemplo de migration para crear tabla

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
    $nombre = $faker->name;

    // Hay que asegurarse que no excede la longitud permitida
    if (strlen($nombre) > User::MAX_LONG_NAME) $nombre = substr($nombre, 0, User::MAX_LONG_NAME); 
    
    // A todos los usuarios les ponemos de contraseña "secret"
    return [
        'name' => $nombre,
        'email' => $faker->unique()->safeEmail,
        'email_verified_at' => now(),
        'password' => $password ?: $password = bcrypt('secret'),
        'remember_token' => str_random(10),
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

        Rol::updateOrCreate(
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
        );
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
        $usuarios = User::all();
        
        foreach ( $usuarios as $usuario )
        {
            $usuario->objetivos()->saveMany(
                factory( Objetivo::class, rand(1,3) )->make()
            );
        }
        
    }
}
```



