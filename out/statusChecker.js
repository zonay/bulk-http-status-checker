"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusChain = void 0;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
async function getStatusChain(url) {
    const statusChain = [];
    const urlChain = [];
    // More aggressive SSL bypass configuration
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const config = {
        maxRedirects: 0,
        validateStatus: () => true,
        timeout: 10000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        httpsAgent: new https_1.default.Agent({
            rejectUnauthorized: false,
            checkServerIdentity: () => undefined
        }),
        insecureHTTPParser: true
    };
    try {
        const response = await axios_1.default.get(url, config);
        urlChain.push(url);
        // Get actual status from response
        const status = response.status || response.request?.res?.statusCode || 0;
        const statusText = response.statusText || response.request?.res?.statusMessage || 'Unknown';
        statusChain.push(`HTTP/1.1 ${status} ${statusText}`);
        let currentUrl = url;
        let currentResponse = response;
        // Handle redirects
        while (currentResponse.status >= 300 && currentResponse.status < 400) {
            const location = currentResponse.headers?.location;
            if (!location)
                break;
            currentUrl = new URL(location, currentUrl).href;
            try {
                currentResponse = await axios_1.default.get(currentUrl, config);
                urlChain.push(currentUrl);
                statusChain.push(`HTTP/1.1 ${currentResponse.status} ${currentResponse.statusText}`);
            }
            catch (redirectError) {
                break;
            }
            if (urlChain.length > 5)
                break; // Prevent redirect loops
        }
        return {
            url,
            statusChain,
            urlChain,
            initialStatus: statusChain[0],
            finalStatus: statusChain[statusChain.length - 1],
            destinationUrl: urlChain[urlChain.length - 1]
        };
    }
    catch (error) {
        let errorStatus = 'Error';
        let errorMessage = 'Unknown error';
        if (axios_1.default.isAxiosError(error)) {
            errorMessage = error.message;
            if (error.response?.status) {
                errorStatus = String(error.response.status);
            }
        }
        else if (error instanceof Error) {
            errorMessage = error.message;
        }
        return {
            url,
            statusChain: [`${errorStatus}: ${errorMessage}`],
            urlChain: [url],
            initialStatus: 'Error',
            finalStatus: `Error: ${errorMessage}`,
            destinationUrl: url
        };
    }
}
exports.getStatusChain = getStatusChain;
//# sourceMappingURL=statusChecker.js.map