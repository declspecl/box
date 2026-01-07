package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/route53"
	"github.com/aws/aws-sdk-go-v2/service/route53/types"
	"github.com/joho/godotenv"
)

const (
	checkIpUrl   = "https://checkip.amazonaws.com/"
	recordName   = "box.gavindhondt.com"
	dnsRecordTtl = 3600
)

func main() {
	envFilePath, _ := filepath.Abs(".env")
	if err := godotenv.Load(envFilePath); err != nil {
		log.Printf("Warning: Could not load %s: %v", envFilePath, err)
		log.Println("Falling back to environment variables")
	}

	awsAccessKeyId := os.Getenv("AWS_ACCESS_KEY_ID")
	awsSecretAccessKey := os.Getenv("AWS_SECRET_ACCESS_KEY")
	hostedZoneId := os.Getenv("AWS_HOSTED_ZONE_ID")

	if awsAccessKeyId == "" || awsSecretAccessKey == "" || hostedZoneId == "" {
		log.Fatal("Missing required environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_HOSTED_ZONE_ID")
	}

	publicIp, err := getPublicIp()
	if err != nil {
		log.Fatalf("Failed to get public IP: %v", err)
	}
	log.Printf("Current public IP: %s", publicIp)

	if err := updateSubdomainARecord(context.Background(), awsAccessKeyId, awsSecretAccessKey, hostedZoneId, publicIp); err != nil {
		log.Fatalf("Failed to update Route53 record: %v", err)
	}

	log.Printf("Successfully updated A record %s to %s", recordName, publicIp)
}

func getPublicIp() (string, error) {
	resp, err := http.Get(checkIpUrl)
	if err != nil {
		return "", fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %w", err)
	}

	ip := strings.TrimSpace(string(body))
	if ip == "" {
		return "", fmt.Errorf("empty IP response")
	}

	return ip, nil
}

func updateSubdomainARecord(
	ctx context.Context,
	awsAccessKeyId string,
	awsSecretAccessKey string,
	hostedZoneId string,
	ip string,
) error {
	cfg, err := config.LoadDefaultConfig(
		ctx,
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(awsAccessKeyId, awsSecretAccessKey, "")),
		config.WithRegion("us-east-1"),
	)
	if err != nil {
		return fmt.Errorf("failed to load AWS config: %w", err)
	}

	client := route53.NewFromConfig(cfg)

	input := route53.ChangeResourceRecordSetsInput{
		HostedZoneId: aws.String(hostedZoneId),
		ChangeBatch: &types.ChangeBatch{
			Comment: aws.String("Automatic DNS update from box-dns-updater"),
			Changes: []types.Change{
				{
					Action: types.ChangeActionUpsert,
					ResourceRecordSet: &types.ResourceRecordSet{
						Name: aws.String(recordName),
						Type: types.RRTypeA,
						TTL:  aws.Int64(dnsRecordTtl),
						ResourceRecords: []types.ResourceRecord{
							{
								Value: aws.String(ip),
							},
						},
					},
				},
			},
		},
	}

	_, err = client.ChangeResourceRecordSets(ctx, &input)
	if err != nil {
		return fmt.Errorf("failed to change record sets: %w", err)
	}

	return nil
}
