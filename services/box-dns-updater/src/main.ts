import { SUBDOMAIN_A_RECORD_NAME } from "./constants.ts";
import { updateSubdomainARecord } from "./dns.ts";
import { fetchPublicIp } from "./net.ts";

async function main() {
    const awsAccessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
    const awsSecretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    const hostedZoneId = Deno.env.get("AWS_HOSTED_ZONE_ID");

    if (!awsAccessKeyId || !awsSecretAccessKey || !hostedZoneId) {
        console.error("Missing required environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_HOSTED_ZONE_ID");
        Deno.exit(1);
    }

    const publicIp = await fetchPublicIp();
    console.log(`Current public IP: ${publicIp}`);

    await updateSubdomainARecord(hostedZoneId, publicIp);
    console.log(`Successfully updated A record ${SUBDOMAIN_A_RECORD_NAME} to ${publicIp}`);
}

main();
