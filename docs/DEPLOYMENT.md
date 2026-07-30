# Web Application Deployment & AWS OIDC Configuration Guide

This guide details the complete deployment setup for `mapanytime-market-web`, including GitHub Actions OIDC authentication with AWS, ECR repository access, EC2 deployment configuration, and troubleshooting steps.

---

## AWS Setup Parameters

- **AWS Region**: `ap-southeast-1`
- **ECR Repository**: `mapanytime-web` (`arn:aws:ecr:ap-southeast-1:<AWS_ACCOUNT_ID>:repository/mapanytime-web`)
- **IAM Role Name**: `mapanytime-web-deploy`
- **IAM Role ARN**: `arn:aws:iam::<AWS_ACCOUNT_ID>:role/mapanytime-web-deploy`
- **OIDC Identity Provider**: `https://token.actions.githubusercontent.com`
- **Audience**: `sts.amazonaws.com`
- **Frontend Port**: `4000` (Production) / `3000` (Staging)

---

## Step 1: Register GitHub as an Identity Provider in AWS

1. Log into **AWS Console** → Navigate to **IAM** → **Identity providers** (left sidebar) → **Add provider**.
2. Select **OpenID Connect**.
3. Set **Provider URL**: `https://token.actions.githubusercontent.com` → Click **Get thumbprint**.
4. Set **Audience**: `sts.amazonaws.com`.
5. Click **Add provider**.

---

## Step 2: Create the IAM OIDC Role

1. Go to **IAM** → **Roles** → **Create role**.
2. Select **Trusted entity type**: `Web identity`.
3. Choose **Identity provider**: `token.actions.githubusercontent.com`.
4. Choose **Audience**: `sts.amazonaws.com`.
5. Specify **GitHub Organization**: `FORHU`, **Repository**: `mapanytime-market-web` (leave branch blank to allow dispatch from any branch).
6. Click **Next** (do not attach any managed policy yet).
7. Name the role: `mapanytime-web-deploy` → Click **Create role**.

_The Trust Policy created by AWS matches `infra/aws-oidc-trust-policy.json`:_

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<AWS_ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:FORHU/mapanytime-market-web:*"
        }
      }
    }
  ]
}
```

---

## Step 3: Attach ECR Push Permissions Policy

1. Open role `mapanytime-web-deploy` → **Permissions** tab → **Add permissions** → **Create inline policy**.
2. Switch to **JSON** view and paste contents from `infra/aws-oidc-policy.json` (replacing `<AWS_ACCOUNT_ID>` with your AWS Account ID):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ecr:GetAuthorizationToken",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage"
      ],
      "Resource": "arn:aws:ecr:ap-southeast-1:<AWS_ACCOUNT_ID>:repository/mapanytime-web"
    }
  ]
}
```

3. Click **Next** → Name the policy `ecr-push` → Click **Create policy**.

---

## Step 4: Configure GitHub Repository Secrets

In GitHub repository **Settings** → **Secrets and variables** → **Actions** (or Environment Secrets under `production` / `staging`):

| Secret Name      | Value                                                      |
| ---------------- | ---------------------------------------------------------- |
| `AWS_ROLE_ARN`   | `arn:aws:iam::<AWS_ACCOUNT_ID>:role/mapanytime-web-deploy` |
| `AWS_REGION`     | `ap-southeast-1`                                           |
| `ECR_REGISTRY`   | `<AWS_ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com`    |
| `ECR_REPOSITORY` | `mapanytime-web`                                           |
| `EC2_HOST`       | `<your-ec2-ip-or-dns>`                                     |
| `EC2_USERNAME`   | `ubuntu` (or `ec2-user`)                                   |
| `EC2_SSH_KEY`    | `<ssh-private-key>`                                        |

_(Note: The workflow also supports `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` fallback if OIDC is disabled.)_

---

## Step 5: Trigger / Re-run Deployment

1. Go to **GitHub Actions** → Select **Deploy Production** or **Deploy Staging**.
2. Click **Run workflow** or **Re-run failed jobs**.

---

## Step 6: EC2 Verification & Security Group Check

Once the workflow finishes successfully, verify web access on port `4000`:

```bash
curl -I http://<EC2-HOST-OR-IP>:4000/
```

- If `curl` times out, check AWS EC2 Security Group rules for the EC2 instance and ensure inbound traffic on port `4000` is allowed (`0.0.0.0/0`).
- If health check on port `4001` fails during workflow execution, check `docker logs mapanytime-client-new` on the EC2 host.
