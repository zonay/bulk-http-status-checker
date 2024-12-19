"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusChain = void 0;
const axios_1 = __importDefault(require("axios"));
async function getStatusChain(url) {
    const statusChain = [];
    const urlChain = [];
    let initialStatus = null;
    let finalStatus = null;
    try {
        const response = await axios_1.default.head(url, { maxRedirects: 0, validateStatus: null });
        finalStatus = `HTTP/1.1 ${response.status} ${response.statusText}`;
        statusChain.push(finalStatus);
        urlChain.push(url);
        if (response.request.res.responseUrl) {
            initialStatus = `HTTP/1.1 ${response.request.res.statusCode} ${response.request.res.statusMessage}`;
            statusChain.unshift(initialStatus);
            urlChain.unshift(response.request.res.responseUrl);
        }
        return {
            url,
            statusChain,
            urlChain,
            initialStatus: initialStatus || 'No initial status',
            finalStatus: finalStatus || 'No final status',
            destinationUrl: response.request.res.responseUrl || url,
        };
    }
    catch (error) {
        return {
            url,
            statusChain: ['Error occurred'],
            urlChain: [url],
            initialStatus: 'Error',
            finalStatus: 'Error',
            destinationUrl: '',
        };
    }
}
exports.getStatusChain = getStatusChain;
//# sourceMappingURL=statusChecker.js.map