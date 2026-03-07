import { input, select } from "@inquirer/prompts";
import { Client } from "@modelcontextprotocol/sdk/client";

export class ResourceHandler {
    constructor(private client: Client) {}

    async handleResources(resources: any[], resourceTemplates: any[]) {
        const resourceUrl = await select({
            message: "Please select a resource!",
            choices: [
                ...resources.map(r => ({
                    name: r.title || r.name,
                    value: r.uri,
                    description: r.description || ''
                })),
                ...resourceTemplates.map(rt => ({
                    name: rt.title || rt.name,
                    value: rt.uriTemplate,
                    description: rt.description || ''
                }))
            ],
        });

        console.log('resourceUrl', resourceUrl);
        const uri = resources.find(t => t.uri === resourceUrl)?.uri ?? 
                   resourceTemplates.find(rt => rt.uriTemplate === resourceUrl)?.uriTemplate;

        if (!uri) {
            console.error("Resource not found");
            return;
        }

        await this.handleResource(uri);
    }

    private async handleResource(uri: string) {
        let finalUri = uri;

        // extract parameters from URI template
        const paramsMatches = finalUri.match(/(?<=\{).*?(?=\})/g);

        // make URL dynamic
        // user://{id}    -------> user://4
        if (paramsMatches !== null) {
            for (let paramsMatch of paramsMatches) {
                const paramValue = await input({
                    message: `Enter the parameter value of ${paramsMatch} : `
                });

                // make value dynamic for this particular param
                finalUri = finalUri.replace(`{${paramsMatch}}`, paramValue);
            }
        }

        // finally get the resource
        const res = await this.client.readResource({
            uri: finalUri
        });

        const content = res?.contents?.[0];
        if (content) {
            const resourceText = 'text' in content ? content.text : content.blob;
            
            try {
                const formattedResource = JSON.parse(resourceText);
                console.log(finalUri, ' : ', JSON.stringify(formattedResource, null, 2));
            } catch (parseError) {
                console.log(finalUri, ' : ', resourceText);
            }
        } else {
            console.log(finalUri, ' : ', 'No content available');
        }
    }
}
