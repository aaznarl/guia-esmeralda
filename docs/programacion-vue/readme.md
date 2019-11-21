# Programación en Vue

Referencias básicas:

- [Vue home page](https://vuejs.org/)

Índice

[[TOC]]


## Ejemplo: Página Listado simple de algo

Para crear una página básica hay que crear una carpeta y meter dentro 3 ficheros:

- El fichero "index" es muy sencillo, pero sirve para facilitar la importanción del componente
- El fichero "queries.js" permite guardar aisladas las consultas GraphQL
- El fichero "PaginaTareas.js" tiene el componente Vue de la lista de tareas (ejemplo que cogemos para este caso). 

Un ejemplo del fichero _index.js_:

```javascript
import MisCuentas from './MisCuentas';
export default MisCuentas;
```

```js
import gql from 'graphql-tag'


/**********************************
 * READ misCuentas
 **********************************/

export const GET_misCuentas = gql`
    query misCuentas {
        misCuentas {
            id
            nombre
            descripcion
            orden
            activa
            claseCSS
        }
    }`;
```

Y por último, el componente Vue completo de la página:

```js
<template>
    <div class="container mb-5"  style="min-height: 90vh;">

        <Breadcrumbs v-bind:lista-breadcrumbs="breadcrumbs"></Breadcrumbs>
        
        <div class="d-flex justify-content-between flex-wrap">
            <CabeceraPagina titulo="Mis cuentas"
                            md-descripcion="Listado con todas las cuentas abiertas"
            ></CabeceraPagina>
            
            <div class="text-right">
                <button type="button"
                        class="btn btn-outline-primary btn-sm"
                        style="white-space: nowrap;"
                        v-on:click=""
                >Nueva cuenta</button>
            </div>
        </div>
        
        <div v-if="this.$apollo.queries.misCuentas.loading" class="mt-5">
            Cargando la lista de cuentas
            <img :src="assetCliente('img/loading160x20-12bbad.gif')" alt="Cargando la lista de cuentas" />
        </div>


        <div v-if=" ! hayCuentas && ! this.$apollo.queries.misCuentas.loading" style="min-height: 90vh;" >
            <div class="p-3 mb-2 bg-info text-success">
                <strong>Usted no tiene ninguna cuenta abierta</strong>
            </div>
        </div>
        
        <div v-if="hayCuentas">
            <ListaCuentas v-bind:cuentas="misCuentas"></ListaCuentas>
        </div>
        
    </div>
</template>


<script>
    import CabeceraPagina from '../../components/CabeceraPagina';
    import Breadcrumbs from '../../components/Breadcrumbs';
    import FormularioInputTexto from '../../components/FormularioInputTexto';
    import ListaCuentas from '../../components/ListaCuentas';
    import { GET_misCuentas } from './queries';

    export default {
        name: 'MisCuentas',
        components: {
            CabeceraPagina,
            FormularioInputTexto,
            ListaCuentas,
            Breadcrumbs
        },
        apollo: {
            misCuentas: function () {
                return {
                    query: GET_misCuentas,
                    variables: {},
                    fetchPolicy: 'cache-and-network',
                    error (error) {
                        this.ajaxMisCuentas.mensajeError = 'Error al cargar la lista de cuentas';
                        this.gestionarErroresGraphQL( error ); 
                    }
                }
            }
        },
        data () {
            return {
                misCuentas: [],
                listaBreadcrumbs: [],

                ajaxMisCuentas: {
                    mensajeError: ''
                },
            }
        },
        validations() {
        },
        methods: {
        },
        computed: {
            hayCuentas: function ()
            {
                return this.misCuentas.length > 0;
            },
            breadcrumbs: function ()
            {
                return [
                    { texto: "Mis cuentas",          componente: 'MisCuentas',      parametros: undefined }
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




## Ejemplo: Página Listado de tareas con filtrado y doble query

Ejemplo del fichero _queries.js_:

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

Y por último, el componente Vue completo de la página:

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


## Guardar en LocalStorage

Supongamos que tenemos una lista de escenarios, que se cargan con Apollo, y queremos que el navegador
recuerde cuáles eran los escenarios que el usuario tenía seleccionados la última vez.

Primero hay que hacer que al cargar la página, se carguen los escenarios almacenados en LocalStorage:

```js
data () {
    return {
        LS_ESCENARIOS_SELECCIONADOS: "Lares2.arrayEscenariosSeleccionados",
        escenarios: [],
    }
},
apollo: {
  misEscenarios: function() {
    return {
      query: GET_misEscenarios,
        result(ApolloQueryResult)
        {
          if ( ApolloQueryResult.data ) {
            this.escenarios = this.seleccionarEscenariosSegunLocalStorage( ApolloQueryResult.data.misEscenarios );
          }
}}}},
methods: {  
    /**
     * En el LocalStorage se guarda algo así:  
     *     ["1", "4"]     
     * Estarían seleccionados los escenarios con ID 1 y 4
     */
    seleccionarEscenariosSegunLocalStorage: function ( escenarios )
    {
        let lsEscenariosSeleccionados = (typeof(Storage) === "undefined"  || ! Array.isArray(escenarios) )
            ? "[]"
            : localStorage.getItem( this.LS_ESCENARIOS_SELECCIONADOS );
        let arrayEscenariosSeleccionados = (lsEscenariosSeleccionados === null)
            ? []
            : JSON.parse( lsEscenariosSeleccionados );
        let escenariosADevolver = [];

        for (let i = 0; i < escenarios.length; i++)
        {
            let estabaSeleccionado = (arrayEscenariosSeleccionados.indexOf(escenarios[i].id) !== -1);
            let escenarioQueToca = {
                id: escenarios[i].id,
                nombre: escenarios[i].nombre,
                descripcion: escenarios[i].descripcion,
                seleccionado: estabaSeleccionado
            };
            escenariosADevolver.push( escenarioQueToca );
        }

        return escenariosADevolver;
    }
}
```

En segundo lugar, cada vez que el usuario haga click sobre un escenario, hay que guardar esa decisión
en el LocalStorage. Supongamos que utilizamos otro componente ListaEscenarios sólo para renderizar los
escenarios en la pantalla, pero que no tiene nada de lógica: 

```html
<ListaEscenarios
        v-bind:escenarios="escenarios"
        class="ml-2"
        v-on:change="cambiarEstadoEscenarioYGuardarEnLocalStorage"
></ListaEscenarios>

```

Nuestro componente debería definir esa función **cambiarEstadoEscenarioYGuardarEnLocalStorage**:

```js
methods: {  
    cambiarEstadoEscenarioYGuardarEnLocalStorage( objCambio )
    {
        this.cambiarEstadoEscenario( objCambio );
        this.actualizarEstadoEscenarioEnLocalStorage( objCambio.idEscenario, objCambio.nuevoValor );
    },
    
    /**
     * Se pone o se quita el escenario como "seleccionado", en this.escenarios
     * 
     * El objeto que se le pasa como cambio tiene esta pinta:
     *    {
     *        idEscenario: 3,
     *        nuevoValor: true
     *    }
     * @param objCambio
     */
    cambiarEstadoEscenario: function ( objCambio )
    {
        if ( ! this.escenarios ) return;
        let i = this.escenarios.findIndex( escenario => escenario.id === objCambio.idEscenario );             

        // Quizás ya tiene el valor que habría que ponerle, por lo que no hay que hacer nada:
        if ( Boolean( this.escenarios[i].seleccionado) === objCambio.nuevoValor ) return;
        
        // Procedemos a realizar el cambio
        let nuevoEscenario = {
            id: this.escenarios[i].id,
            nombre: this.escenarios[i].nombre,
            descripcion: this.escenarios[i].descripcion,
            seleccionado: objCambio.nuevoValor
        };
        Vue.set( this.escenarios, i, nuevoEscenario );
    },
    
    /**
     * @param idEscenario            // id del escenario
     * @param seleccionado           // boolean. Es true si hay que guardarlo seleccionado, es decir, que aparezca en el array
     */        
    actualizarEstadoEscenarioEnLocalStorage: function( idEscenario, seleccionado )
    {            
        if (typeof(Storage) === "undefined") { return; }

        let lsEscenariosSeleccionados = localStorage.getItem( this.LS_ESCENARIOS_SELECCIONADOS );
        let arrayEscenariosSeleccionados = (lsEscenariosSeleccionados === null)
            ? []
            : JSON.parse( lsEscenariosSeleccionados );
        
        if ( ! Array.isArray( arrayEscenariosSeleccionados )) { arrayEscenariosSeleccionados = []; } 
        let estabaSeleccionado = arrayEscenariosSeleccionados.indexOf(idEscenario) !== -1;
        
        if ( estabaSeleccionado  && !seleccionado ) {
            // Hay que sacarlo, dado que se ha quitado
            arrayEscenariosSeleccionados = arrayEscenariosSeleccionados.filter( (id) => id !== idEscenario );
            this.guardarEnLocalStorage( this.LS_ESCENARIOS_SELECCIONADOS, arrayEscenariosSeleccionados );
        }
        else if ( !estabaSeleccionado && seleccionado ) {
            arrayEscenariosSeleccionados.push( idEscenario );
            this.guardarEnLocalStorage( this.LS_ESCENARIOS_SELECCIONADOS, arrayEscenariosSeleccionados );
        }            
    },
    
    /**
     * Guardar en LocalStorage, si es que está disponible y el valor no es null
     * @param key
     * @param valor
     */
    guardarEnLocalStorage: function( key, valor )
    {
        if (typeof(Storage) === "undefined") { return; }

        if ( ! valor )
        {
            localStorage.removeItem( key );
            return;
        }

        let stringValor = typeof valor === 'string' ? valor : JSON.stringify( valor ); 
        localStorage.setItem( key, stringValor );
    }
    
}
```

## Resaltado de texto búsqueda (highlighting)

Para poder resaltar el texto que se ha encontrado tras una búsqueda, lo primero que hay que hacer
es definir una clase CSS para aplicar a los partes encontradas:

```css
.highlight
{
    background-color: #fffdd9;
}
```

El resaltado de aplicará utilizando una función sencilla, definida como **method** en el componente Vue.
Para poder utilizarla en varios componentes, lo adecuado es meterla en un **Mixin** de Vue (por ejemplo
MixinUtiles.js). Esta es la función:

```js
export default
{
    methods:
    {
        /**
         * Devuelve el código html del texto highlightead. 
         * La "aguja" es el texto que se busca
         * @param texto
         * @param aguja
         * @returns string
         */
        highlight: function( texto, aguja )
        {
            if ( ! texto || ! aguja ) { return texto; }
            let agujas = aguja.trim().split( " " );
            let stringRexexp = agujas.reduce( 
                (acumulado, actual) => !actual 
                    ? '' 
                    : ( acumulado.length > 0 ? acumulado + '|' + actual : actual ), ''
             );

            return texto.replace(
                new RegExp( stringRexexp, 'gi' ),
                function (match)
                {
                    return "<span class='highlight'>" + match + "</span>";
                }
            );
        }
    }
}    
```

De esta forma, al mostrar cualquier campo en el que se quiera resaltar el texto de búsqueda, simplemente
hay que pasarlo por la función ```highlight```:

```vue
<span v-html="highlight( textoOriginal, textoQueHayQueResaltar )"></span>

Ejemplo, si queremos meter el resaltado en el campo nombre, para que se resalte "antoni":
<span v-html="highlight( nombre, 'antoni' )"></span>
```

Como observación indicar que si el uusario busca varias palabras, se separan para resaltar cada una
por separado en el texto.


## Mover el foco a un elemento de la página

Supongamos que queremos poner el foco de la página en un elemento HTML concreto, por ejemplo, en una fila concreta de una
tabla muy larga. Esta tabla se carga dinámicamente en base a una variable Vue del "Data". Lo primero es renderizar las 
filas atendiendo a 3 detalles:

- Definir el atributo **tabindex**, porque al tener esa propiedad, ese elemento html ya será "focusable", es decir, ya pueden recibir el foco.
- Definir el atributo **id**, para poder encontrarlo después con la función nativa de javascript ```document.getElementById```. 
- Muy recomendable definir una clase CSS dinámica, para remarcar de alguna forma la fila seleccionada.

Veamos estos 3 detalles en el siguiente ejemplo:

```vue
<tr v-for="(asiento, index) in asientos"
    v-bind:class="classFila( asiento )"
    v-bind:id="'asiento' + asiento.id"
    v-bind:tabindex="1000 + index">

<td>...</td>
<td>...</td>
</tr>
 ```

En el componente Vue es necesario crear los 2 methods de apoyo, y después utilizar el evento "**updated**"
de Vue, que será llamado cada vez que se renderice el componente:

```javascript
methods: 
{
    classFila: function( asiento )
    {
        return {
            seleccionado: asiento.id == this.seleccionarAsientoConId
        };
    },

    ponerElFocoEnAsientoSeleccionado: function()
    {
        if ( this.seleccionarAsientoConId ) {
            let filaEnLaQuePonerElFoco = 
                document.getElementById("asiento" + this.seleccionarAsientoConId);
            if ( filaEnLaQuePonerElFoco ) { filaEnLaQuePonerElFoco.focus(); }
        }
    }

},
updated: function () 
{
    // Tenemos que poner el foco en el asiento que está marcado.
    // Hacemos uso de la función "updated", explicado aquí: 
    // https://vuejs.org/v2/api/#updated
    this.$nextTick(function () {
        this.ponerElFocoEnAsientoSeleccionado();
    })
}
```

## Migas de pan

Para construir las migas de pan de una página existen múltiples soluciones y paquetes de Vue. La mayoría
de estas soluciones están integradas en el *vue-router*, suponiendo cierto acoplamiento entre las migas
y las rutas de vue, e incorporando algunas restricciones.

Con el objetivo de alcanzar un **acoplamiento nulo**, alcanzar una **flexibilidad máxima** en las migas, y considerando
que las migas de pan suponen un desarrollo muy reducido, se propone una **solución a medida**, directa,
y que permite cualquier virguería y personalización. 

Es importante destacar que unas buenas migas de pan no son genéricas, sino que están personalizadas
al contenido de la página que se está mostrando. Véanse estos ejemplos sobre una aplicación llamada "Saturno":

::: warning Ejemplo migas genéricas no deseables
Saturno > Procedimiento > expediente > editar trámite 
:::

::: tip Ejemplo bueno
Saturno > [Becas guardería](#) > [BECA/0234/19](#) > editar [Propuesta de resolución 23/9/2019](#)
:::

Las migas se definen totalmente a medida en una función *computed* en cada componente de tipo página. Ejemplo:

```html
<template>        
    <Breadcrumbs v-bind:lista-breadcrumbs="migas"></Breadcrumbs>
    
    <h1>Editar servicio</h1>
    ...
</template>
<script>
import Breadcrumbs from '../../components/Breadcrumbs';
export default {
    name: "EditarServicio",
    components: { Breadcrumbs },
    data () 
    {
        return {
            servicioById: null
        }
    },
    apollo: {
        servicioById: function () { ... }
    },
    computed: 
    {
        migas: function ()
        {
            let nombreServicio = this.servicioById ? this.servicioById.nombre : '';

            return [
                { texto: "Mis servicios",                       
                  componente: 'MisServicios',   parametros: undefined 
                },
                { texto: "Editar Servicio " + nombreServicio,   
                  componente: 'EditarServicio', parametros: {id: this.id ? this.id : 0} 
                }
            ]
        }
    }
    
}
</script>
```

Por supuesto es necesario tener un componente genérico para pintar las migas de pan. Éste sería un 
ejemplo hecho con bootstrap:

```html
<template>
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb pl-0">
            <li class="breadcrumb-item">
                <a v-bind:href="urlHome">Lares</a>
            </li>
            <li v-for="(breadcrumb, idx) in listaBreadcrumbs"
                :key="idx"
                v-bind:class="{'breadcrumb-item': true, 'active': (idx === iUltimo)}"
                v-bind:aria-current=" idx === iUltimo ? 'page' : ''">
                <router-link
                        v-if="breadcrumb.componente && idx !== iUltimo"
                        :to="{ name: breadcrumb.componente, params: breadcrumb.parametros }"
                        v-text="breadcrumb.texto"
                ></router-link>

                <a v-if="!breadcrumb.componente && breadcrumb.url && idx !== iUltimo"
                   v-bind:href="breadcrumb.url"
                   v-text="breadcrumb.texto"
                ></a>

                <a v-if="idx === iUltimo"
                   href="#"
                   v-text="breadcrumb.texto"
                   aria-current="page"
                   class="breadcrumb-item active"
                ></a>
            </li>
        </ol>
    </nav>
</template>


<script>
    export default {
        name: "Breadcrumbs",
        components: {},
        props: {
            listaBreadcrumbs: {
                /* Array de objetos con 3 campos: texto, componente ó url, parametros */
                type: Array,  
                required: true
            }
        },
        data () {
            return {}
        },
        methods: {},
        computed: {
            iUltimo: function () {
                return this.listaBreadcrumbs.length - 1;
            },
            urlHome: function () {
                return document.getElementById("url").getAttribute("content");
            }
        }
    }
</script>
```





