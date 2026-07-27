const routes = {};
let currentRoute = null;

export function route(path, handler) {
    routes[path] = handler;
}

export function navigate(path) {
    window.location.hash = `#${path}`;
}

function handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const handler = routes[hash];

    if (handler) {
        currentRoute = hash;
        handler();
    } else {
        navigate('/');
    }
}

export function getCurrentRoute() {
    return currentRoute;
}

export function refreshRoute() {
    handleRoute();
}

export function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}
