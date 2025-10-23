# SaaS Cloud DevOps

![Bootstrap CI/CD Status](https://github.com/ShamansIT/SaaS_Cloud_DevOps/actions/workflows/bootstrap.yml/badge.svg)

This repository provides **production-grade multi-stack DevOps implementation** integrating:
- **AWS Serverless architecture** (Lambda, API Gateway, CloudFormation)
- **End-to-end CI/CD automation** via GitHub Actions with Infrastructure as Code validation
- **Cross-platform scripting and observability** with Node.js, Python, and AWS Powertools

The goal of this project is to establish a **scalable, secure, and maintainable DevOps environment** that aligns with enterprise-grade delivery standards and cross-cloud best practices, combining AWS automation within a unified workflow.

---

# Project Overview
## Phase 01: API Gateway Request Validation - CloudFormation

**Foundation source** – [AWS CloudFormation template of a sample API with basic request validation](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-validation-sample-cloudformation.html).

### First Project Increment 
Built basic REST API у **API Gateway (REST API)** with **request validation** through **Models** and **RequestValidators** in **CloudFormation**.  On this stage without Lambda - integration **HTTP_PROXY** based on PetStore demo.  

**Intent** - showcase backend input control and pure IaC implementation.

### Base
- Official example used:  **AWS - API Gateway request validation sample (CloudFormation)**.  
- Key elements reproduced: model for body `POST`, validator for `GET` (query) and `POST` (body), resource `/validation`, `Deployment` і `Stage`.  
- Added custom tests and screenshots.

### Implemented Report
  **Resource:** `/validation`
- **GET /validation?q1=...** - mandatory query-parameter `q1` (validation at the level API GW)
- **POST /validation** - перевірка JSON-body by **Model** (required fields, ranges)
- **Integration:** `HTTP_PROXY` → PetStore (Lambda will implement on Phase 02)
- **IaC:** one CFN-template `aws-cloudformation/apigw-request-validation.yaml`
---

### Files
- aws-cloudformation/apigw-request-validation.yaml
- docs/screenshots/*.jpg
---

## Deployment and checks
### Check IaC

```powershell
cfn-lint aws-cloudformation/apigw-request-validation.yaml
```
<details> <summary>Screenshot Check IaC</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/main/docs/screenshots/phase%2001%20screen02%20-%20cfn_lint_ok.jpg?raw=true" width="900" alt="cfn-lint ok"> </details>

### Deploy
```powershell
aws cloudformation deploy `
  --template-file aws-cloudformation/apigw-request-validation.yaml `
  --stack-name req-validators-sample `
  --capabilities CAPABILITY_IAM `
  --parameter-overrides StageName=v1
```
After creating the stack get an Invoke URL from Outputs:
```powershell
aws cloudformation describe-stacks --stack-name req-validators-sample `
  --query "Stacks[0].Outputs[?OutputKey=='ApiRootUrl'].OutputValue" --output text
```
<details> <summary>Screenshot Stack Creation</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/main/docs/screenshots/phase%2001%20screen04%20-%20stack_create_complete.jpg?raw=true" width="900" alt="Output ApiRootUrl"> </details>

### Test

GET - parameter validation
```powershell
# 200 OK - parameter present
curl.exe "$env:API_ROOT/validation?q1=dog"
```
<details> <summary>Screenshot GET 200 with q1</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/main/docs/screenshots/phase%2001%20screen06%20-%20testGET%20-%20200_with_q1.jpg?raw=true" width="900" alt="GET 200 with q1"> </details>

####
```powershell
# 400 Bad Request - parameter missing
curl.exe "$env:API_ROOT/validation"
```
<details> <summary>Screenshot GET 400 missing q1</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/main/docs/screenshots/phase%2001%20screen07%20-%20testGET%20-%20400_missing_q1.jpg?raw=true" width="900" alt="GET 400 missing q1"> </details>

####
```powershell
# 400 Bad Request - empty parameter
curl.exe "$env:API_ROOT/validation?q1="
```
<details> <summary>Screenshot GET 400 blank q1</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/main/docs/screenshots/phase%2001%20screen08%20-%20testGET%20-%20400_blank_q1.jpg?raw=true" width="900" alt="GET 400 blank q1"> </details>

####

POST - JSON body validation
```powershell
# 200 OK - valid body
curl.exe -X POST "$env:API_ROOT/validation" `
  -H "Content-Type: application/json" `
  -d '{"type":"dog","name":"Buddy","price":100,"id":123}'
```
<details> <summary>Screenshot POST 200 valid body</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/main/docs/screenshots/phase%2001%20screen09%20-%20testGPOST%20-%20200_valid_body.jpg?raw=true" width="900" alt="POST 200 valid body"> </details>

####
```powershell
# 400 Bad Request - missing mandatory 'price'
curl.exe -X POST "$env:API_ROOT/validation" `
  -H "Content-Type: application/json" `
  -d '{"type":"dog","name":"Buddy","id":123}'
```
<details> <summary>Screenshot POST 400 missing price</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/main/docs/screenshots/phase%2001%20screen10%20-%20testGPOST%20-%20400_missing_price.jpg?raw=true" width="900" alt="POST 400 missing price"> </details>

####
```powershell
# 400 Bad Request - 'price' out of model range (min 25)
curl.exe -X POST "$env:API_ROOT/validation" `
  -H "Content-Type: application/json" `
  -d '{"type":"dog","name":"Buddy","price":10,"id":123}'
```
<details> <summary>Screenshot POST 400 price out of range</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/main/docs/screenshots/phase%2001%20screen11%20-%20testGPOST%20-%20400_price_out_of_range.jpg?raw=true" width="900" alt="POST 400 price out of range"> </details>

### Clean-up
```powershell
aws cloudformation delete-stack --stack-name req-validators-sample
aws cloudformation wait stack-delete-complete --stack-name req-validators-sample
```
<details> <summary>>Screenshot check Deletion</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/main/docs/screenshots/phase%2001%20screen12%20-%20delete_stack_and_chesk_active_stack.jpg?raw=true" width="900" alt="Delete stack and check"> </details>

## Phase 02: Minimal REST `/tickets` - API Gateway + Lambda
Second Increment: delivered the execution to the **AWS Lambda** and built a minimal REST `/tickets` (GET/POST) through **API Gateway (REST API)** with integration **AWS_PROXY**. At the input saved the validation of the body for POST (Model + RequestValidator).
The goal is to get a working endpoint that accepts and returns JSON without intermediate stubs.

**What exactly has been implemented**
- `GET /tickets` -> Lambda **getTicket-a2** (demo list).
- `POST /tickets` -> Lambda **createTicket-a2** (takes `{ "title": "...", "priority": ... }`, returns created `ticket`).
- **Validation (POST)**: JSON Schema Model with mandatory `title`.
- **CORS**: preflight `OPTIONS` on the resource and CORS headers in Lambda responses.
- **IaC**: one SAM/CFN-template з API, Method, Model/Validator, Deployment/Stage, Lambda Permissions.

**Files**
- `infrastructure/cloudformation/template.yaml` - main SAM/CFN-template.
- `src/handlers/getTicket/index.js` - handler for GET.
- `src/handlers/createTicket/index.js` - handler for POST.
- `aws-cloudformation/packaged.yaml` - exit `cloudformation package`.
---

### Package & Deploy
> S3 bucket for artifacts already created in the previous step.

```powershell
aws cloudformation package `
  --template-file infrastructure/cloudformation/template.yaml `
  --s3-bucket serhii-saas-devops-artifacts-eu-west-1 `
  --output-template-file aws-cloudformation/packaged.yaml
```

<details><summary>Screenshot – package template</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/main/docs/screenshots/phase%2002%20screen14%20-%20package_template_success.jpg?raw=true" width="900" alt="package ok"> </details>

####

```powershell
aws cloudformation deploy `
  --template-file aws-cloudformation/packaged.yaml `
  --stack-name tickets-api-a2 `
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND `
  --parameter-overrides ApiName=tickets-api StageName=v1
```
<details><summary>Screenshot – deploy stack</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/main/docs/screenshots/phase%2002%20screen15%20-%20package_deploy.jpg?raw=true" width="900" alt="deploy ok"> </details>

#### Get Invoke URL:
```powershell
$env:TICKETS_URL = (aws cloudformation describe-stacks --stack-name tickets-api-a2 `
  --query "Stacks[0].Outputs[?OutputKey=='TicketsInvokeUrl'].OutputValue" --output text)
$env:TICKETS_URL
```

## Test
### GET /tickets

``` powershell
Invoke-RestMethod -Uri $env:TICKETS_URL -Method GET
```
<details><summary>Screenshot – GET 200</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/main/docs/screenshots/phase%2002%20screen16%20-%20get_200.jpg?raw=true" width="900" alt="GET 200"> </details>

### POST /tickets (valid)
``` powershell
$body = @{ title = "New ticket from A2"; priority = "HIGH" } | ConvertTo-Json
Invoke-RestMethod -Uri $env:TICKETS_URL -Method POST -ContentType "application/json" -Body $body
```
<details><summary>Screenshot – POST 201</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/main/docs/screenshots/phase%2002%20screen17%20-%20post_201.jpg?raw=true" width="900" alt="POST 201"> </details>

### POST /tickets (invalid)
```powershell
$body = @{ title = ""; priority = "LOW" } | ConvertTo-Json
try {
  Invoke-RestMethod -Uri $env:TICKETS_URL -Method POST -ContentType "application/json" -Body $body
  } catch { $_.Exception.Response.StatusCode.value__ }  
```
<details><summary>Screenshot – POST 400</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/main/docs/screenshots/phase%2002%20screen18%20-%20POST_400.jpg?raw=true" width="900" alt="POST 400"> </details>

### OPTIONS (CORS preflight)
```powershell
curl.exe -i -X OPTIONS "$env:TICKETS_URL"
```
<details><summary>Screenshot – OPTIONS CORS</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/main/docs/screenshots/phase%2002%20screen19%20-%20OPTIONS_cors.jpg?raw=true" width="900" alt="OPTIONS CORS"> </details>

### Clean-up
```powershell
aws cloudformation delete-stack --stack-name tickets-api-a2
aws cloudformation wait stack-delete-complete --stack-name tickets-api-a2
```
<details><summary>Screenshot – delete stack</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/main/docs/screenshots/phase%2002%20screen20%20-%20delete_stack.jpg?raw=true" width="900" alt="delete ok"> </details>

## Node.js environment configuration
To align local development with the AWS Lambda runtime, several Node.js adjustments were introduced during Phase 03.
#### Local dependencies per handler
Each Lambda function (`getTicket`, `createTicket`) now contains its own **package.json**, **package-lock.json** and `node_modules` folder.  
This mirrors AWS packaging logic and ensures correct deployment with CloudFormation.
#### Project configuration (jsconfig.json)
A jsconfig.json file was added to define a pure Node/Lambda environment and remove DOM type conflicts in VS Code.
This prevents false event warnings and enables IntelliSense for AWS types.

```json
{   "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "types": ["node", "aws-lambda"] } }
```
### Outcome
After restarting the TypeScript server, all module and type reconfigured, no warnings in environment. The project now matches a production-grade Node.js Lambda structure, according with best practices for AWS.

## Phase 03: Raise the level - hardening `/tickets`
 **Intent** - raise the minimum REST from the previous phase to the production-baseline: input validation (GET/POST), correct CORS, access control via API Key + Usage Plan, minimum IAM rights, observability (AWS Lambda Powertools + X-Ray), managed log retention, throttling on API Gateway, contract in the form of OpenAPI.

**What added compared to Phase 02**
- **Validation:** `GET /tickets` - mandatory `?limit=` through `RequestValidator` + `RequestParameters`; `POST /tickets` - model `Ticket` with `title` as required і `priority`as {LOW, MEDIUM, HIGH}.
- **CORS:** `OPTIONS` on the resource + consistent headers in Lambda responses (including `x-api-key`).
- **Security:** least-privilege ролі Lambda (`AWSLambdaBasicExecutionRole`, `AWSXRayDaemonWriteAccess`), `ApiKey + UsagePlan` (key is required for `POST`).
- **Observability:** `@aws-lambda-powertools/logger` and `metrics` in both function; `Tracing: Active` (X-Ray).
- **Performance/Scale:** memory tuning (`get:128MB/5s`, `post:256MB/6s`), throttling on Stage (rate/burst).
- **Ergonomics:** export **OpenAPI (OAS 3.0)** with API Gateway.

**Modified files**
- `infrastructure/cloudformation/template.yaml` - Validators/Model, CORS, API Key+Usage Plan, throttling, Log Retention, Tracing.
- `src/handlers/getTicket/index.js` - Powertools, reading `limit`, metrics `TicketsListed`, CORS-headings.
- `src/handlers/createTicket/index.js` - Powertools, validation in code, metrics `TicketCreated`, CORS-headings.
---

```powershell
aws cloudformation package `
  --template-file infrastructure/cloudformation/template.yaml `
  --s3-bucket serhii-saas-devops-artifacts-eu-west-1 `
  --output-template-file aws-cloudformation/packaged.yaml
```
<details><summary>Screenshot - package</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/feature/phase3-hardening/docs/screenshots/phase%2003%20screen21%20-%20package_ok.jpg?raw=true" width="900" alt="package ok"> </details>

####

```powershell
aws cloudformation deploy `
  --template-file aws-cloudformation/packaged.yaml `
  --stack-name tickets-a3 `
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM `
  --parameter-overrides ApiName=tickets-api StageName=v1 ApiKeyValue=dev-key-a3-001-1550da9fdf67 `
  --s3-bucket serhii-saas-devops-artifacts-eu-west-1
```
<details><summary>Screenshot - deploy ok</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/feature/phase3-hardening/docs/screenshots/phase%2003%20screen22%20-%20deploy_ok.jpg?raw=true" width="900" alt="deploy ok"> </details>

After deploying, check the **Outputs** of the stack:

```powershell
aws cloudformation describe-stacks --stack-name tickets-a3 --query "Stacks[0].Outputs" --output table
```
<details><summary>Screenshot - check outputs</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/feature/phase3-hardening/docs/screenshots/phase%2003%20screen22%20-%20check_outputs.jpg?raw=true" width="900" alt="check outputs"> </details>

## Test
#### GET /tickets - 200 OK
```powershell
Invoke-RestMethod -Uri ($env:TICKETS_URL + "?limit=2") -Method GET
```
<details><summary>Screenshot - GET 200 (limit)</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/feature/phase3-hardening/docs/screenshots/phase%2003%20screen24%20-%20GET_200_limit.jpg?raw=true" width="900" alt="GET 200 limit"> </details>

#### GET /tickets - 400 Bad Request (missing limit)
```powershell
curl.exe $env:TICKETS_URL
```
<details><summary>Screenshot - GET 400 (no limit)</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/feature/phase3-hardening/docs/screenshots/phase%2003%20screen25%20-%20GET_400_no_limit.jpg?raw=true" width="900" alt="GET 400 no limit"> </details>

#### POST /tickets - 201 Created
```powershell
$body = @{ title = "A3 ticket"; priority = "MEDIUM" } | ConvertTo-Json
Invoke-RestMethod -Uri $env:TICKETS_URL -Method POST `
  -Headers @{ "x-api-key" = $env:API_KEY; "Content-Type" = "application/json" } `
  -Body $body
```
<details><summary>Screenshot - POST 201</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/feature/phase3-hardening/docs/screenshots/phase%2003%20screen26%20-%20POST_201_with_key.jpg?raw=true" width="900" alt="POST 201"> </details>

#### POST /tickets - 400 Bad Request
```powershell
$body = @{ title = ""; priority = "LOW" } | ConvertTo-Json
Invoke-RestMethod -Uri $TICKETS_URL -Method POST `
  -Headers @{ "x-api-key" = $API_KEY; "Content-Type" = "application/json" } `
  -Body $body
```
<details><summary>Screenshot - POST 400 (invalid body)</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/feature/phase3-hardening/docs/screenshots/phase%2003%20screen27%20-%20POST_400_invalid_body.jpg?raw=true" width="900" alt="POST 400 invalid body"> </details>

#### OPTIONS /tickets - CORS preflight
```powershell
curl.exe -i -X OPTIONS $env:TICKETS_URL
```
<details><summary>Screenshot - OPTIONS CORS</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/feature/phase3-hardening/docs/screenshots/phase%2003%20screen28%20-%20options_cors.jpg?raw=true" width="900" alt="OPTIONS CORS"> </details>

#### OpenAPI (OAS 3.0) export
```powershell
mkdir docs\openapi -Force | Out-Null
aws apigateway get-export `
  --rest-api-id $env:REST_ID `
  --stage-name v1 `
  --export-type oas30 `
  --parameters extensions=integrations `
  --accept application/json docs/openapi/tickets-oas30-v1.json
```
<details><summary>Screenshot - OpenAPI export</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/feature/phase3-hardening/docs/screenshots/phase%2003%20screen29%20-%20openapi_export.jpg?raw=true" width="900" alt="openapi export"> </details>

#### Clean-up
```powershell
aws cloudformation delete-stack --stack-name tickets-a3
aws cloudformation wait stack-delete-complete --stack-name tickets-a3
```
<details><summary>Screenshot - delete stack</summary> <img src="https://github.com/ShamansIT/SaaS_Cloud_DevOps/blob/feature/phase3-hardening/docs/screenshots/phase%2003%20screen30%20-%20delete_stack_ok.jpg?raw=true" width="900" alt="delete stack ok"> </details>


