const templates = [{
  html: (title, code) => `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Highlighter</title>
    <link id="theme-link" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/base16/dracula.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Fira Code', monospace;
        }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: transparent;
            padding: 20px;
        }
        .code-container {
            background: rgba(30, 30, 30, 0.95);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            padding: 24px;
            width: 100%;
            max-width: 900px;
            position: relative;
            overflow: hidden;
        }
        .buttons {
            position: absolute;
            top: 12px;
            left: 16px;
            display: flex;
            gap: 8px;
        }
        .button {
            width: 14px;
            height: 14px;
            border-radius: 50%;
        }
        .red { background: #ff5f56; }
        .yellow { background: #ffbd2e; }
        .green { background: #27c93f; }
        .title {
            color: white;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin-top: 10px;
        }
        pre {
            margin: 20px 0 0;
            overflow-x: auto;
        }
        code {
            font-size: 15px;
            white-space: pre-wrap;
            word-break: break-word;
        }
    </style>
</head>
<body>

<div class="code-container">
    <div class="buttons">
        <span class="button red"></span>
        <span class="button yellow"></span>
        <span class="button green"></span>
    </div>
    <div class="title" id="codeTitle"></div>
    <pre><code id="codeBlock" class="language-javascript"></code></pre>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script>
    document.getElementById("codeTitle").innerText = "${title}";
    document.getElementById("codeBlock").innerText = "${code}";
    document.getElementById("theme-link").href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/base16/dracula.min.css";

    setTimeout(() => hljs.highlightAll(), 100);
</script>

</body>
</html>`
}, {
  html: (title, code) => `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Highlighter</title>
    <link id="theme-link" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/base16/dracula.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Fira Code', monospace;
        }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: transparent;
            padding: 20px;
        }
        .code-container {
            background: rgba(30, 30, 30, 0.95);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            padding: 24px;
            width: 100%;
            max-width: 900px;
            position: relative;
            overflow: hidden;
        }
        .buttons {
            position: absolute;
            top: 12px;
            left: 16px;
            display: flex;
            gap: 8px;
        }
        .button {
            width: 14px;
            height: 14px;
            border-radius: 50%;
        }
        .red { background: #ff5f56; }
        .yellow { background: #ffbd2e; }
        .green { background: #27c93f; }
        .title {
            color: white;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin-top: 10px;
        }
        pre {
            margin: 20px 0 0;
            overflow-x: auto;
        }
        code {
            font-size: 15px;
            white-space: pre-wrap;
            word-break: break-word;
        }
    </style>
</head>
<body>

<div class="code-container">
    <div class="buttons">
        <span class="button red"></span>
        <span class="button yellow"></span>
        <span class="button green"></span>
    </div>
    <div class="title" id="codeTitle"></div>
    <pre><code id="codeBlock" class="language-javascript"></code></pre>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script>
    document.getElementById("codeTitle").innerText = "${title}";
    document.getElementById("codeBlock").innerText = "${code}";
    document.getElementById("theme-link").href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/base16/dracula.min.css";

    setTimeout(() => hljs.highlightAll(), 100);
</script>

</body>
</html>`
}, {
  html: (title, code) => `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Highlighter</title>
    <link id="theme-link" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/base16/dracula.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Fira Code', monospace;
        }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: transparent;
            padding: 20px;
        }
        .code-container {
            background: rgba(30, 30, 30, 0.95);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            padding: 24px;
            width: 100%;
            max-width: 900px;
            position: relative;
            overflow: hidden;
        }
        .buttons {
            position: absolute;
            top: 12px;
            left: 16px;
            display: flex;
            gap: 8px;
        }
        .button {
            width: 14px;
            height: 14px;
            border-radius: 50%;
        }
        .red { background: #ff5f56; }
        .yellow { background: #ffbd2e; }
        .green { background: #27c93f; }
        .title {
            color: white;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin-top: 10px;
        }
        pre {
            margin: 20px 0 0;
            overflow-x: auto;
        }
        code {
            font-size: 15px;
            white-space: pre-wrap;
            word-break: break-word;
        }
    </style>
</head>
<body>

<div class="code-container">
    <div class="buttons">
        <span class="button red"></span>
        <span class="button yellow"></span>
        <span class="button green"></span>
    </div>
    <div class="title" id="codeTitle"></div>
    <pre><code id="codeBlock" class="language-javascript"></code></pre>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script>
    document.getElementById("codeTitle").innerText = "${title}";
    document.getElementById("codeBlock").innerText = "${code}";
    document.getElementById("theme-link").href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/base16/dracula.min.css";

    setTimeout(() => hljs.highlightAll(), 100);
</script>

</body>
</html>`
}, {
  html: (title, code) => `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Highlighter</title>
    <link id="theme-link" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/base16/dracula.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Fira Code', monospace;
        }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: transparent;
            padding: 20px;
        }
        .code-container {
            background: rgba(30, 30, 30, 0.95);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            padding: 24px;
            width: 100%;
            max-width: 900px;
            position: relative;
            overflow: hidden;
        }
        .buttons {
            position: absolute;
            top: 12px;
            left: 16px;
            display: flex;
            gap: 8px;
        }
        .button {
            width: 14px;
            height: 14px;
            border-radius: 50%;
        }
        .red { background: #ff5f56; }
        .yellow { background: #ffbd2e; }
        .green { background: #27c93f; }
        .title {
            color: white;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin-top: 10px;
        }
        pre {
            margin: 20px 0 0;
            overflow-x: auto;
        }
        code {
            font-size: 15px;
            white-space: pre-wrap;
            word-break: break-word;
        }
    </style>
</head>
<body>

<div class="code-container">
    <div class="buttons">
        <span class="button red"></span>
        <span class="button yellow"></span>
        <span class="button green"></span>
    </div>
    <div class="title" id="codeTitle"></div>
    <pre><code id="codeBlock" class="language-javascript"></code></pre>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script>
    document.getElementById("codeTitle").innerText = "${title}";
    document.getElementById("codeBlock").innerText = "${code}";
    document.getElementById("theme-link").href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/base16/dracula.min.css";

    setTimeout(() => hljs.highlightAll(), 100);
</script>

</body>
</html>`
}];
const getTemplate = ({
  template: index = 1,
title, 
code
}) => {
  const templateIndex = Number(index);
  return templates[templateIndex - 1]?.html(title, code) || "Template tidak ditemukan";
};
module.exports = getTemplate;