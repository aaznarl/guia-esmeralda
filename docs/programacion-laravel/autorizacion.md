# Autorización (Gates, policies)

Referencias básicas:

- xxx


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
        if ($user->id == $tarea->user_id) return true;                  // La tarea es mía

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
        if ($user->id == $tarea->user_id) return true;                  // La tarea es mía

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
        if ($user->id == $tarea->user_id) return true;                  // La tarea es mía

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


