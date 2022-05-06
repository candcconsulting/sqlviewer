# SQL Viewer

This viewer was created from the bootstrap, but shows how to display the results of an ecQuery

# Limitations
The query has to be a SELECT query, it has to have the first property as an ecInstanceId and must have a WHERE clause

WHERE 1=1 will suffice

## Environment Variables

Prior to running the app, you will need to add OIDC client configuration to the variables in the .env file:

```
# ---- Authorization Client Settings ----
IMJS_AUTH_CLIENT_CLIENT_ID=""
IMJS_AUTH_CLIENT_REDIRECT_URI=""
IMJS_AUTH_CLIENT_LOGOUT_URI=""
IMJS_AUTH_CLIENT_SCOPES =""
```
