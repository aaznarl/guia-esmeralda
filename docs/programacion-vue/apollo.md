# Librería Apollo

La librería javascript de [vue-apollo](https://github.com/Akryum/vue-apollo) se utiliza
para integrar las llamadas desde los componentes Vue a un servidor GraphQL.



## Debounce

La función _Debounce_ se utiliza para realizar muchas menos llamadas GraphQL al servidor en 
ciertos escenarios en los que no es necesario llamar tantas veces. Por ejemplo, si tenemos
una caja de texto "Buscar" donde el usuario escribe "berenjena" (9 letras), no tiene sentido
realizar una llamada al servidor por cada vez que el usuario pulsa una tecla (9 veces), sino
que es más adecuado esperar a que termine de escribir, y realizar una única llamada.

Por tanto, la función _Debounce_ lo que hace es "esperar a que llegue la calma", antes de llamar
al servidor. Si se establece un tiempo de debounce de 300 milisegundos, cada vez que el usuario
pulse una tecla esperará 300 ms por si el usuario vuelve a pulsar otra tecla más. El usuario
podría estar escribiendo un párrafo de 4 líneas, que hasta que no se pase 300 ms sin escribir
una tecla no se realizará una sóla llamada al servidor.

Para dotar a un componente Vue de la función **Debounce**, utilizaremos la librearía
[apollo-link-debounce](https://www.npmjs.com/package/apollo-link-debounce). En el fichero donde se
instancia Vue (normalmente _app.js_) ha de incluirse esta librería:

```js
import VueApollo from 'vue-apollo';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import ApolloDebounceLink from 'apollo-link-debounce';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const DEFAULT_DEBOUNCE_TIMEOUT = 300;

const httpLink = new HttpLink(
    {uri: document.getElementById("url-graphql").getAttribute("content")});

const apolloLink = new ApolloLink((operation, forward) =>
    {
        operation.setContext({
            credentials: 'same-origin',
            headers: {
                authorization: localStorage.getItem('token') || null,
                'X-CSRF-Token': document.getElementById("csrf-token").getAttribute("content")
            }
        });
        return forward(operation);
    });

const defaultApolloClient = new ApolloClient(
    {
        link: ApolloLink.from( [
            new ApolloDebounceLink( DEFAULT_DEBOUNCE_TIMEOUT ),
            apolloLink,
            httpLink
        ]),
        cache: new InMemoryCache({
                dataIdFromObject: o => (o._id ? `${o.__typename}:${o._id}`: null),
            }),
        $query:
            {
                /* fetchPolicy: 'cache-and-network', */
            },
        connectToDevTools: true
    });

const proveedorApollo = new VueApollo(
    {
        defaultClient: defaultApolloClient
    });

Vue.use(VueApollo);
```

Así, en los llamadas en las que se quiera usar la función "Debounce", simplemente hay que añadir
un parámetro "*debounceKey*" de la siguiente manera:

```js
apollo: {
    buscadorAsientos: function () {
        return {
            fetchPolicy: 'cache-and-network',
            query: GET_buscadorAsientos,
            variables() { return { id: this.id }; },
            context: {
                debounceKey: 'buscador'
            }
        }
    }
}    
```

La librería permite unificar el "debounce" en todas las queries que tengan la misma **debounceKey**.
Si además se quiere personalizar el tiempo de "debounce" para no usar el valor por defecto:

```js
apollo: {
    ...
    context: {
        debounceKey: 'buscador',
        debounceTimeout: 600,
    }
    ...
}    
```


