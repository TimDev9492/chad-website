/**
 * This file is necessary to ensure protection of all routes in the `locations`
 * directory. It makes the routes in this directory _dynamic_ routes, which
 * send a server request, and thus trigger `hooks.server.ts`.
 **/
