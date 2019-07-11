# Programación en Vue

Referencias básicas:

- [Vue home page](https://vuejs.org/)

Índice

[[TOC]]


## Ejemplo: Componente Página Listado de tareas

Para crear una página básica hay que crear una carpeta y meter dentro 3 ficheros:

- El fichero "index" es muy sencillo, pero sirve para facilitar la importanción del componente
- El fichero "queries.js" permite guardar aisladas las consultas GraphQL
- El fichero "PaginaTareas.js" tiene el componente Vue de la lista de tareas (ejemplo que cogemos para este caso). 

Un ejemplo del fichero _index.js_:

```js
import MisTareas from './MisTareas';
export default MisTareas;
```

Un ejemplo del fichero _queries.js_:

```js
import gql from 'graphql-tag'

/**********************************
 * READ misEscenarios
 **********************************/

export const GET_misEscenarios = gql`
    query misEscenarios {
        misEscenarios {
            id
            nombre
            descripcion
        }
    }`;


/**********************************
 * READ misTareas
 **********************************/

export const GET_misTareas = gql`
    query 
    {
        misTareas 
        {
            id
            titulo
            escenarios
            {
                id
            }
        }
    }
`;
```

Y por último, el coponente Vue completo:

```js
<template>
    <div class="container mb-5"  style="min-height: 90vh;">
        <Breadcrumbs v-bind:lista-breadcrumbs="breadcrumbs"></Breadcrumbs>
        
        <div class="d-flex justify-content-between flex-wrap">
            <CabeceraPagina titulo="Mis tareas"
                            md-descripcion="Listado con todas las tareas pendientes, que no han sido ocultadas hasta una fecha futura, y que se podrían realizar"
            ></CabeceraPagina>

            <div class="text-right">
                <button type="button"
                        class="btn btn-outline-primary btn-sm"
                        style="white-space: nowrap;"
                        v-on:click="botonAnadirTareaClick"
                >Nueva tarea</button>
                <br>
                <div class="mt-2">
                    <router-link :to="{ name: 'TodasTareasPendientes', params: {}}"
                                 title="Ver todas mis tareas pendientes"
                    >Todas pendientes</router-link>
                </div>
            </div>
        </div>
        
        <div v-if="this.$apollo.queries.misTareas.loading" class="mt-5">
            Cargando la lista de tareas
            <img :src="assetCliente('img/loading160x20-12bbad.gif')" alt="Cargando la lista de tareas pendientes" />
        </div>

        <div v-if=" ! hayTareas && ! this.$apollo.queries.misTareas.loading" style="min-height: 90vh;" >
            <div class="p-3 mb-2 bg-info text-success">
                <strong>Ninguna tarea pendiente</strong>
            </div>
        </div>

        <div v-if="hayTareas">
            <ListaTareas v-bind:tareas="misTareasVisibles"></ListaTareas>
        </div>
        
    </div>
</template>


<script>
    import CabeceraPagina from '../../components/CabeceraPagina';
    import Breadcrumbs from '../../components/Breadcrumbs';
    import ListaTareas from '../../components/ListaTareas';
    import { GET_misEscenarios, GET_misTareas } from './queries';

    export default {
        name: 'MisTareas',
        components: {
            CabeceraPagina,
            Breadcrumbs,
            ListaTareas
        },
        apollo: {
            misEscenarios: function()
            {
                return {
                    query: GET_misEscenarios,
                    result(ApolloQueryResult)
                    {
                        if ( ApolloQueryResult.data ) {
                            this.escenarios = ApolloQueryResult.data.misEscenarios;
                            this.ajaxMisEscenarios.mensajeError = '';
                        }
                    },
                    error (error) {
                        this.ajaxMisEscenarios.mensajeError = 'Error al cargar los escenarios';
                        this.gestionarErroresGraphQL( error );
                    }
                }
            },
            misTareas: function () {
                return {
                    query: GET_misTareas,
                    variables: {},
                    fetchPolicy: 'cache-and-network',
                    error (error) {
                        this.ajaxMisEscenarios.mensajeError = 'Error al cargar la lista de tareas';
                        this.gestionarErroresGraphQL( error ); 
                    }
                }
            }
        },
        data () {
            return {
                misTareas: [],
                escenarios: [],
                listaBreadcrumbs: [],

                ajaxMisEscenarios: {
                    mensajeError: ''
                },
                ajaxMisTareas: {
                    mensajeError: ''
                },
            }
        },
        validations() {
            return {};
        },
        methods: 
        {
            botonAnadirTareaClick()
            {
                Mousetrap.reset();
                this.$router.push({ name: 'EditarTarea', params: { id: 0 }});
                return false;  // para prevenir que si se está ejecutando esta función por Mousetrap, que la tecla 'a' siga
            },            
        },
        computed: 
        {
            misTareasVisibles: function()
            {
                let self = this;
                return this.misTareas
                    .filter( this.esPosibleHacerTarea )
                    .sort( (a,b) => self.segundosEstimadosRestantes(a) - self.segundosEstimadosRestantes(b) );
            },            
            hayTareas: function ()
            {
                return this.misTareasVisibles.length > 0;
            },
            breadcrumbs: function ()
            {
                return [
                    { texto: "Mis tareas",          componente: 'MisTareas',      parametros: undefined }
                ]
            }
        },
        
        watch: 
        {
            $route (to, from)
            {
                Mousetrap.reset();
            }

        },
        
        mounted() {
            Mousetrap.reset();
            Mousetrap.bind('a', this.botonAnadirTareaClick );
        }
    }
</script>

<style scoped>

    .campoTiempo
    {
        width: 8em;
    }
    
</style>
```



## Ejemplo de Componente Vue: Lista de tareas

Este sería un simple componente de ejemplo, que recibe la lista a pintar como
property:

```js
<template>
    <div>    
        <div v-if=" ! esPantallaMovil() " class="container"  >
            <table class="table">
                <thead>
                    <tr>
                        <th scope="col" class="align-top">
                            Tareas
                            <span class="text-info">({{ numTareas }})</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(tarea, index) in tareas">
                        <td v-bind:class="clasesCssCeldaTarea( index )">
                            <div>
                                <span v-text="tarea.titulo"></span>    
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    
    
        <table v-if=" esPantallaMovil() "   class="table table-striped mx-0 px-0">
            <thead>
            <tr>
                <th scope="col">
                    Tareas
                    <span class="text-info">({{ numTareas }})</span>
                </th>
            </tr>
            </thead>
            <tbody>
                <tr v-for="(tarea, index) in tareas">
                    <td>
                        <div class="mb-2">
                            <span v-text="tarea.titulo"></span>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

    </div>        
</template>

<script>
    export default {
        name: 'ListaTareas',
        components: {},
        data () 
        {
            return {
                iSeleccionada: null
            }
        },
        props: {
            tareas: {
                type: [Array],
                required: false
            }
        },
        methods: 
        {
            clasesCssCeldaTarea: function ( iTarea )
            {
                return {
                    'd-flex': true,
                    'justify-content-between': true,
                    'align-top': true,
                    'seleccionado': iTarea === this.iSeleccionada
                };
            },            
        },
        computed:
        {
        },
        watch:
        {
            $route (to, from)
            {
                Mousetrap.reset();
            }
        },
        mounted() 
        {
            Mousetrap.reset();
            Mousetrap.bind('up', this.seleccionarTareaAnterior );
            Mousetrap.bind('down', this.seleccionarTareaSiguiente );
            Mousetrap.bind('e', this.editarTareaSeleccionada );
            Mousetrap.bind('enter', this.ejecutarTareaSeleccionada );
        }

    }
</script>

<style scoped>
</style>
```


## Gestión de errores en Vue

Vue permite definir, tras crear el objeto Vue principal de la aplicación, una función a la que llamar
cuando se produzca un error:

```javascript app.js
Vue.config.errorHandler = (err, vm) => {
  manejarErrorVue(err, vm);
};
```

Esa función puede notificar a la aplicación de que se ha producido un error en cliente, para que
se registre adecuadamente en el sistema de log que tenga (BD, log, email, slack...):

```javascript
import gql from 'graphql-tag';

export function manejarErrores(err, vm) {
  const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  const newURL = `${window.location.protocol}//${window.location.host}/${window.location.pathname}`;
  let navegador = '';
  if ((navigator.userAgent.indexOf('Opera') || navigator.userAgent.indexOf('OPR')) !== -1) {
    navegador = 'Opera';
  } else if (navigator.userAgent.indexOf('Chrome') !== -1) {
    navegador = 'Chrome';
  } else if (navigator.userAgent.indexOf('Safari') !== -1) {
    navegador = 'Safari';
  } else if (navigator.userAgent.indexOf('Firefox') !== -1) {
    navegador = 'Firefox';
  } else if (navigator.userAgent.indexOf('MSIE') !== -1 || !!document.documentMode === true) {
    // IF IE > 10
    navegador = 'IE';
  } else {
    navegador = 'unknown';
  }
  vm.$apollo.query({
    query: gql`
        {
          enviarEmailErrorCliente(
            titulo:"${err.message.replace(/["']/g, '')}",
            trazas:"${err.stack
              .split('\n')
              .join('')
              .replace(/["']/g, '')}",
            navegador:"${navegador}",
            versionNavegador:"${navigator.appVersion}",
            viewport:"${`${w}x${h}`}",
            url:"${newURL}")
        }
      `
  });
}
```

La mutation que se realice en la parte back no debería hacer mucho más que lanzar
el error para que se gestione igual que el resto de errores de la aplicación:

```php
public function registrarErrorEnCliente($parent, array $args, $context, $info)
{
    Throw New ErrorEnClienteException( 
       $args['mensajeError'] . $args['navegador'] . $args['usuario'], 
       $args['traza']
    );
}
```






