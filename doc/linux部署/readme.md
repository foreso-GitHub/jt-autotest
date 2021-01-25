1. 按照环境（basicInstall.sh）
2. 下载代码（deploy.sh）
3. copy文件npm-shrinkwrap.json到package.json文件的同级目录
4. npm install
5. 执行初始化（init.sh）
6. 执行测试：node "./node_modules/mocha/bin/_mocha" --ui bdd "./test/start.js"


注1：
解决REFERENCEERROR: primordials is not defined问题
https://www.it610.com/article/1296291835026677760.htm

执行npm run build时提示primordials is not defined错误：

这个问题原因时node版本过高或者gulp版本过低，可以回退node版本到11.15以下，或者升级gulp版本到4以上。接下来介绍的是不需要回退node版本或者升级gulp的方法：

解决办法
方法1
1.如果你的项目不需要经常npm install，可以在package.json文件的同级目录下新建一个npm-shrinkwrap.json文件。

2.里面需要包含的内容：
```
{
  "dependencies": {
    "graceful-fs": {
      "version": "4.2.3"
    }
  }
}
```
3.注意这个文件在执行过一次npm install以后，下次再执行就没有效果了。

方法2
在你的package.json文件里加入以下代码：
```$xslt
{
  // Your current package.json
  "scripts": {
    // Your current package.json scripts
    "preinstall": "npx npm-force-resolutions"
  },
  "resolutions": {
    "graceful-fs": "4.2.3"
  }
}
```

npm-force-resolutions会更改package-lock.json文件来设置graceful-fs到你想要的版本。这个方法每次执行npm install都会生效
