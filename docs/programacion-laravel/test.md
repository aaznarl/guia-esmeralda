# Test en Laravel

[[TOC]]

Referencias básicas:

- [The perfect unit test](https://javascriptplayground.com/the-perfect-javascript-unit-test/)

## Test a implementar sobre un modelo

Dado un *Model* de Laravel, se hace muy recomendable implementar los siguientes test:

- Testear que funcionan todas sus relaciones
- Testear que funcionan sus queries GraphQL
- Testear que funcionan cada una de sus Mutations
- Testear que funcionan cada una de las funciones de su Policy
- Testear que funciona la indexación con Elasticsearch y la búsqueda



## Ejemplo: Tests de funcionamiento básico de la aplicación

Ejemplo de tests de tipo _Feature_:

```php
<?php
namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Artisan;

class NavegacionBasicaTest extends TestCase
{
    use RefreshDatabase;

    /** @var User */
    protected $usuario;

    public function setUp()
    {
        parent::setUp();
        
        // Shows errors/stacktraces from your app in phpunit, without rendering a "shoops page"
        $this->withoutExceptionHandling();

        Artisan::call( 'db:seed', ['--class' => 'RolesSeeder', '--force' => true ]);

        // Crear el usuario para acceder a todas las páginas que requieren autenticación
        $this->usuario = factory( User::class )->create();
    }


    /**
     * Verificar que la connection es "sqlite-testing"
     */
    public function testEntornoyBD()
    {
        self::assertEquals( 'testing', App::environment());
    }

    public function testPaginaPrincipal()
    {
        $this->from('/url-de-origen-desde-la-que-se-accede');  // para que funcione por ejemplo: return back();
        $response = $this->actingAs( $this->usuario )->get( route('home') );

        $response
            ->assertSuccessful()
            ->assertSeeText('Mis Contactos');
    }

    /**
     * Verificar que al llamar a la ruta que envía un email de prueba, se envía.
     * Documentación de Fake Mail: https://laravel.com/docs/5.5/mocking#mail-fake
     */
    function testEnvioEmailDePrueba()
    {
        Mail::fake();

        $response = $this->actingAs( $this->usuario )->get(route('pruebas.email') );

        Mail::assertSent( App\Mail\PruebaMail::class );
        $response
            ->assertSuccessful()
            ->assertSeeText('Email de prueba enviado correctamente');
    }

    /**
     * Este test verifica que cuando se produce una excepción, se crea una notificación a los usuarios que tienen
     * el rol "Receptor de errores"
     *
     * @link https://laravel.com/docs/5.5/mocking#notification-fake
     */
    function testAlProducirUnErrorDeServidorSeNotifica()
    {
        Mail::fake();
        Notification::fake();

        $this->usuario->asignarRol( 'Receptor de errores' );

        $response = $this->actingAs( $this->usuario )->get(route('pruebas.error'));

        Notification::assertSentTo( $this->usuario,  App\Notifications\ErrorServidorNotification::class );

        $response
            ->assertStatus( 500 )
            ->assertSeeText('Está cascando porque así lo has pedido');
    }


}
```


## Ejemplo: Test de llamada a GraphQL

Ejemplo de como implementar un test que llama al motor de GraphQL para verificar
que una consulta graphql funciona.

Artículo de referencia: [Testing GrapqhQL with Laravel](https://medium.com/@olivernybroe/testing-graphql-with-laravel-4d6201b40f68)

```php
<?php

namespace Tests\Feature;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;

class ModelCuentaTest extends TestCase
{
    use RefreshDatabase;
    use WithoutMiddleware;

    /**
     * Realiza una llamada a motor de GraphQL para obtener una cuenta por ID.
     * @return void
     * @throws \Exception
     */
    public function testLlamadaAGraphQLPorId()
    {
        /** @var User $usuario */
        $usuario = factory( User::class )->create();

        /** @var Banco $banco */
        $banco = factory( Banco::class )->create();

        /** @var Cuenta $cuenta */
        $cuenta = factory( Cuenta::class )->make();
        $cuenta = $banco->cuentas()->save( $cuenta );   // Hay que hacer esto para exista $cuenta->id
        $id = $cuenta->id;
        $usuario->asignarRol(TipoRol::ID_TITULAR_CUENTA, $cuenta);
        $cuenta->refresh();       // Cargar desde BD porque así se rellenan los valores por defecto
        
        $asiento = $cuenta->asientos()->save( factory( Asiento::class )->make() );

        $query = <<<FINQUERY
            {
                cuentaById(id: $id) 
                {
                    id
                    nombre
                    numero
                    monedaSimbolo
                    asientos 
                    {
                        id
                        fecha
                        importe
                        concepto
                    }
                    banco 
                    {
                        nombre
                    },
                    titulares 
                    {
                        name
                    }
                }
            }
FINQUERY;
        $this->be( $usuario );
        $response = \App\Helpers\graphql($this, $query);
        
        $this->assertEquals( $cuenta->id, $response->json("data.cuentaById.id") );
        $this->assertEquals( $cuenta->nombre, $response->json("data.cuentaById.nombre") );
        $this->assertEquals( $cuenta->monedaSimbolo, $response->json("data.cuentaById.monedaSimbolo") );

        $this->assertEquals( $cuenta->asientos->first()->concepto, $response->json("data.cuentaById.asientos.0.concepto") );
        $this->assertEquals( $cuenta->asientos->first()->importe, $response->json("data.cuentaById.asientos.0.importe") );
        
        $this->assertEquals( $banco->nombre, $response->json("data.cuentaById.banco.nombre") );
        $this->assertEquals( $usuario->name, $response->json("data.cuentaById.titulares.0.name") );
    }
}
```

Y aquí está la función helper que se ha utilizado para hacer la llamada GraphQL:

```php
<?php
namespace App\Helpers;
use Tests\TestCase;

/**
 * Función Helper para facilitar las llamadas a GraphQL. Realiza una llamada al servidor GraphQL de la 
 * aplicación proporcionando el string de la "query"
 * 
 * @param TestCase $test
 * @param string $query
 * @return \Illuminate\Foundation\Testing\TestResponse
 */
function graphql(TestCase $test, string $query)
{
    return $test->post(
        '/' . config('lighthouse.route_name'), 
            [
                'query' => $query
            ]
    );
}
```


