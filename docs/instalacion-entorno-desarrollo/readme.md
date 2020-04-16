# Herramientas básicas en el entorno de desarrollo

[[TOC]]


## Habilitar la virtualización de hardware (VT-x) en el PC

Si tienes **Windows 10**: Es necesario habilitar la virtualización de hardware (VT-x) en la bios del sistema. 
Si estás utilizando Hyper-V en un sistema UEFI, también puede necesitar deshabilitar Hyper-V para acceder a VT-x.

Más información relacionada con homestead [aquí](https://laravel.com/docs/5.6/homestead).

## Instalación de Nvm  (configurador de Node + npm + yarn)

Antes de instalar, **desinstalar todas las versiones de Node**, y eliminar
todos los directorios de instalación (ej: _C:\Program Files\nodejs_)
y de npm (ej: _C:\Users\AppData\Roaming\npm_)

Descargar [Nvm for Windows](https://github.com/coreybutler/nvm-windows) o 
[Nvm for linux](https://github.com/creationix/nvm) según corresponda.

Instalar NVM, pero en Windows cambiar las rutas para que sean **c:\nvm** y **c:\nodejs**. 
Así podrán entrar todos los usuarios. 

::: warning
Es MUY IMPORTANTE que las rutas no tengan espacios, porque si no después casca. Y además así cualquier usuario 
tiene permisos de crear carpetas dentro de la ruta de nvm.
:::

Para verificar que está correctamente instalado, ejecuta y comprueba la versión:

```bash
nvm --version
```

En Windows, reiniciar el PC, porque en la instalación se ha añadido *“c:\nodejs”* al path, pero todavía no se ha enterado. Así se puede utilizar node. Ese directorio es un enlace virtual.

Después, cada vez que instales una nueva versión de node, hay que instalar en esa versión concreta
todos los paquetes npm globales que quieras tener. Es decir, **yarn** y aquellos otros que tengas:

```bash
nvm install 10.8.0
nvm use 10.8.0
npm i -g yarn
```


## Instalación de VirtualBox

Laravel Homestead permite trabajar con varios programas de virtualización (VirtualBox, VMWare, Parallels o Hyper-V). 

Para instalar VirtualBox descargarlo desde aquí: [https://www.virtualbox.org/wiki/Downloads](https://www.virtualbox.org/wiki/Downloads).

Una vez instalado, para ejecutarlo usar el usuario normal, sin permisos de administrador.

::: tip
No se requiere permisos de administrador para usar Virtualbox
:::

## Instalación de Cmder

[Cmder](http://cmder.net/) es un programa de consola, que permite abrir varias ventanas de línea
de comandos (cli), algunas de las cuales como administrador, o con diferentes usuarios.

Es muy útil porque permite por ejemplo tener en una ventana corriendo el ```yarn watch```, en otra estar 
dentro del servidor linux de homestead, en otra etar con *tinker*... 


## Instalación de PHP

[Descargar](https://www.php.net/downloads.php) la última versión de "*PHP Non Thread Safe for windows*".
Después, copiar el fichero ```php.ini-development``` (o php.production si estás en producción) en otro llamado ```php.ini```.
Abrir el fichero *php.ini* y descomentar estas líneas:

```shell script
set fastcgi.impersonate = 1
set cgi.fix_pathinfo=1
set cgi.force_redirect=0
extension_dir=“ext”

# Subir el tamaño, no viene mal
upload_max_filesize=2M

# Subir el tiempo de ejecución: poner 60 segundos no está mal
max_execution_time=120    

# Tampoco está mal subir la memoria de ejecución: poner 256 por ejemplo
memory_limit=128M

Activar extensión fileinfo
Activar extensión gd2

# Para las traducciones
Activar extensión gettext
Activar extensión mbstring

# Enable openssl
extension=php_openssl.dll
extension=ldap
```

Para instalar el controlador PHP de SQL Server:

- [Descarga controladores php para windows](https://docs.microsoft.com/es-es/sql/connect/php/download-drivers-php-sql-server?view=sql-server-2017)
- [Loading de php sql driver](https://docs.microsoft.com/es-es/sql/connect/php/loading-the-php-sql-driver?view=sql-server-2017)
- Al ejecutar el instalable, guardar el dll en la carperta “ext” de php.
- Registrarlo en el fichero php.ini:  ``` extension=php_sqlsrv_72_nts_x86.dll ```


## Instalación de PHPStorm
 
[PHPStorm](https://www.jetbrains.com/phpstorm/specials/phpstorm/phpstorm.html) es un entorno de desarrollo de 
reconocido prestigio y muy adecuado para trabajar con proyectos PHP. Es de pago. En caso de usarse es 
recomendable modificar la siguiente configuración:

- Que no se eliminen automáticamente al guardar los espacios de final de línea (porque en 
markdown sirven para indicar que lo que sigue debe estar en una nueva línea):   
*Editor -> General -> Other -> Strip trailing spaces on save -> None*
- Eliminar los *"typos"*, para que el editor no subraye las palabras que no conoce:   
*Editor -> Inspections -> Spelling -> Typo -> desmarcar*

::: tip
Abrir el PHPStorm con el usuario normal, sin permisos de administrador
:::


## Paso final: elegir homestead o docker

Para continuar con la instalación del entorno de desarrollo, hay que elegir:

1. [con docker](entorno-desarrollo-docker.md) (recomendado)
2. [con vagrant](entorno-desarrollo-homestead.md)






