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

```shell script
nvm --version
```

En Windows, reiniciar el PC, porque en la instalación se ha añadido *“c:\nodejs”* al path, pero todavía no se ha enterado. Así se puede utilizar node. Ese directorio es un enlace virtual.

Después, cada vez que instales una nueva versión de node, hay que instalar en esa versión concreta
todos los paquetes npm globales que quieras tener. Es decir, **yarn** y aquellos otros que tengas:

```shell script
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


## Laravel con Homestead: Instalación Vagrant

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

```shell script
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


## Laravel con Docker

Se utiliza [https://laradock.io/](https://laradock.io/) dado que ofrece la configuración por defecto
para todos los posibles contenedores. Viene con todo preconfigurado, de forma que es supersencillo.

### Instalación inicial

Como referencia básica, la propia documentación: [https://laradock.io/](https://laradock.io/):

1. Instalar [Docker-desktop](https://docs.docker.com/docker-for-windows/install/) 
   (es necesario registrarse, crearse un usuario, para que te permite la descarga)
2. Testear que funciona bien, ejecutando en la línea de comandos 
   ```shell script
   docker --version
   ```
3. Añadir tu cuenta de usuario en el grupo local del ordenador "_Docker users_"
4. Copiar el fichero "_laradock/env-example_" en el fichero "_laradock/.env_"
   (salvo que el proyecto ya tenga un fichero plantilla en "_.env-laradock_", por ejemplo), 
   y vigilar estos parámetros:
    ```
    NGINX_HOST_HTTP_PORT=800    # Después la aplicación funcionará en http://localhost:800
    ```
5. Como hemos puesto la aplicación en el puerto 800, hay que configurarlo en el **.env**:
    ```
    APP_URL=http://localhost:800/
    ```
6. También en el fichero **webpack.mix.js**:
    ```js
    mix.browserSync({
        proxy: 'http://localhost:800'
    });
    ```
6. Ajustar la configuración de postgres para que funcione (el volumen docker) en el fichero **docker-compose.yml**:
    ```yaml
    volumes:
      postgres:
        driver: ${VOLUMES_DRIVER}
      pgdata:                       # Añadir este volumen
        driver: ${VOLUMES_DRIVER}
    
    ### PostgreSQL ###########################################
        postgres:
          build: ./postgres
          volumes:
            #- ${DATA_PATH_HOST}/postgres:/var/lib/postgresql/data
            - pgdata:/var/lib/postgresql/data     # Esta es la línea que hay que añadir
            - ${POSTGRES_ENTRYPOINT_INITDB}:/docker-entrypoint-initdb.d 
    ```
7. Arrancar todos los contenedores:
    ```shell script
    cd laradock
    docker-compose up -d nginx postgres pgadmin redis workspace sonarqube
    docker-compose ps     # para revisar la situación
    ```    
8. Ajustar la configuración de postgres y redis en el fichero **.env**:
    ```
    DB_HOST=postgres
    DB_PORT=5432
    DB_DATABASE=postgres
    DB_USERNAME=default
    DB_PASSWORD=secret
    
    REDIS_HOST=redis
    ```
9. Ejecutar las migrations:
    ```shell script
    docker-compose exec workspace bash    # Entrar en el contenedor del workspace
    php artisan migrate --seed
    exit                                  # salir del contenedor
    ```
10. La aplicación está corriendo en: [http://localhost:800](http://localhost:800)


### Operar con docker

Para revisar la situación:

```shell script
docker ps                              # List current running Containers
docker-compose ps                      # List only this project containers
docker-compose stop                    # Close all running Containers
docker-compose stop {container-name}   # stop single container
docker-compose down                    # delete all existing Containers

# Para ver los logs de un servicio (ej: postgres):
docker-compose logs postgres

# Para entrar en un container (run commands in a running Container)
docker-compose exec {container-name} bash
exit                                   # exit from a container
```

Para cambiar la configuración:

- Edit default container configuration: Open the ```docker-compose.yml``` and change anything you want.
- Edit a Docker Image: 
  - example for mysql it will be _mysql/Dockerfile_.
  - Edit the file the way you want.
  - Re-build the container: ```docker-compose build mysql```

Otras referencias:

- [View log files](https://laradock.io/documentation/#view-the-log-files) (de los containers)
- [Install PHP extensions](https://laradock.io/documentation/#install-php-extensions)
- [Install xDebug](https://laradock.io/documentation/#install-xdebug)
- [Install SonarQube](https://laradock.io/documentation/#install-sonarqube-automatic-code-review-tool)
- [Prepare Laradock for production](https://laradock.io/documentation/#prepare-laradock-for-production)

Run Artisan Commands: hay que hacerlo desde el container _workspace_:

```shell script
docker-compose up -d workspace # Make sure you have the workspace container running
docker-compose ps              # Find the Workspace container name
docker-compose exec --user=laradock workspace bash  # Enter the Workspace container

# Run anything you want:
php artisan
Composer update
phpunit

# apaga todo los servicios que levantó con docker-compose up
docker-compose down
```



### pgAdmin con docker

Para usar pgAdmin:

1. Open your browser and visit the localhost on port 5050: [http://localhost:5050](http://localhost:5050)
2. At login page use default credentials:
  - Username: pgadmin4@pgadmin.org
  - Password: admin
3. Para conectar, crear nueva base de datos con estos parámetros: 
  - Host name/Address: postgres
  - Port: 5432
  - Maintenance database: postgres
  - username: default
  - clave: secret
4 Si se necesita entrar en el postgres (en el contenedor) con línea de comandos:
    ```shell script
    docker-compose exec --user=root postgres    
    ```


### Sonarqube con docker

1. Para instalar Sonarqube, tener en cuenta la [documentación](https://laradock.io/documentation/). 
   Y está funcionando en 
   [http://localhost:9000](http://localhost:9000) (usuario/clave: admin/admin).
   Algunos detalles que se han tenido en cuenta: 
   - El servicio se levanta con el comando 
     ```shell script
     docker-compose up -d sonarqube
     ```
   - Si no funciona y al revisar los logs hay un problema de permisos de escritura en la carpeta de log,
     ejecutar: 
     ```shell script
     docker-compose run --user=root --rm sonarqube chown sonarqube:sonarqube /opt/sonarqube/logs
     ```
   - Si la BD no está creada (se puede entrar en [pgAdmin](http://localhost:5050/browser/) y mirar si existe la BD _sonar_),
     hay que ejecutar el script __:
     ```shell script
     cd docker-entrypoint-initdb.d/
     bash init_sonarqube_db.sh
     ```
     Ese fichero se encuentra en el proyecto, en _laradock/postgres/docker-entrypoint-initdb.d/init_sonarqube_db.sh_. 
     Si da algún problema en Windows del tipo _End of file_, sólo hay que editarlo con el IDE y añadirle un salto
     de línea al final.
12. Para ejecutar un análisis de Sonarqube, instalar el [scanner](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/) en tu PC de desarrollo,
    y después ejecutar en la línea de comandos de tu PC local, en la raiz del proyecto: 
    ```shell script
    sonar-scanner
    ```

### Beanstalkd con docker

Pendiente.






