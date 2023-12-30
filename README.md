# charging

TODO:

- payment
- identity
- local app
  - switch interface
  - phonehome functionality
- server app
  - auth

## UI

- landing page for outlet
  - direct link from qr code
  - shows current status

should the device just update firestore documetns
probably not

Note, the root of the repo is the package 'functions' to be deployed as cloud functions. This is due to CICD limitations of the gcloud run deploy command requiring a go.mod in the subdirectory to have context of the packages used.
