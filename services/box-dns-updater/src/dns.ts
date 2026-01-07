import { DNS_RECORD_TTL_SECONDS, SUBDOMAIN_A_RECORD_NAME } from "./constants.ts";
import { ChangeResourceRecordSetsCommand, Route53Client } from "@aws-sdk/client-route-53";

export async function updateSubdomainARecord(hostedZoneId: string, ip: string) {
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
