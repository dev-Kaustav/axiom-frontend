import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router';
import { ViewPanel } from './views/ViewPanel.tsx';
import { VIEWS } from './views/catalog.ts';
const rootRoute = createRootRoute({ component: () => <main><Outlet /></main>, notFoundComponent: () => <p>Page not found</p> });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', beforeLoad: () => { throw redirect({ to: '/exposure', replace: true }); } });
const exposureRoute = createRoute({ getParentRoute: () => rootRoute, path: '/exposure', component: () => <ViewPanel view={VIEWS[0]} /> });
export const router = createRouter({ routeTree: rootRoute.addChildren([indexRoute, exposureRoute]), basepath: import.meta.env.BASE_URL.replace(/\/$/, '') });
declare module '@tanstack/react-router' { interface Register { router: typeof router } }
