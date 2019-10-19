# Estructura básica pantalla

Aspectos a chequear que se cumplen en cualquier pantalla de una aplicación web:

[[TOC]]


## Existe un título

Una de las preguntas fundamentales que un usuario se hace cuando aparece una pantalla de 
la aplicación es **¿Dónde estoy?**. Debe ser trivial  responder a esa pregunta por parte del usuario, 
de forma que si le pusieran de repente en esa página, sabría identificar dónde se encuentra y qué
puede realizar en esa pantalla.
 
Para ello, es importante que la página tenga un título y una pequeña descripción si fuera necesario,
para aclarar qué se puede hacer en esa página, o unas instrucciones necesarias para que no aparezcan dudas.

En caso de que en la pantalla se pueda realizar una acción, el título debe estar compuesto de un verbo
seguido del objeto concreto sobre el que se realiza la acción.

:::tip Ejemplo de título (verbo + objeto concreto)
Editar persona: Juan Pérez
:::

## Tiene migas de pan

La primera miga de pan siempre debe ser el nombre de la aplicación, y ser un enlace a la página
principal de la misma. Cada miga ha de ser un enlace al concepto que describe.

El resto de migas han de ser **concretas**, en lugar de genéricas. A continuación se ponen un ejemplo
incorrecto y otro incorrecto:

::: danger Ejemplo genérico (incorrecto)
Home > liquidaciones > instalacion > característica
::: 

::: tip Ejemplo correcto
Liquid > Sector Gasista > Gasoducto de Pajares > longitud
:::

 

## La pantalla tiene una función principal única

Se trata de responder rápidamente a la pregunta **¿Qué puedo hacer aquí?**. 
Debe ser fácilmente identificable la acción primaria que se puede hacer
en esa página (ver el listado de tareas, editar un usuario, buscar contactos, etc...).

El botón, enlace o información que identifique la acción primaria de la pantalla ha de tener
siempre el color primario de la aplicación, y ningún otro botón u opción debe tener ese color. 
Para el resto de funciones secundarias se debe utilizar el color secundario u otros colores.


## La url es singular

La url de cada una de las pantalla de la aplicación **ha de ser diferente**, y contener una
referencia a los propios objetos que esté tratando, ya sea en forma de identificador, "slug" o código
de cualquier tipo.

Una misma url **siempre ha de devolver la misma pantalla con los mismos datos**, al margen del usuario
que accede a la misma. 

Si el usuario decidiera copiar la url de la pantalla en la que se encuentra, y enviarla por correo,
el destinatario al pinchar debe aparecer (si tiene permisos) exactamente en la misma pantalla.

::: danger Ejemplos incorrectos
https://liquid.cnmc.es/single-page-application  
https://liquid.cnmc.es/mi-perfil
:::

::: tip Ejemplos correctos
https://liquid.cnmc.es/instalaciones/223d9s0s/caracteristicas/longitud/editar
https://liquid.cnmc.es/perfil-usuario/adf09a8df97ad98
:::  


## Que tenga pie de página

El pie de página ha de tener un **color de fondo más oscuro** que el habitual de la página, y ha de estar
separado del final del texto del contenido de la pantalla:

```css
div.pie {
    margin-top: 4em;
}
```

En el pie de página han de aparecer los siguientes datos:

- Nombre de la aplicación
- Enlace a la ayuda si la aplicación tiene ayuda
- Si la aplicación no está publicada en Internet, nombre del host que la ha servido
- Si es posible, tiempo en milisegundos que ha tardado en procesarse en el servidor
- Nombre del usuario autenticado, y listado de sus permisos en la aplicación
- Referencia de un email o teléfono de contacto al que acudir en caso de problemas 

