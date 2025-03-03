<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# siproad-sales-lambda
Lambda que replica la información en el microservicio de siproad-products-api.

```
- Lenguaje: Nodejs (Nest), typescript.
- Tecnologias: Docker, lambda AWS.
```

## Configuración ambiente dev

### Configuración del lambda
* Instalar Nest CLI instalado ```npm i -g @nestjs/cli```
* Clonar el proyecto.
* Clonar el archivo __.env.template__ y renombrar la copia a ```.env```
* Configurar los valores de las variables de entornos correspondientes ```.env```
* Actualizar node_modules ```npm install```
* Construir lambda ```siproad-sales-lambda.zip``` ejecutando ```npm run build-lambda```
* Copiar lambda ```siproad-products-lambda.zip``` en la raiz de este repo.

Nota: En la raiz de este repo deben estar los zip de los 2 lambdas, de esta forma se garantiza que los lambdas se creen dentro del contenedor cada vez que se reinicia el contenedor.

### Configuración AWS (docker)
* Instalar AWS CLI desde la pagina de AWS.
* Instalar Docker desktop.
  * Limitar memoria del wsl utilizado por docker
  * Abrir archivo wsl ```notepad %USERPROFILE%\.wslconfig```
  * Copiar dentro del archivo wslconfig el siguiente contenido:
    ```
    [wsl2]
    memory=2GB   # Limita a 2GB de RAM
    processors=4  # Usa solo 4 núcleos
    swap=2GB      # Agrega 2GB de swap
    ```
  * Reiniciar wsl ```wsl --shutdown```
* Abrir Docker Desktop.
* Descargar imagen de localstack.
* Activar en Docker la funcion ```Expose daemon on tcp://localhost:2375 without TLS```
* Crear contenedor de "aws" ```docker-compose -p dev-aws up -d```

### Configuración manual del lambda (docker)
* Actualizar node_modules ```npm install```
* Compilar lambda ```npm run build```
* Limpiar node_modules solo con las dependencias productivas ```npm prune --production```
* Comprimir lambda ```7z a siproad-sales-lambda.zip dist\* node_modules\* package.json .env```
* Eliminar lambda en AWS (docker) (opcional)
  ```
  aws --endpoint-url=http://localhost:4566 lambda delete-function --function-name siproad-sales-lambda
  ```
* Subir lambda a AWS (docker)
  ```
  aws --endpoint-url=http://localhost:4566 lambda create-function \
    --function-name siproad-sales-lambda \
    --runtime nodejs18.x \
    --handler dist/main.handler \
    --role arn:aws:iam::000000000000:role/lambda-role \
    --zip-file fileb://siproad-sales-lambda.zip \
    --timeout 45
  ```
* Probar lambda
  * Crear archivo payload.json con el siguiente contenido
    ```json
    {
      "key": "value"
    }
    ```
  * Ejecutar lambda
    ```
    aws --endpoint-url=http://localhost:4566 lambda invoke \
      --function-name siproad-sales-lambda \
      --payload fileb://payload.json \
      output.txt
    ```