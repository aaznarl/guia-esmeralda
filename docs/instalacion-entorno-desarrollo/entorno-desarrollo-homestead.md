# Laravel con Homestead

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

