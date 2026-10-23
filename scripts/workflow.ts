import { CAMPAIGN_BRIEF_JSON_SCHEMA, CAMPAIGN_PLAN_JSON_SCHEMA, CONTRACT_VERSION, validateSchema } from "../src/lib/schema.ts";
import { buildProviderRequest, parseProviderResponse } from "../src/lib/provider-contract.ts";
import { validateCallbackDestination } from "../src/lib/callback-destination.ts";
export function buildWorkflow() {
  const shared = "const CONTRACT_VERSION=" + CONTRACT_VERSION + ";\nconst CAMPAIGN_BRIEF_JSON_SCHEMA=" + JSON.stringify(CAMPAIGN_BRIEF_JSON_SCHEMA) + ";\nconst CAMPAIGN_PLAN_JSON_SCHEMA=" + JSON.stringify(CAMPAIGN_PLAN_JSON_SCHEMA) + ";\n" + validateSchema.toString() + "\n";
  const prepare = shared + buildProviderRequest.toString() + "\n" + validateCallbackDestination.toString() + `
const provider = "groq";
const model = "openai/gpt-oss-120b"; // Groq model identifier; availability and quotas are account-dependent.
const context = $json.body;
const callbackUrl = validateCallbackDestination(context?.callbackUrl, $env.CAMPAIGN_CALLBACK_URL);
return [{json:{context, callbackUrl, request: buildProviderRequest(provider, model, context)}}];`;
  const normalize = shared + parseProviderResponse.toString() + `
const context = $('Prepare request').first().json.context;
const result = parseProviderResponse($json);
return [{json:{statusCode:result.ok ? 200 : result.error.code === "timeout" ? 504 : 502, body:{...result, contractVersion:CONTRACT_VERSION, briefId:context.briefId, attemptId:context.attemptId}}}];`;
  const link = (node: string) => ({ node, type: "main", index: 0 });
  return { name: "Campaign Brief Studio - contract v1", nodes: [
    { id: "webhook", name: "Campaign webhook", type: "n8n-nodes-base.webhook", typeVersion: 2, position: [200, 300], parameters: { httpMethod: "POST", path: "campaign-brief-studio", responseMode: "onReceived", authentication: "headerAuth", options: {} }, notes: "REQUIRED: select Header Auth credential: name x-campaign-webhook-secret, value equal to app N8N_WEBHOOK_SECRET. Missing credentials must fail closed.", notesInFlow: true },
    { id: "prepare", name: "Prepare request", type: "n8n-nodes-base.code", typeVersion: 2, position: [420, 300], parameters: { jsCode: prepare } },
    { id: "groq", name: "Groq response", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [850, 180], onError: "continueRegularOutput", parameters: {
      method: "POST", url: "https://api.groq.com/openai/v1/chat/completions", authentication: "genericCredentialType", genericAuthType: "httpHeaderAuth",
      sendBody: true, contentType: "json", specifyBody: "json", jsonBody: "={{ $json.request }}",
      options: { timeout: 35000, response: { response: { fullResponse: true, neverError: true, responseFormat: "json" } } }
    }, notes: "REQUIRED: select a separate Header Auth credential: Authorization = Bearer <Groq API key>. The openai/ model prefix is a model identifier, not an OpenAI API credential. Never reuse the webhook or callback credential.", notesInFlow: true },
    { id: "normalize", name: "Validate response", type: "n8n-nodes-base.code", typeVersion: 2, position: [1070, 180], parameters: { jsCode: normalize } },
    { id: "respond", name: "Callback result", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [1290, 300], retryOnFail: true, maxTries: 3, waitBetweenTries: 1000, parameters: { method: "POST", url: "={{ $('Prepare request').first().json.callbackUrl }}", authentication: "genericCredentialType", genericAuthType: "httpHeaderAuth", sendBody: true, specifyBody: "json", jsonBody: "={{ $json.body }}", options: { timeout: 10000, redirect: { redirect: { followRedirects: false } } } }, notes: "REQUIRED: separate Header Auth credential: x-campaign-callback-secret = app N8N_CALLBACK_SECRET. Set n8n CAMPAIGN_CALLBACK_URL to the exact app callback URL (Compose sets this). Request URLs must match this local destination. Success and failure envelopes are delivered; HTTP errors stop the execution after three tries. No durable delivery guarantee; inspect failed executions/logs. Missing credentials must fail closed.", notesInFlow: true },
    { id: "approved", name: "Approved webhook", type: "n8n-nodes-base.webhook", typeVersion: 2, position: [200, 500], parameters: { httpMethod: "POST", path: "campaign-brief-approved", authentication: "headerAuth", responseMode: "onReceived" } },
    { id: "slack", name: "Slack notification", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [420, 500], parameters: { method: "POST", url: "={{ $env.SLACK_WEBHOOK_URL }}", sendBody: true, specifyBody: "json", jsonBody: "={{ { text: 'Campaign approved for ' + $json.body.brief.businessName + '!\\n\\n' + $json.body.plan.briefSummary } }}" } },
  ], connections: {
    "Campaign webhook": { main: [[link("Prepare request")]] },
    "Prepare request": { main: [[link("Groq response")]] },
    "Groq response": { main: [[link("Validate response")]] },
    "Validate response": { main: [[link("Callback result")]] },
    "Approved webhook": { main: [[link("Slack notification")]] },
  }, active: false, settings: { executionOrder: "v1", saveDataSuccessExecution: "none", saveDataErrorExecution: "none" } };
}
