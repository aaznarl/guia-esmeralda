# Autorización (Gates, policies)


[[TOC]]


## Modelo conceptual

El sistema de autorización, es decir, el proceso por el que se determina si un usuario concreto puede o no realizar
una acción concreta, tiene dos conceptos muy importantes:


### Permisos

Un permiso es una acción concreta para la que alguien puede estar autorizado o no. Dado que son acciones,
su nombre ha de comenzar por un **verbo**. Si a un permiso se le pone un nombre que hace referencia a personas o grupos de 
personas, se aumenta la confusión y los errores de concepto.

::: tip Ejemplos correctos
Nombres adecuados serían: "Editar formulario" o "Leer denuncias"
:::

::: warning Ejemplos incorrectos
Nombres equivocados: "Editor formularios", "Lector denuncias" 
:::

Cada permiso se corresponderá en la aplicación Laravel con una "Gate", es decir, una función a la que se le pasa
por parámetro el usuario y el objeto (opcional) sobre la que se evalúa el permiso, y esa función ha de devolver únicamente "true" ó "false".
Es importante entender que los permisos están **muy unidos al código fuente de la aplicación**, de hecho, se encuentran hardcodeados
en las "gates", incluso aunque se incluya una tabla de "permisos" en la base de datos.

Si se escribieran todas las "gates" en un único fichero, el fichero podría ser muy largo, razón por la cual se agrupan
en ficheros separados, metiendo todas las "gates" que tienen que ver con un modelo (ej: Denuncia), en un único fichero, en una única
clase PHP que se llama "Policy".


### Roles

Un Rol es un conjunto de usuarios a los que se les asociarán uno o varios permisos. Dado que es un grupo de
personas, su configuración y gestión depende mucho más de cómo sea la organización, y de cómo quieran organizarse
en cada momento, que de la aplicación. 

Por esta razón, los roles han de tener nombres que hagan referencia a ese grupo de personas, y podrán cambiar en el tiempo, si por
ejemplo llega un nuevo jefe a la unidad que quiere organizar las cosas en grupos distintos de personas.

::: tip Ejemplos correctos
Nombres adecuados: 
- "Instructores de la unidad de inteligencia"
- "Editores de formularios de la D. Competencia"
- "Supervisor" (menos adecuado, pero válido)
:::

::: warning Ejemplos incorrectos
Ejemplo incorrecto: "Leer buzones de denuncias"
:::

Para enfocar conceptualmente bien los roles, y evitar confusión, es adecuado ponerles un **nombre en plural**, que haga referencia
a un grupo de personas. A cada rol se le podrán asociar uno o varios permisos.


## Ejemplo: Policy

Código de ejemplo de una policy sobre el model **Tarea**:

```php
<?php
namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use App\Models\Tarea;

class TareaPolicy
{
    use HandlesAuthorization;

    /**
     * Create a new policy instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }


    /******** Lista de habilidades     *******************************************************/

    /*
     * Esta habilidad permite ver una tarea concreta y sus detalles
     *
     * @param User $user
     * @param Tarea $tarea
     * @return bool
     */
    public function show(User $user, Tarea $tarea)
    {
        if ($user->id == $tarea->user_id) { return true; }                  // La tarea es mía

        // No se cumple ninguna de las condiciones anteriores
        return false;
    }

    /*
     * Esta habilidad permite editar una tarea concreta
     *
     * @param User $user
     * @param Tarea $tarea
     * @return bool
     */
    public function edit(User $user, Tarea $tarea)
    {
        if ($user->id == $tarea->user_id) { return true; }                  // La tarea es mía

        // No se cumple ninguna de las condiciones anteriores
        return false;
    }

    /*
     * @param User $user
     * @param Tarea $tarea
     * @return bool
     */
    public function create(User $user)
    {
        return true;
    }
    
    
    /*
     * Esta habilidad permite eliminar una tarea concreta
     *
     * @param User $user
     * @param Tarea $tarea
     * @return bool
     */
    public function destroy(User $user, Tarea $tarea)
    {
        if ($user->id == $tarea->user_id) { return true; }                  // La tarea es mía

        // No se cumple ninguna de las condiciones anteriores
        return false;
    }
}
```

