function fetchRequest(url, method = 'GET', headers = {}) {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-undef
        fetch(url, {
            method,
            headers,
        })
            .then(response => response.json())
            .then(responseJson => {
                resolve(responseJson);
            })
            .catch(err => {
                console.log('[fetch request error] ', err);
                reject(err);
            });
    });
}
export { fetchRequest };
