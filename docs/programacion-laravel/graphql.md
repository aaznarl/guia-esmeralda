# GraphQL en Laravel

El paquete elegido para implementar un _endpoint_ de GraphQL con Laravel es **nuwave/lighthouse**. Referencias:

- [lighthouse-php.com/](https://lighthouse-php.com/) - Página principal con la documentación
- [nuwave/lighthouse en github](https://github.com/nuwave/lighthouse)

Tabla de contenidos:

[[TOC]]


## Scalar types

La lista de puede consultar en la [lista oficial](https://graphql.org/learn/schema/#scalar-types):

- Int (signed 32‐bit integer)
- Float (signed double-precision)
- String (UTF‐8 character sequence)
- Boolean
- ID


## Definir el esquema GraphQL

Dado un modelo, lo primero es definir el esquema GraphQL de ese modelo,
es decir, definir qué se va a exponer a través de la API. Lo mejor es tenerlo separado
en un fichero aparte, e incluirlo desde el fichero general "schema.graphql":

```graphql
#import ./users.graphql
```

Y este sería el fichero conde se define el tipo "User" y se definen Queries y Mutations
para el mismo:

```graphql
type User {
    id: ID!
    name: String!
    email: String
    samaccountname: String
    userprincipalname: String
    distinguishedname: String
    roles: [Rol] @method(name: "getRoles")
    grupos: [String]
    fechaInicioCache: String
    fechaFinCache: String
    tiempoExpiracionCache: String
    persona_id: ID
    persona: Persona @belongsTo
    etiquetas: [Etiqueta] @hasMany

    canViewTelescope: Boolean!
    canViewPageAdmin: Boolean!
    canViewButtomCreate: Boolean!
    canViewButtomEdit: Boolean!
    canViewButtomDelete: Boolean!
    
    created_at: DateTime!
    updated_at: DateTime!
    deleted_at: DateTime
}

extend type Query {
    me: User @auth
    quienSoy: String @field(resolver: "App\\Http\\GraphQL\\Queries\\UserQuery@quienSoy")
    usuarios: [User] @all
}

extend type Mutation {
   login(username: String!, password: String!): User @field(resolver: "App\\Http\\GraphQL\\Mutations\\UserMutator@login")
   refreshLdapUser: Boolean @field(resolver: "App\\Http\\GraphQL\\Mutations\\UserMutator@refreshLdapUser")
   refreshLdap: Boolean @field(resolver: "App\\Http\\GraphQL\\Mutations\\UserMutator@refreshLdap")
   generateERD: Boolean @field(resolver: "App\\Http\\GraphQL\\Mutations\\UserMutator@generateERD")
}
``` 




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
        if ( ! auth()->check()) { throw new AuthenticationException('Es necesario estar identificado para consultar esta tarea'); }

        /** @var User $usuario */
        $usuario = auth()->user();

        /** @var Tarea $tarea */
        $tarea = Tarea::where('id', intval($args['id'])  )->first();

        // Autorización
        if ( $usuario->cant('view', $tarea)) { throw new AuthorizationException('No tiene permisos para ver esta tarea'); }

        return $tarea;
    }

```` 

## Ejemplo Resolver: lista de modelos

```php
    /**
     * Devuelve las tareas abiertas que tiene este usuario
     *
     * @param $parent
     * @param array $args
     * @param $context
     * @param $info
     * @return Collection
     * @throws AuthenticationException
     */
    public function misTareas($parent, array $args, $context, $info)
    {
        // Chequeo de la Autenticación
        if ( ! auth()->check() ) { throw new AuthenticationException('Es necesario estar identificado para consultar Mis tareas'); }

        /** @var User $usuario */
        $usuario = auth()->user();
        
        return $usuario->tareas()
            ->where('cerrada', '=', 0)
            ->where(function ($query) {
                $query->whereNull('ocultarFecha')
                      ->orWhere('ocultarFecha', '<', Carbon::now() );                
            })
            ->get();
    }
```



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
    /**
     * Coger como ejemplo: https://lighthouse-php.netlify.com/docs/directives#bcrypt
     *
     * @param $parent
     * @param array $args
     * @param $context
     * @param $info
     * @return Tarea;
     * @throws AuthenticationException
     * @throws AuthorizationException
     * @throws ParseException
     * @throws \Exception
     */
    public function create($parent, array $args, $context, $info )
    {
        // Autenticación
        if ( ! auth()->check()) { throw new AuthenticationException('Es necesario estar identificado para crear una tarea'); }

        /** @var User $usuario */
        $usuario = auth()->user();

        // Autorización
        if ( $usuario->cant('create', Tarea::class ) ) { throw new AuthorizationException('No tiene permisos para crear una tarea'); }

        /** @var Tarea $tarea */
        $tarea = new Tarea([
            'titulo' => $args['titulo']
        ]);
        
        if ( array_key_exists('mdDescripcion', $args) ) $tarea->mdDescripcion = strval( $args['mdDescripcion'] );
        if ( array_key_exists('prioridad', $args) ) $tarea->prioridad = intval( $args['prioridad'] );
        if ( array_key_exists('cerrada', $args) ) $tarea->cerrada = boolval( $args['cerrada'] );
        if ( array_key_exists('fechaFin', $args) ) $tarea->fechaFin = $args['fechaFin'];
        
        if ( array_key_exists('objetivo_id', $args) ) $tarea->objetivo_id = intval( $args['objetivo_id'] );
        
        $usuario->tareas()->save( $tarea );

        // Actualizar los escenarios:
        if ( array_key_exists('escenarios_id', $args) ) {
            $escenarios_id_integers = array_map(function($e) { return intval($e); }, $args['escenarios_id']);
            $escenarios_id_integers = array_values( $escenarios_id_integers );
            $tarea->escenarios()->sync( $escenarios_id_integers ); // Ejemplo: [23,92,91,108]
        }
        
        return $tarea;
    }
```

## Ejemplo Mutation update
 
Para ampliar el esquema graphQL:
 
 ```graphql
     updateTarea (
        id: ID!,
        titulo: String,
        mdDescripcion: String
        prioridad: Int,
        cerrada: Boolean,
        fechaFin: DateTimeLocal,
        objetivo_id: ID,
        escenarios_id: [ID]
    ): Tarea
    @field(resolver: "App\\Http\\GraphQL\\Mutations\\TareaMutation@update")
```

Y este sería el código necesario para el "resolver" de la mutation:

```php
    /**
     * Update de los parámetros "normales"
     *
     * @param $parent
     * @param array $args
     * @param $context
     * @param $info
     * @return Tarea;
     * @throws AuthenticationException
     * @throws AuthorizationException
     * @throws ParseException
     */
    public function update($parent, array $args, $context, $info )
    {
        // Autenticación
        if ( ! auth()->check()) { throw new AuthenticationException('Es necesario estar identificado para modificar una tarea'); }

        /** @var User $usuario */
        $usuario = auth()->user();

        /** @var Tarea $tarea */
        $tarea = Tarea::where('id', intval($args['id']) )->first();
        if ( ! $tarea ) { throw new ParseException('No se ha encontrado la tarea que se pretende modificar'); }

        // Autorización
        if ( $usuario->cant('edit', $tarea )) { throw new AuthorizationException('No tiene permisos para modificar la tarea'); }

        $campos = [];
        if ( array_key_exists('titulo', $args) ) $campos['titulo'] = strval( $args['titulo'] );
        if ( array_key_exists('mdDescripcion', $args) ) $campos['mdDescripcion'] = strval( $args['mdDescripcion'] );
        if ( array_key_exists('prioridad', $args) ) $campos['prioridad'] = intval( $args['prioridad'] );
        if ( array_key_exists('cerrada', $args) ) $campos['cerrada'] = boolval( $args['cerrada'] );
        if ( array_key_exists('fechaFin', $args) ) $campos['fechaFin'] = $args['fechaFin'];
        if ( array_key_exists('objetivo_id', $args) ) $campos['objetivo_id'] = intval( $args['objetivo_id'] );
        
        $tarea->update( $campos );        
        
        // Actualizar los escenarios:
        if ( array_key_exists('escenarios_id', $args) ) {
            $escenarios_id_integers = array_map(function($e) { return intval($e); }, $args['escenarios_id']);
            $escenarios_id_integers = array_values( $escenarios_id_integers );
            $tarea->escenarios()->sync( $escenarios_id_integers ); // Ejemplo: [23,92,91,108]
        }
        
        return $tarea;
    }
```

## Ejemplo Mutation delete
 
Para ampliar el esquema graphQL:
 
 ```graphql
     deleteTarea (
        id: ID!
    ): Boolean!
    @field(resolver: "App\\Http\\GraphQL\\Mutations\\TareaMutation@delete")
```

Y este es el "resolver" de la mutation delete:

```php
    /**
     * Eliminar la tarea (softDelete)
     *
     * @param $parent
     * @param array $args
     * @param $context
     * @param $info
     * @return Bool;
     * @throws AuthenticationException
     * @throws AuthorizationException
     * @throws ParseException
     */
    public function delete($parent, array $args, $context, $info )
    {
        // Autenticación
        if ( ! auth()->check()) { throw new AuthenticationException('Es necesario estar identificado para eliminar una tarea'); }

        /** @var User $usuario */
        $usuario = auth()->user();

        /** @var Tarea $tarea */
        $tarea = Tarea::where('id', intval($args['id']) )->first();
        if ( ! $tarea ) { throw new ParseException('No se ha encontrado la tarea que se pretende eliminar'); }

        // Autorización
        if ( $usuario->cant('destroy', $tarea )) { throw new AuthorizationException('No tiene permisos para eliminar la tarea'); }

        $tarea->delete();
        return true;
    }
```


## Función de apoyo establecerEscenarios

Esta es la función de apoyo que se ha utilizado en las mutations _create_ y _update_. Está ubicada
en el modelo "Tarea" (Tarea.php):

```php
    /**
     * Coloca en esta tarea los escenarios que se especifican. 
     * El parámetro de entrada es un array de IDs de escenarios. Ejemplo: [23,92,91,108]
     * 
     * @param array $escenarios_id
     */
    public function establecerEscenarios(array $escenarios_id)
    {
        $escenarios_actuales_id_integers = $this
            ->escenarios
            ->map( function($escenario, $key) { return intval($escenario->id); } )
            ->toArray();
        $escenarios_actuales_id_integers = array_values( $escenarios_actuales_id_integers );

        // Vamos a analizar los que hay ahora, para sacar los que no deban estar
        for ($i = 0, $num = count($escenarios_actuales_id_integers); $i < $num; $i++) 
        {
            if ( ! in_array( $escenarios_actuales_id_integers[$i], $escenarios_id )) {
                DB::delete('delete from escenarios_tareas where "escenario_id" = ? and "tarea_id" = ? ',
                    [$escenarios_actuales_id_integers[$i], $this->id ]);
                //array_push($escenarios_tocados, $escenarios_actuales_id_integers[$i]);
            }
        }

        // Ahora meter los que faltan
        for ($i = 0, $num = count($escenarios_id); $i < $num; $i++) {
            if ( ! in_array($escenarios_id[$i], $escenarios_actuales_id_integers) ) {
                DB::insert('insert into escenarios_tareas (escenario_id, tarea_id) values (?, ?) ',
                    [$escenarios_id[$i], $this->id]);
                //array_push($escenarios_tocados, $escenarios_id[$i]);
            }
        }
    }
```



