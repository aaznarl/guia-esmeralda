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
:::

::: warning Ejemplos correctos de nombres de roles
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


