<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# siproad-orders-lambda
Lambda que replica la información en el microservicio de siproad-products-api.

```
- Lenguaje: Nodejs (Nest), typescript.
- Tecnologias: Docker, lambda AWS.
```

## Configuración ambiente dev

### Configuración del repo
* Instalar Nest CLI instalado ```npm i -g @nestjs/cli```
* Clonar el proyecto.
* Clonar el archivo __.env.template__ y renombrar la copia a ```.env```
* Configurar los valores de las variables de entornos correspondientes ```.env```
* Actualizar node_modules ```npm install```
* Compilar lambda ```npm run build```
* Limpiar node_modules solo dejar las dependencias productivas ```npm prune --production```
* Comprimir lambda ```7z a siproad-orders-lambda.zip dist\* node_modules\* .env package.json```

### Configuración AWS (docker)
* Instalar Docker desktop.
* Activar en Docker la funcion ```Expose daemon on tcp://localhost:2375 without TLS```
* Descargar imagen de localstack.
* Instalar AWS CLI desde la pagina de AWS.
* Crear contenedor de "aws" ```docker-compose -p dev-aws up -d```

### Configuración manual del lambda (docker)
* Actualizar node_modules ```npm install```
* Compilar lambda ```npm run build```
* Limpiar node_modules solo con las dependencias productivas ```npm prune --production```
* Comprimir lambda ```7z a siproad-orders-lambda.zip dist\* node_modules\* package.json .env```
* Eliminar lambda en AWS (docker) (opcional)
  ```
  aws --endpoint-url=http://localhost:4566 lambda delete-function --function-name siproad-orders-lambda
  ```
* Subir lambda a AWS (docker)
  ```
  aws --endpoint-url=http://localhost:4566 lambda create-function \
    --function-name siproad-orders-lambda \
    --runtime nodejs18.x \
    --handler dist/main.handler \
    --role arn:aws:iam::000000000000:role/lambda-role \
    --zip-file fileb://siproad-orders-lambda.zip \
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
      --function-name siproad-orders-lambda \
      --payload fileb://payload.json \
      output.txt
    ```
### Configuración manual de sns, sqs y lambda (docker)
* Crear topics en SNS
  ```
  aws --endpoint-url=http://localhost:4566 sns create-topic --name siproad-admin-sns
  ```
  ```
  aws --endpoint-url=http://localhost:4566 sns create-topic --name siproad-products-sns
  ```

* Crear colas SQS
  ```
  aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name siproad-admin-products-sqs
  ```
  ```
  aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name siproad-admin-orders-sqs
  ```
  ```
  aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name siproad-products-orders-sqs
  ```

