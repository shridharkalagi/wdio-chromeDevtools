import atob from 'atob';
import btoa from 'btoa';
import mockResponse from './mock';

suite('Mock tests using chrome devtools protocol', function () {
    test('Mock the response sample', () => {

        browser.url('http://dummy.restapiexample.com/api/v1/employees');

        browser.cdp('Network', 'enable'); //Enable the CDP Domain
        browser.cdp('Network', 'setRequestInterception', {
            patterns:
                [{
                    urlPattern: '*/v1/employees*',
                    resourceType: 'Document',
                    interceptionStage: 'HeadersReceived'
                }]
        }
        );

        browser.on('Network.requestIntercepted', async (params) => {
            console.log('URL Intercepted - ',params.request.url);

            const response = await browser.cdp('Network', 'getResponseBodyForInterception', {
                interceptionId: params.interceptionId,
            });

            const bodyData = response.base64Encoded ? atob(response.body) : response.body;
            console.log(bodyData); //

            const newHeaders = [
                'Connection: closed',
                'Content-Length: ' + mockResponse.length,
                'Content-Type: application/json;charset=UTF-8'
            ];

            await browser.cdp('Network', 'continueInterceptedRequest', {
                interceptionId: params.interceptionId,
                rawResponse: btoa('HTTP/1.1 200 OK' + '\r\n' + newHeaders.join('\r\n') + '\r\n\r\n' + JSON.stringify(mockResponse))
            });
        });

        browser.url('http://dummy.restapiexample.com/api/v1/employees');

        browser.pause(10000);
    });

});