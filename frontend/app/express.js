const express = require('express');
const app = express();
const portNumber = process.env.REACT_APP_PRD_PORT;
const sourceDir = 'dist';

app.use(express.static(sourceDir));

// https://dev-daikichi.hatenablog.com/entry/2019/04/17/144159
app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/' + sourceDir + '/index.html');
});

app.listen(portNumber, () => {
  console.log(`Express web server started: http://localhost:${portNumber}`);
  console.log(`Serving content from /${sourceDir}/`);
});
