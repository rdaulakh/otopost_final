#!/bin/bash

# AI Social Media Platform - AWS Deployment Script
# This script deploys the complete infrastructure and application to AWS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-production}"
PROJECT_NAME="social-media-ai-platform"

# Required parameters
DOMAIN_NAME=""
CERTIFICATE_ARN=""
KEY_PAIR_NAME=""
DATABASE_PASSWORD=""
REDIS_PASSWORD=""

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if AWS CLI is installed and configured
check_aws_cli() {
    print_status "Checking AWS CLI configuration..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "AWS CLI is properly configured"
}

# Function to validate required parameters
validate_parameters() {
    print_status "Validating deployment parameters..."
    
    if [[ -z "$DOMAIN_NAME" ]]; then
        print_error "DOMAIN_NAME is required"
        exit 1
    fi
    
    if [[ -z "$CERTIFICATE_ARN" ]]; then
        print_error "CERTIFICATE_ARN is required"
        exit 1
    fi
    
    if [[ -z "$KEY_PAIR_NAME" ]]; then
        print_error "KEY_PAIR_NAME is required"
        exit 1
    fi
    
    if [[ -z "$DATABASE_PASSWORD" ]]; then
        print_error "DATABASE_PASSWORD is required"
        exit 1
    fi
    
    if [[ -z "$REDIS_PASSWORD" ]]; then
        print_error "REDIS_PASSWORD is required"
        exit 1
    fi
    
    print_success "All required parameters are provided"
}

# Function to create S3 bucket for CloudFormation templates
create_cf_bucket() {
    local bucket_name="${PROJECT_NAME}-${ENVIRONMENT}-cloudformation-${RANDOM}"
    
    print_status "Creating S3 bucket for CloudFormation templates..."
    
    aws s3 mb "s3://${bucket_name}" --region "$AWS_REGION"
    
    # Upload CloudFormation templates
    aws s3 cp "${SCRIPT_DIR}/../cloudformation/" "s3://${bucket_name}/templates/" --recursive
    
    echo "$bucket_name"
}

# Function to deploy CloudFormation stack
deploy_infrastructure() {
    local cf_bucket="$1"
    local stack_name="${PROJECT_NAME}-${ENVIRONMENT}-infrastructure"
    
    print_status "Deploying infrastructure stack: $stack_name"
    
    aws cloudformation deploy \
        --template-file "${SCRIPT_DIR}/../cloudformation/main-infrastructure.yaml" \
        --stack-name "$stack_name" \
        --parameter-overrides \
            Environment="$ENVIRONMENT" \
            ProjectName="$PROJECT_NAME" \
            DomainName="$DOMAIN_NAME" \
            CertificateArn="$CERTIFICATE_ARN" \
            KeyPairName="$KEY_PAIR_NAME" \
            DatabasePassword="$DATABASE_PASSWORD" \
            RedisPassword="$REDIS_PASSWORD" \
        --capabilities CAPABILITY_NAMED_IAM \
        --region "$AWS_REGION" \
        --tags \
            Environment="$ENVIRONMENT" \
            Project="$PROJECT_NAME" \
            ManagedBy="CloudFormation"
    
    print_success "Infrastructure stack deployed successfully"
}

# Function to get stack outputs
get_stack_outputs() {
    local stack_name="${PROJECT_NAME}-${ENVIRONMENT}-infrastructure"
    
    print_status "Retrieving stack outputs..."
    
    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$AWS_REGION" \
        --query 'Stacks[0].Outputs' \
        --output table
}

# Function to create application secrets in AWS Systems Manager
create_secrets() {
    print_status "Creating application secrets in AWS Systems Manager..."
    
    # Create parameter store entries for sensitive configuration
    aws ssm put-parameter \
        --name "/${PROJECT_NAME}/${ENVIRONMENT}/database/password" \
        --value "$DATABASE_PASSWORD" \
        --type "SecureString" \
        --overwrite \
        --region "$AWS_REGION"
    
    aws ssm put-parameter \
        --name "/${PROJECT_NAME}/${ENVIRONMENT}/redis/password" \
        --value "$REDIS_PASSWORD" \
        --type "SecureString" \
        --overwrite \
        --region "$AWS_REGION"
    
    # Create placeholder for other secrets (to be updated manually)
    aws ssm put-parameter \
        --name "/${PROJECT_NAME}/${ENVIRONMENT}/jwt/secret" \
        --value "CHANGE_ME_$(openssl rand -hex 32)" \
        --type "SecureString" \
        --overwrite \
        --region "$AWS_REGION"
    
    aws ssm put-parameter \
        --name "/${PROJECT_NAME}/${ENVIRONMENT}/jwt/admin-secret" \
        --value "CHANGE_ME_$(openssl rand -hex 32)" \
        --type "SecureString" \
        --overwrite \
        --region "$AWS_REGION"
    
    print_success "Application secrets created in Parameter Store"
}

# Function to setup monitoring and logging
setup_monitoring() {
    print_status "Setting up CloudWatch monitoring and logging..."
    
    # Create CloudWatch Log Groups
    aws logs create-log-group \
        --log-group-name "/aws/ec2/${PROJECT_NAME}-${ENVIRONMENT}/application" \
        --region "$AWS_REGION" || true
    
    aws logs create-log-group \
        --log-group-name "/aws/ec2/${PROJECT_NAME}-${ENVIRONMENT}/system" \
        --region "$AWS_REGION" || true
    
    print_success "CloudWatch monitoring and logging configured"
}