Toda policy ha de de registrarse en ```app/Providers/AuthServiceProvider.php```:

```php
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        User::class => UserPolicy::class,
        Tarea::class => TareaPolicy::class
    ];
```






## Añadir sistema de autenticación a una aplicación

En esta sección se va a explicar paso a paso cómo introducir el sistema de permisos en una aplicación Laravel. Para 
ello se utilizará el paquete [Spatie Laravel Permission](https://docs.spatie.be/laravel-permission/v3/introduction/),
y se ampliará con algunas mejoras importantes.

Este paquete permite todas las posibilidades: asignar roles a los usuarios, asignar permisos directamente los usuarios, y asociar
roles con un grupo de permisos:

```php
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

# Trabajar con un rol:
$rol = Role::create(['name' => 'Supervisores']);         # Crear un rol
$rol->givePermissionTo('Editar todos los asientos');     # Añadir un permiso al rol
$rol->revokePermissionTo('Editar todos los asientos');   # Quitar un permiso al rol
                 

# Trabajar con un permiso:
$permiso = Permission::create(['name' => 'Editar todos los asientos de todos los usuarios']);  # Crear un permiso
$permiso->assignRole('Supervisores');     # Añadir un permiso a un rol
$permiso->removeRole('Supervisores');     # Quitar un permiso a un rol 

# Con el usuario:
$user = User::where('id',3)->with('roles')->with('permissions')->get();  # Cargar un usuario con sus roles y permisos

$user->assignRole('Supervisores');       # Asignar un rol al usuario
$user->assignRole(['writer', 'admin']);  # Asignar varios roles al usuario
$user->removeRole('writer');             # Quitarle un rol al usuario
$user->hasRole('writer');                # Chequear si un usuario tiene un rol  (¡¡NO USAR!!)

$user->givePermissionTo('Editar asientos');                     # Asignar un permiso directo
$user->givePermissionTo(['edit articles', 'delete articles']);  # Asignar varios permisos directos
$user->revokePermissionTo('edit articles');                     # Quitar un permiso directo

$user->hasPermissionTo('edit articles');           # Chequear por nombre del permiso
$user->hasPermissionTo(34);                        # Chequear por id del permiso
$user->hasAnyPermission(['edit articles', 34]);    # Chequear si tiene algún permiso de la lista
$user->hasAllPermissions(['edit articles', 34]);   # Chequear si tiene todos los permisos de la lista
$user->can('edit articles');                       # Funciona con la función "can" de Laravel
```



### Instalación paquete Spatie Laravel Permission

Hay que seguir las instrucciones definidas en la [documentación](https://docs.spatie.be/laravel-permission/v3/installation-laravel/):

```bash
# Añadir el paquete a composer:
composer require spatie/laravel-permission

# Añadir el fichero de migration al proyecto:
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider" --tag="migrations"

# Añadir el fichero de configuración al proyecto (config/permission.php):
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider" --tag="config"
```

La migration de este paquete de Spatie crea estas 5 tablas con estas columnas:

- Tabla **permissions**: id, name, guard_name, timestamps 
- Tabla **roles**: id, name, guard_name, timestamps
- Tabla **model_has_permissions**: model_id, permission_id, model_type
- Tabla **model_has_roles**: model_id, role_id, model_type
- Tabla **role_has_permissions**: role_id, permission_id

Según se indica en la [documentación](https://docs.spatie.be/laravel-permission/v3/basic-usage/basic-usage/), 
es necesario añadir el trait **HasRoles** al model **User** que utilice la aplicación:

```php
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;

    // ...
}
``` 


### Crear tabla de apoyo y model: Tipos de permisos

Es muy conveniente añadir una tabla maestra de apoyo donde se puedan definir los **tipos de permisos**. Estos
tipos de permisos serán una lista cerrada y bien tipificada, totalmente hardcodeada, que tiene las siguientes funciones:

- Poder mostrar por interfaz la lista de permisos genéricos posibles
- Dado un modelo concreto, poder sacar por interfaz las posibilidades de permisos para ese objeto

Esta sería la migration para crear esa tabla maestra:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use App\Models\User;
use App\Models\TipoPermiso;
use Spatie\Permission\Models\Permission;
use App\Models\Servicio;

class CrearTablaTiposPermisos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        /**
         * Crear tabla tiposPermisos
         */
        Schema::create('tiposPermisos', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', TipoPermiso::MAX_LONG_NOMBRE);
            $table->string('model', TipoPermiso::MAX_LONG_MODEL)->nullable();
            $table->string('descripcion', TipoPermiso::MAX_LONG_DESCRIPCION)->nullable();
            $table->boolean('obsoleto')->default(0);

            $table->timestamps();
            $table->softDeletes();
        });

        /**
         * Poblar la tabla de Tipos de permisos
         */
        $permisos = [
            [
                'nombre' => TipoPermiso::VER_ADMINISTRACION,
                'model' => null,
                'descripcion' => 'Ver los datos del servidor, el chequeo de salud, el estado de las tablas, de la caché y de ElasticSearch'
            ],
            [
                'nombre' => TipoPermiso::ADMINISTRAR_USERS,
                'model' => null,
                'descripcion' => 'Ver y administrar la tabla de usuarios de la aplicación. Modificar usuarios, resetear claves, eliminar usuarios, etc'
            ],
            [
                'nombre' => TipoPermiso::ASIGNAR_PERMISOS_GLOBALES,
                'model' => null,
                'descripcion' => 'Asignar y quitar permisos globales a roles y usuarios. ' .
                                 'Son permisos globales aquellos no relacionados con un registro concreto. ' .
                                 'El usuario sólo podrá asignar o quitar permisos a otros roles y usuarios si ese permiso es de un tipo que él mismo posee. '
            ],
            [
                'nombre' => TipoPermiso::SERVICIOS_VER_TODOS,
                'model' => null,
                'descripcion' => 'Ver todos los servicios de todos los usuarios'
            ],
            [
                'nombre' => TipoPermiso::SERVICIOS_EDITAR_TODOS,
                'model' => null,
                'descripcion' => 'Editar todos los servicios de todos los usuarios'
            ],
            [
                'nombre' => TipoPermiso::SERVICIO_SHOW,
                'model' => Servicio::class,
                'descripcion' => 'Ver todos los datos de un servicio concreto'
            ],
            [
                'nombre' => TipoPermiso::SERVICIO_EDIT,
                'model' => Servicio::class,
                'descripcion' => 'Editar todos los datos de un servicio concreto, pero no eliminar ese servicio'
            ]
        ];

        // Poblar la tabla de Tipos de permisos recién creada
        TipoPermiso::insert( $permisos );

        // Poblar la tabla de permissions con los permisos "generales" (no asociados con un objeto concreto)
        TipoPermiso::whereNull('model')->get()->each(function( $tipoPermiso ) {
            Permission::create( [ 'name' => $tipoPermiso->nombre ] );
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tiposPermisos');
    }
}
```

Y este sería el modelo **TipoPermiso** (fichero app/Models/TipoPermiso.php):

```php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TipoPermiso extends Model
{
    use SoftDeletes;

    protected $table = 'tiposPermisos';
    protected $guarded = ['updated_at', 'deleted_at'];

    protected $fillable = [];

    protected $casts = [
        'obsoleto' => 'boolean'
    ];

    public const MAX_LONG_NOMBRE = 80;
    public const MAX_LONG_MODEL = 80;
    public const MAX_LONG_DESCRIPCION = 500;

    /****** Lista de Tipos de permisos *******/

    public const VER_ADMINISTRACION = "Ver administracion";
    public const ADMINISTRAR_USERS = "Administrar usuarios";
    public const ASIGNAR_PERMISOS_GLOBALES = "Asignar permisos globales";

    public const SERVICIOS_VER_TODOS = 'Ver todos los servicios';
    public const SERVICIOS_EDITAR_TODOS = 'Editar todos los servicios';
    public const SERVICIO_SHOW = 'Ver servicio_';
    public const SERVICIO_EDIT = 'Editar servicio_';
}
```

Es muy recomendable tener un usuario super-administrador, definido a fuego en el fichero **.env**:

```
SUPER_USER_NAME=Pepe
SUPER_USER_EMAIL=pepe@gmail.com
```

Y en el Seeder de usuarios añadirle varios permisos importantes (fichero *database/seeds/UsersSeeder*):

```php
<?php
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use App\Models\User;
use App\Models\TipoPermiso;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        if (app()->environment() == 'production') return;  // Protección

        // Creamos primero el super usuario
        $superUsuario_name = env('SUPER_USER_NAME','Pepe');
        $superUsuario_email = env('SUPER_USER_EMAIL', 'pepe@gmail.com');
        DB::table('users')->insert([
            'name' => $superUsuario_name,
            'email' => $superUsuario_email,
            "password" => Hash::make("secret"),
            'remember_token' => Str::random(10),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);

        // Dar todos los permisos al super-usuario definido en el fichero .env
        /** @var User $superUser */
        $superUser = User::where( 'email', '=', $superUsuario_email )->first();
        if ( $superUser ) {
            $superUser->givePermissionTo(
                TipoPermiso::ASIGNAR_PERMISOS_GLOBALES,
                tipoPermiso::ADMINISTRAR_USERS,
                tipoPermiso::VER_ADMINISTRACION,
                tipoPermiso::SERVICIOS_EDITAR_TODOS
            );
        };

        // Y ahora creamos otros cuantos usuarios más
        factory( User::class, 5 )->create();
    }
}
```

### Ejemplo de Policy

A continuación se muestra un ejemplo de una policy en la que se utiliza el paquete de 
Spatie Laravel-Permission. Es muy importante entender que el usuario podrá tener los permisos
que se chequean **bien porque se le han asignado de forma directa, o bien porque lo tiene gracias
a sus roles**. Lo adecuado es que el usuario obtenga los permisos gracias a los roles a los que
pertenece.

```php
<?php
namespace App\Policies;
use Illuminate\Auth\Access\HandlesAuthorization;
use App\Models\User;
use App\Models\Cuenta;
use App\Models\TipoPermiso;

class CuentaPolicy
{
    use HandlesAuthorization;

    /**
     * Create a new policy instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Esta habilidad permite visualizar una cuenta, es decir, ver
     * sus asientos
     *
     * @param User $user
     * @param Cuenta $cuenta
     * @return bool
     * @throws \Exception
     **/
    public function view(User $user, Cuenta $cuenta)
    {
        if ( $user->id == $cuenta->user_id ) { return true; }

        if ( $user->hasAnyPermission([
            TipoPermiso::CUENTAS_VER_TODAS,
            TipoPermiso::CUENTAS_EDITAR_TODAS,
            TipoPermiso::CUENTA_SHOW . strval( $cuenta->id ),
            TipoPermiso::CUENTA_EDIT_ASIENTOS . strval( $cuenta->id ),
        ]))
        { return true; }
        
        return false; // No se cumple ninguna de las condiciones anteriores
    }

    /**
     * Esta habilidad permite editar una cuenta es decir, insertar asientos,
     * eliminarlos o modificarlos.
     *
     * @param User $user
     * @param Cuenta $cuenta
     * @return bool
     * @throws \Exception
     */
    public function update(User $user, Cuenta $cuenta)
    {
        if ( $user->id == $cuenta->user_id ) { return true; }
        if ( $user->hasPermissionTo( TipoPermiso::CUENTAS_EDITAR_TODAS )){ return true; }
        
        return false;  // No se cumple ninguna de las condiciones anteriores
    }
}
```

