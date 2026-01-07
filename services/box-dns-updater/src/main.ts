import { ChangeResourceRecordSetsCommand, Route53Client } from "@aws-sdk/client-route-53";

const CHECK_IP_URL = "https://checkip.amazonaws.com/";
const SUBDOMAIN_A_RECORD_NAME = "box.gavindhondt.com";
const DNS_RECORD_TTL_SECONDS = 3600;

async function getPublicIp(): Promise<string> {
    const response = await fetch(CHECK_IP_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch IP: ${response.status}`);
    }

    return (await response.text()).trim();
}

async function updateSubdomainARecord(hostedZoneId: string, ip: string): Promise<void> {
    const client = new Route53Client({ region: "us-east-1" });

    const command = new ChangeResourceRecordSetsCommand({
        HostedZoneId: hostedZoneId,
        ChangeBatch: {
            Comment: "Automatic DNS update from box-dns-updater",
            Changes: [
                {
                    Action: "UPSERT",
                    ResourceRecordSet: {
                        Name: SUBDOMAIN_A_RECORD_NAME,
                        Type: "A",
                        TTL: DNS_RECORD_TTL_SECONDS,
                        ResourceRecords: [{ Value: ip }],
                    },
                },
            ],
        },
    });

    await client.send(command);
}

async function main() {
    const awsAccessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
    const awsSecretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    const hostedZoneId = Deno.env.get("AWS_HOSTED_ZONE_ID");

    if (!awsAccessKeyId || !awsSecretAccessKey || !hostedZoneId) {
        console.error("Missing required environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_HOSTED_ZONE_ID");
        Deno.exit(1);
    }

    const publicIp = await getPublicIp();
    console.log(`Current public IP: ${publicIp}`);

    await updateSubdomainARecord(hostedZoneId, publicIp);
    console.log(`Successfully updated A record ${SUBDOMAIN_A_RECORD_NAME} to ${publicIp}`);
}

main();