# Function to create Route 53 DNS records
setup_dns() {
    local alb_dns="$1"
    
    print_status "Setting up Route 53 DNS records..."
    
    # Get hosted zone ID for the domain
    local hosted_zone_id=$(aws route53 list-hosted-zones-by-name \
        --dns-name "$DOMAIN_NAME" \
        --query 'HostedZones[0].Id' \
        --output text \
        --region "$AWS_REGION" | sed 's|/hostedzone/||')
    
    if [[ "$hosted_zone_id" == "None" ]]; then
        print_warning "No hosted zone found for $DOMAIN_NAME. Please create DNS records manually."
        return
    fi
    
    # Create A record pointing to ALB
    cat > /tmp/dns-record.json << EOF
{
    "Changes": [
        {
            "Action": "UPSERT",
            "ResourceRecordSet": {
                "Name": "$DOMAIN_NAME",
                "Type": "A",
                "AliasTarget": {
                    "DNSName": "$alb_dns",
                    "EvaluateTargetHealth": false,
                    "HostedZoneId": "Z35SXDOTRQ7X7K"
                }
            }
        }
    ]
}
EOF
    
    aws route53 change-resource-record-sets \
        --hosted-zone-id "$hosted_zone_id" \
        --change-batch file:///tmp/dns-record.json \
        --region "$AWS_REGION"
    
    rm /tmp/dns-record.json
    
    print_success "DNS records created successfully"
}

# Function to validate deployment
validate_deployment() {
    print_status "Validating deployment..."
    
    # Check if ALB is healthy
    local stack_name="${PROJECT_NAME}-${ENVIRONMENT}-infrastructure"
    local alb_dns=$(aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$AWS_REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
        --output text)
    
    print_status "Waiting for load balancer to become healthy..."
    sleep 60
    
    # Test health endpoint
    if curl -f "https://$alb_dns/api/v1/health" &> /dev/null; then
        print_success "Application is responding to health checks"
    else
        print_warning "Application health check failed. This may be normal during initial deployment."
    fi
}

# Function to display deployment summary
display_summary() {
    local stack_name="${PROJECT_NAME}-${ENVIRONMENT}-infrastructure"
    
    print_success "Deployment completed successfully!"
    echo
    echo "=== DEPLOYMENT SUMMARY ==="
    echo "Environment: $ENVIRONMENT"
    echo "Region: $AWS_REGION"
    echo "Stack Name: $stack_name"
    echo "Domain: $DOMAIN_NAME"
    echo
    echo "=== NEXT STEPS ==="
    echo "1. Update application secrets in AWS Systems Manager Parameter Store"
    echo "2. Configure social media API keys and credentials"
    echo "3. Test the application endpoints"
    echo "4. Set up monitoring alerts and dashboards"
    echo
    echo "=== USEFUL COMMANDS ==="
    echo "View stack outputs:"
    echo "  aws cloudformation describe-stacks --stack-name $stack_name --region $AWS_REGION"
    echo
    echo "View application logs:"
    echo "  aws logs tail /aws/ec2/${PROJECT_NAME}-${ENVIRONMENT}/application --follow --region $AWS_REGION"
    echo
    echo "Update stack:"
    echo "  ./deploy.sh --update"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  --domain DOMAIN_NAME        Domain name for the application (required)"
    echo "  --cert CERTIFICATE_ARN      ARN of SSL certificate (required)"
    echo "  --key KEY_PAIR_NAME         EC2 Key Pair name (required)"
    echo "  --db-password PASSWORD      MongoDB password (required)"
    echo "  --redis-password PASSWORD  Redis password (required)"
    echo "  --environment ENV           Environment (development|staging|production)"
    echo "  --region REGION             AWS region (default: us-east-1)"
    echo "  --update                    Update existing stack"
    echo "  --help                      Show this help message"
    echo
    echo "Example:"
    echo "  $0 --domain example.com --cert arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012 --key my-key-pair --db-password mydbpass123 --redis-password myredispass123"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --domain)
            DOMAIN_NAME="$2"
            shift 2
            ;;
        --cert)
            CERTIFICATE_ARN="$2"
            shift 2
            ;;
        --key)
            KEY_PAIR_NAME="$2"
            shift 2
            ;;
        --db-password)
            DATABASE_PASSWORD="$2"
            shift 2
            ;;
        --redis-password)
            REDIS_PASSWORD="$2"
            shift 2
            ;;
        --environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --region)
            AWS_REGION="$2"
            shift 2
            ;;
        --update)
            UPDATE_MODE=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main deployment flow
main() {
    print_status "Starting AWS deployment for $PROJECT_NAME ($ENVIRONMENT)"
    
    # Pre-deployment checks
    check_aws_cli
    validate_parameters
    
    # Create CloudFormation bucket
    CF_BUCKET=$(create_cf_bucket)
    
    # Deploy infrastructure
    deploy_infrastructure "$CF_BUCKET"
    
    # Get stack outputs
    get_stack_outputs
    
    # Create application secrets
    create_secrets
    
    # Setup monitoring
    setup_monitoring
    
    # Get ALB DNS for Route 53 setup
    local stack_name="${PROJECT_NAME}-${ENVIRONMENT}-infrastructure"
    local alb_dns=$(aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$AWS_REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
        --output text)
    
    # Setup DNS
    setup_dns "$alb_dns"
    
    # Validate deployment
    validate_deployment
    
    # Display summary
    display_summary
    
    # Cleanup
    aws s3 rb "s3://${CF_BUCKET}" --force
}

# Run main function
main "$@"

