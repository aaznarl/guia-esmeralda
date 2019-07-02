# Instalación del entorno de desarrollo

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


Instalar Yarn
Se hace con el comando
npm i -g yarn


## Instalación de VirtualBox

Laravel Homestead permite trabajar con varios programas de virtualización (VirtualBox, VMWare, Parallels o Hyper-V). 

Para instalar VirtualBox descargarlo desde aquí: [https://www.virtualbox.org/wiki/Downloads](https://www.virtualbox.org/wiki/Downloads).

Una vez instalado, para ejecutarlo usar el usuario normal, sin permisos de administrador.

::: tip
No se requiere permisos de administrador para usar Virtualbox
:::


## Instalación de Vagrant

[Vagrant](https://www.vagrantup.com/) es una herramienta para la creación y configuración de entornos de desarrollo virtualizados. 
Para que funcionen correctamente los scripts de vagrant (creo que si no eres administrador de tu máquina),
primero hay que habilitar la ejecución de scripts powershell:

1. Abrir Powershell como administrador: buscar "Windows Powershell" -> ejecutar como administrador 
2. Escribir en la consola ```set-executionpolicy remotesigned```

Después, descargar e instalar vagrant desde aquí:
[https://www.vagrantup.com/downloads.html](https://www.vagrantup.com/downloads.html)

Comandos útiles de Vagrant:

- Reiniciar la máquina virtual (equivalente a hacer un halt y después un up): ```vagrant reload```
- Apagar la máquina virtual: ```vagrant halt```
- Suspender el estado de la máquina: ```vagrant suspend```
- Conectarse a la máquina virtual: ```vagrant ssh```

Ante cualquier problema, la máquina virtual puede ser eliminada, y después se puede volver a ejecutar
```vagrant up``` para regenerarla y levantarla entera desde cero. Si se hace así, hay que recordar
que es necesario ejecutar las migrations (Larvel):

```bash
vagrant up
vagrant ssh               # Conectar por ssh a la máquina virtual
cd code                   # el código fuente está mapeado en /home/vagrant/code  
php artisan migrate       # ejecutar migrations del proyecto
```

Además, cuando persistan los problemas, suele ser una buena idea:

1. Actualizar vagrant por si está en una versión antigua
2. Actualizar Virtualbox
3. Actualizar la *box* que estés usando:  ```vagrant box update```
4. Actualizar los plugins de vagrant, dado que a veces hay problemas de interferencias de versiones. 
   Primero ejecutar ```vagrant plugin list``` y después actualizar cada plugin, por 
   ejemplo: ```vagrant plugin update vagrant-vbguest```
5. En particular el plugin *vbguest* da problemas con la versión 7.2.1 de homestead. Se puede desinstalar
   sin problemas: ```vagrant plugin uninstall vagrant-vbguest```    


## Instalación de Cmder

[Cmder](http://cmder.net/) es un programa de consola, que permite abrir varias ventanas de línea
de comandos (cli), algunas de las cuales como administrador, o con diferentes usuarios.

Es muy útil porque permite por ejemplo tener en una ventana corriendo el ```yarn watch```, en otra estar 
dentro del servidor linux de homestead, en otra etar con *tinker*... 


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

