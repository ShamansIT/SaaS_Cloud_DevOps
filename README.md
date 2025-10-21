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

### Get Invoke URL:

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
