# GraphQL en Laravel

El paquete elegido para implementar un _endpoint_ de GraphQL con Laravel es **nuwave/lighthouse**. Referencias:

- [lighthouse-php.com/](https://lighthouse-php.com/) - Página principal con la documentación
- [nuwave/lighthouse en github](https://github.com/nuwave/lighthouse)

Tabla de contenidos:

[[TOC]]


## Ejemplo Resolver: findById

Lo primero sería añadir el nodo en el esquema del árbol graphQL:

```graphql tareas.graphql
type Tarea 
{
    id: ID!
    titulo: String!
    descripcion: String
    
    prioridad: Int
    segundosEstimados: Int
    cerrada: Boolean!
    
    fechaInicio: DateTime
    fechaFin: DateTime
    
    user_id: ID!

    created_at: DateTime!
    updated_at: DateTime!
    deleted_at: DateTime
}

extend type Query 
{
    tareaById(id: ID! @eq): Tarea
    @field(resolver: "App\\Http\\GraphQL\\Queries\\TareaQuery@tareaById")

}
```

Y después hay que implementar el resolver. Este es el ejemplo típico de un resolver que se utiliza para obtener un objeto (model) únicamente
por su _id_:

```php TareaQuery.php
    /**
     * Tarea: findById
     *
     * @param $parent
     * @param array $args
     * @param $context
     * @param $info
     * @return Tarea
     * @throws AuthenticationException
     * @throws AuthorizationException
     */
    public function tareaById($parent, array $args, $context, $info)
    {
        // Autenticación
        if ( ! auth()->check()) throw new AuthenticationException('Es necesario estar identificado para consultar esta tarea');

        /** @var User $usuario */
        $usuario = auth()->user();

        /** @var Tarea $tarea */
        $tarea = Tarea::where('id', intval($args['id'])  )->first();

        // Autorización
        if ( $usuario->cant('view', $tarea)) throw new AuthorizationException('No tiene permisos para ver esta tarea');

        return $tarea;
    }

```` 


 ## Ejemplo Mutation create
 
 Primero, habría que ampliar el esquema graphQL:
 
 ```graphql
 extend type Mutation
{
    createTarea (
        titulo: String!,
        descripcion: String
        prioridad: Int,
        atomica: Boolean,
        fechaInicio: DateTime,
        fechaFin: DateTime
    ): Tarea
    @field(resolver: "App\\Http\\GraphQL\\Mutations\\TareaMutation@create")
}
````

Y este sería un ejemplo del resolver:

```php

```



