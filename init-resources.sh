echo ">>> script starting process..."

echo "creating lambda..."
LAMBDA_NAME="siproad-orders-lambda"
LAMBDA_RUNTIME="nodejs18.x"
LAMBDA_HANDLER="dist/main.handler"
LAMBDA_ROLE="arn:aws:iam::000000000000:role/lambda-role"  # Puede ser cualquier valor simulado
LAMBDA_ZIP_PATH="/etc/localstack/siproad-orders-lambda.zip"

# Verifica si el archivo ZIP existe antes de crear el Lambda
if [ -f "$LAMBDA_ZIP_PATH" ]; then
  
  awslocal lambda create-function \
    --function-name "$LAMBDA_NAME" \
    --runtime "$LAMBDA_RUNTIME" \
    --role "$LAMBDA_ROLE" \
    --handler "$LAMBDA_HANDLER" \
    --zip-file fileb://"$LAMBDA_ZIP_PATH" \
    --timeout 45

  echo "lambda '$LAMBDA_NAME' created OK"

else
  echo "Error: ZIP file not found, path='$LAMBDA_ZIP_PATH'."
fi

echo "creating subscriptions lambda to SQS..."
aws --endpoint-url=http://localhost:4566 lambda create-event-source-mapping \
  --function-name "$LAMBDA_NAME" \
  --event-source arn:aws:sqs:us-east-1:000000000000:siproad-admin-orders-sqs \
  --batch-size 10 \
  --function-response-types ReportBatchItemFailures

aws --endpoint-url=http://localhost:4566 lambda create-event-source-mapping \
  --function-name "$LAMBDA_NAME" \
  --event-source arn:aws:sqs:us-east-1:000000000000:siproad-products-orders-sqs \
  --batch-size 10 \
  --function-response-types ReportBatchItemFailures

echo "<<< script executed"