* Suscribir SQS a SNS
    * Dar permiso al SNS para escribir en los SQS __(repetir por cada asociación sns->sqs)__
      ```
      aws --endpoint-url=http://localhost:4566 sqs set-queue-attributes \
      --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/siproad-admin-products-sqs \
      --attributes '{
        "Policy": "{\"Version\": \"2012-10-17\", \"Statement\": [{\"Effect\": \"Allow\", \"Principal\": \"*\", \"Action\": \"SQS:SendMessage\", \"Resource\": \"arn:aws:sqs:us-east-1:000000000000:siproad-admin-products-sqs\", \"Condition\": {\"ArnEquals\": {\"aws:SourceArn\": \"arn:aws:sns:us-east-1:000000000000:siproad-admin-sns\"}}}]}"
      }'
      ```
      ```
      aws --endpoint-url=http://localhost:4566 sqs set-queue-attributes \
      --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/siproad-admin-orders-sqs \
      --attributes '{
        "Policy": "{\"Version\": \"2012-10-17\", \"Statement\": [{\"Effect\": \"Allow\", \"Principal\": \"*\", \"Action\": \"SQS:SendMessage\", \"Resource\": \"arn:aws:sqs:us-east-1:000000000000:siproad-admin-orders-sqs\", \"Condition\": {\"ArnEquals\": {\"aws:SourceArn\": \"arn:aws:sns:us-east-1:000000000000:siproad-admin-sns\"}}}]}"
      }'
      ```
      ```
      aws --endpoint-url=http://localhost:4566 sqs set-queue-attributes \
      --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/siproad-products-orders-sqs \
      --attributes '{
        "Policy": "{\"Version\": \"2012-10-17\", \"Statement\": [{\"Effect\": \"Allow\", \"Principal\": \"*\", \"Action\": \"SQS:SendMessage\", \"Resource\": \"arn:aws:sqs:us-east-1:000000000000:siproad-products-orders-sqs\", \"Condition\": {\"ArnEquals\": {\"aws:SourceArn\": \"arn:aws:sns:us-east-1:000000000000:siproad-products-sns\"}}}]}"
      }'
      ```

    * Obtener arn de las SQS __(repetir por cada sqs)__
      ```
      aws --endpoint-url=http://localhost:4566 sqs get-queue-attributes \
      --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/siproad-admin-products-sqs \
      --attribute-names QueueArn
      ```
      ```
      Respuesta:
      {
          "Attributes": {
              "QueueArn": "arn:aws:sqs:us-east-1:000000000000:siproad-admin-products-sqs"
          }
      }
      ```
      ```
      aws --endpoint-url=http://localhost:4566 sqs get-queue-attributes \
      --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/siproad-admin-orders-sqs \
      --attribute-names QueueArn
      ```
      ```
      aws --endpoint-url=http://localhost:4566 sqs get-queue-attributes \
      --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/siproad-products-orders-sqs \
      --attribute-names QueueArn
      ```
    
    * Suscribir SQS a SNS con los arn obtenidos __(repetir por cada asociación sns->sqs)__
      ```
      aws --endpoint-url=http://localhost:4566 sns subscribe \
      --topic-arn arn:aws:sns:us-east-1:000000000000:siproad-admin-sns \
      --protocol sqs \
      --notification-endpoint arn:aws:sqs:us-east-1:000000000000:siproad-admin-products-sqs
      ```
      ```
      Respuesta:
      {
          "SubscriptionArn": "arn:aws:sns:us-east-1:000000000000:siproad-admin-sns:7d7b4fa0-e33c-4b84-8223-06556d535d80"
      }
      ```
      ```
      aws --endpoint-url=http://localhost:4566 sns subscribe \
      --topic-arn arn:aws:sns:us-east-1:000000000000:siproad-admin-sns \
      --protocol sqs \
      --notification-endpoint arn:aws:sqs:us-east-1:000000000000:siproad-admin-orders-sqs
      ```
      ```
      aws --endpoint-url=http://localhost:4566 sns subscribe \
      --topic-arn arn:aws:sns:us-east-1:000000000000:siproad-products-sns \
      --protocol sqs \
      --notification-endpoint arn:aws:sqs:us-east-1:000000000000:siproad-products-orders-sqs
      ```
    * Prueba de SNS -> SQS
      * Enviar mensaje
        ```
        aws --endpoint-url=http://localhost:4566 sns publish \
        --topic-arn arn:aws:sns:us-east-1:000000000000:siproad-admin-sns \
        --message "¡Hola par de SQS, desde SNS!"
        ```
      * Leer mensaje
        ```
        aws --endpoint-url=http://localhost:4566 sqs receive-message \
        --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/siproad-admin-products-sqs
        ```
        ```
        aws --endpoint-url=http://localhost:4566 sqs receive-message \
        --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/siproad-admin-orders-sqs
        ```
* Suscribir lambda a sqs
  * Eliminar suscripcion a sqs en AWS (docker) (opcional)
    ```
    aws --endpoint-url=http://localhost:4566 lambda list-event-source-mappings

    aws --endpoint-url=http://localhost:4566 lambda delete-event-source-mapping --uuid <reemplazar por UUID>
    ```
  * Suscribir
    ```
    aws --endpoint-url=http://localhost:4566 lambda create-event-source-mapping \
      --function-name siproad-orders-lambda \
      --event-source arn:aws:sqs:us-east-1:000000000000:siproad-admin-products-sqs \
      --batch-size 10 \
      --function-response-types ReportBatchItemFailures
    ```
    ```
    aws --endpoint-url=http://localhost:4566 lambda create-event-source-mapping \
      --function-name siproad-orders-lambda \
      --event-source arn:aws:sqs:us-east-1:000000000000:siproad-admin-orders-sqs \
      --batch-size 10 \
      --function-response-types ReportBatchItemFailures
    ```
    ```
    aws --endpoint-url=http://localhost:4566 lambda create-event-source-mapping \
      --function-name siproad-orders-lambda \
      --event-source arn:aws:sqs:us-east-1:000000000000:siproad-products-orders-sqs \
      --batch-size 10 \
      --function-response-types ReportBatchItemFailures
    ```
  * Probar lambda suscrito al sqs:
    * Ejecutar endpoint (/siproad-admin/companies/update) para escribir un mensaje en el SNS __siproad-admin-sns__ quien a su vez envia el mensaje al SQS __siproad-admin-products-sqs__ que levanta el LAMBDA __siproad-orders-lambda__
      ```
      curl --location --request PATCH 'localhost:3001/siproad-admin/companies/update' \
      --header 'Content-Type: application/json' \
      --data '{
          "id": "7ffbc5ea-9ecd-4531-bc25-b6bd8dfabbeb",
          "name": "company CO"
      }'
      ```