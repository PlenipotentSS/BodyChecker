#BodyChecker

- Uses Algorithmia's Body Detection: [https://algorithmia.com/algorithms/opencv/BodyDetection].
- Uses Node.js 

to install:
- setup algorithmia login and api key. 
- create .env file with required environment variables:

```
ALGO_API_KEY=
ALGO_USERNAME=
ALGO_FOLDER_NAME=
```

- run npm install

to use:
- in command line:

```
node index.js [url for image file]
```

to use BodyChecker:

```
var bodyDetect = new BodyChecker([url for image]);
bc.run(function(hasBody) {
  /// hasBody is true or false
});

```
