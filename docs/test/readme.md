# Test

Referencias básicas:

- [The perfect unit test](https://javascriptplayground.com/the-perfect-javascript-unit-test/)


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
        $cuenta = Cuenta::find( $id );          // La cargo desde BD porque así se rellenan los valores por defecto
        
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


