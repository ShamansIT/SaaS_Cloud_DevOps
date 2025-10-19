# SaaS Cloud DevOps

![Bootstrap CI/CD Status](https://github.com/ShamansIT/SaaS_Cloud_DevOps/actions/workflows/bootstrap.yml/badge.svg)

This repository provides **production-grade multi-stack DevOps implementation** integrating:
- **AWS Serverless architecture** (Lambda, API Gateway, CloudFormation)
- **End-to-end CI/CD automation** via GitHub Actions with Infrastructure as Code validation
- **Cross-platform scripting and observability** with Node.js, Python, and AWS Powertools

The goal of this project is to establish a **scalable, secure, and maintainable DevOps environment** that aligns with enterprise-grade delivery standards and cross-cloud best practices, combining AWS automation within a unified workflow.

---

## Project Overview
### Phase 01: API Gateway Request Validation - CloudFormation

**Foundation source** – [AWS CloudFormation template of a sample API with basic request validation](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-validation-sample-cloudformation.html).

#### First Project Increment 
Built basic REST API у **API Gateway (REST API)** with **request validation** through **Models** and **RequestValidators** in **CloudFormation**.  On this stage without Lambda - integration **HTTP_PROXY** based on PetStore demo.  

**Intent** - showcase backend input control and pure IaC implementation.

## Base
- Official example used:  **AWS - API Gateway request validation sample (CloudFormation)**.  
- Key elements reproduced: model for body `POST`, validator for `GET` (query) and `POST` (body), resource `/validation`, `Deployment` і `Stage`.  
- Added custom tests and screenshots.

## Implemented Report
  **Resource:** `/validation`
- **GET /validation?q1=...** - mandatory query-parameter `q1` (validation at the level API GW)
- **POST /validation** - перевірка JSON-body by **Model** (required fields, ranges)
- **Integration:** `HTTP_PROXY` → PetStore (Lambda will implement on Phase 02)
- **IaC:** one CFN-template `aws-cloudformation/apigw-request-validation.yaml`
---

## Files
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

####