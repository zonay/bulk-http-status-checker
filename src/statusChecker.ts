import axios, { AxiosError } from 'axios';
import https from 'https';

export interface StatusCheckResult {
    url: string;
    statusChain: string[];
    urlChain: string[];
    initialStatus: string;
    finalStatus: string;
    destinationUrl: string;
}

export async function getStatusChain(url: string): Promise<StatusCheckResult> {
    const statusChain: string[] = [];
    const urlChain: string[] = [];

    // More aggressive SSL bypass configuration
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    const config = {
        maxRedirects: 0,
        validateStatus: () => true,
        timeout: 10000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
            checkServerIdentity: () => undefined
        }),
        insecureHTTPParser: true
    };

    try {
        const response = await axios.get(url, config);
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
            if (!location) break;

            currentUrl = new URL(location, currentUrl).href;
            try {
                currentResponse = await axios.get(currentUrl, config);
                urlChain.push(currentUrl);
                statusChain.push(`HTTP/1.1 ${currentResponse.status} ${currentResponse.statusText}`);
            } catch (redirectError) {
                break;
            }

            if (urlChain.length > 5) break; // Prevent redirect loops
        }

        return {
            url,
            statusChain,
            urlChain,
            initialStatus: statusChain[0],
            finalStatus: statusChain[statusChain.length - 1],
            destinationUrl: urlChain[urlChain.length - 1]
        };
    } catch (error: unknown) {
        let errorStatus = 'Error';
        let errorMessage = 'Unknown error';

        if (axios.isAxiosError(error)) {
            errorMessage = error.message;
            if (error.response?.status) {
                errorStatus = String(error.response.status);
            }
        } else if (error instanceof Error) {
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