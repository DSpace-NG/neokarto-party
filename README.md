# DSpace App: Action Slim

## Dev setup

First of all you need nodejs with npm, you can easily install it using
[nvm](https://github.com/creationix/nvm). Once you have it working you
need *bower*, *grunt-cli* and *pm2* installed globally:

```shell
$ npm install -g bower grunt-cli pm2
```

next install local dependencies with:
```shell
$ npm install
$ bower install
```

once it succeeds, start taks runner:
```shell
$ grunt
```

and open in your browser http://localhost:8000

once you kill grunt process you can see still running daemons with:
```shell
$ pm2 ls
```
currently you need to kill it manualy before running grunt again!
```shell
$ pm2 kill
```
