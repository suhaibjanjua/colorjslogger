<h1 align="center"> ColorJSLogger </h1>
<p align="center"> Elevate your browser debugging with vibrant, organized, and downloadable console logs. </p>

<p align="center">
  <img alt="Build" src="https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge">
  <img alt="Issues" src="https://img.shields.io/badge/Issues-0%20Open-blue?style=for-the-badge">
  <img alt="Contributions" src="https://img.shields.io/badge/Contributions-Welcome-orange?style=for-the-badge">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge">
</p>
<!--
  **Note:** These are static placeholder badges. Replace them with your project's actual badges.
  You can generate your own at https://shields.io
-->

---

## 📖 Table of Contents
- [⭐ Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack & Architecture](#️-tech-stack--architecture)
- [🚀 Getting Started](#-getting-started)
- [🔧 Usage](#-usage)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## ⭐ Overview

**ColorJSLogger** is a powerful yet lightweight JavaScript library designed to transform your browser console debugging experience. Say goodbye to monotonous black-and-white logs and embrace clarity with vibrant, categorized, and feature-rich console output.

> Debugging complex front-end applications can quickly become overwhelming when faced with a flood of undifferentiated console messages. Standard `console.log` falls short, lacking visual cues for severity, context, or the ability to easily extract information for later analysis. This often leads to wasted time sifting through irrelevant data and a slower debugging cycle.

ColorJSLogger provides an elegant solution by enhancing the native browser console with an intuitive API for producing colorful, clearly categorized, and contextually rich logs. Beyond aesthetics, it empowers developers with practical features like log downloading and application-specific log prefixes, streamlining the debugging workflow and improving overall development efficiency.

This project is delivered as a lightweight, client-side JavaScript library. It's meticulously built using modern JavaScript best practices, then transpiled with Babel for extensive browser compatibility and minified with UglifyJS for optimal performance in production environments. Its design emphasizes ease of integration and minimal footprint, making it a perfect addition to any web project needing enhanced logging capabilities.

## ✨ Key Features

*   **🎨 Colorful Console Output:** Instantly differentiate between various log types (e.g., info, warning, error, success, debug) with pre-defined or customizable color schemes. Improves readability and speeds up issue identification.
*   **⬇️ Downloadable Log History:** Export all captured console logs into a `.txt` file with a single function call. Ideal for sharing debugging sessions with teammates, post-mortem analysis, or offline review, as directly inferred from `download.md` and `keywords`.
*   **🏷️ Application-Specific Prefixes:** Automatically prepend a configurable application name to all your logs. This feature, hinted by `set-appname.md`, is invaluable in multi-component applications or when debugging embedded scripts, providing immediate context.
*   **🤫 Confidential Log Handling:** Implement a mechanism to mark or handle sensitive log entries. As inferred from `confidential-logs.md`, this allows for selective logging or redaction, ensuring that private information does not inadvertently appear in downloadable logs or public console outputs.
*   **⚡ Optimized & Browser Compatible:** Built with modern JavaScript, then transpiled using Babel for broad compatibility across various browser versions and minified with UglifyJS to ensure a small footprint and fast loading times.
*   **🧩 Simple & Intuitive API:** Integrates seamlessly into existing projects with a straightforward and easy-to-learn API, mimicking familiar console methods while adding powerful enhancements.

## 🛠️ Tech Stack & Architecture

ColorJSLogger is built upon a concise and efficient set of technologies, prioritizing browser compatibility, performance, and ease of use.

| Technology            | Purpose                                     | Why it was Chosen                                                                      |
| :-------------------- | :------------------------------------------ | :------------------------------------------------------------------------------------- |
| **JavaScript**        | Primary programming language                | Universal language of the web, ensuring maximum accessibility and integration into browser environments. |
| **Babel**             | JavaScript transpiler                       | To convert modern ECMAScript features into older, more widely supported versions, guaranteeing broad browser compatibility. |
| **UglifyJS**          | JavaScript minifier                         | To reduce file size and optimize loading performance for production deployments, delivering a lightweight library. |
| **Browser Console API** | Core interaction and output mechanism | Leverages native browser capabilities for robust, high-performance, and familiar logging. |

## 🚀 Getting Started

To get ColorJSLogger up and running in your project, follow these simple steps:

### Prerequisites

You'll need the following installed:

*   **Node.js**: `v12+` (for `npm` or `yarn` package management, if you choose that installation method).
*   A modern **Web Browser** (Chrome, Firefox, Edge, Safari, etc.)

### Installation

You have several options to include ColorJSLogger in your project:

#### 1. Via NPM

```bash
npm install colorjslogger
```

#### 2. Via Yarn

```bash
yarn add colorjslogger
```

#### 3. Direct Download

You can download the minified `jslogger.min.js` file directly from the `src` directory or the [releases page](https://github.com/suhaibjanjua/colorjslogger/releases) (inferred from `download.md`).

#### 4. Via CDN (Example - replace with actual CDN if available)

While not explicitly provided in the file structure, it's a common and highly convenient way to include browser-based libraries. You would typically add this to your HTML `<head>` or before the closing `</body>` tag:

```html
<!-- Replace with actual CDN link once available -->
<script src="https://cdn.jsdelivr.net/npm/colorjslogger@3.0.1/src/jslogger.min.js"></script>
```

## 🔧 Usage

Once installed, integrating and using ColorJSLogger is straightforward.

### Basic Integration

Include the `jslogger.min.js` script in your HTML file. If using NPM/Yarn and a bundler (e.g., Webpack, Rollup), you can `import` it.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ColorJSLogger Example</title>
</head>
<body>
    <h1>Check the browser console!</h1>

    <!-- If direct download or CDN is used -->
    <script src="https://cdn.jsdelivr.net/npm/colorjslogger@latest/src/jslogger.min.js"></script>
    <script>
        // Initialize the logger (assuming it's available globally as ColorJSLogger)
        const jslogger = window.ColorJSLogger; // Or import if using a module bundler

        jslogger.info("Welcome to ColorJSLogger!");
        jslogger.warn("This is a warning message.");
        jslogger.error("An error occurred!", new Error("Something went wrong."));
        jslogger.success("Operation completed successfully!");
        jslogger.debug("Debugging variable: ", { data: "test", value: 123 });
        jslogger.log("Standard log message.");
    </script>
</body>
</html>
```
### Standard Output

A sample snippet to show output.

```javascript
let username = "Suhaib Janjua";
jslogger.log("AuthService", `Authentication successful: User "${username}" loggedin.`);

```

> Mon Aug 12 2019 22:37:57 | JSLogger | [AuthService] :: Authentication successful: User "Suhaib Janjua" loggedin.


### Setting an Application Name

Easily prefix all your logs with a specific application or module name for better context:

```javascript
// Before logging anything, set your app name
jslogger.setAppName("SuhaibJanjuaLogger");

jslogger.info("Authentication", "User logged in."); 

```
Output in console:
> Mon Aug 12 2019 22:39:54 | SuhaibJanjuaLogger | [Authentication] :: User logged in.

```javascript
// You can change it anytime
jslogger.setAppName("AdminCenter");

jslogger.debug("AuthService", "Token refresh initiated.");

```
Output in console:
> Mon Aug 12 2019 22:40:05 | AdminCenter | [AuthService] :: Token refresh initiated.

### Downloading Logs

Export all recorded logs to a `.txt` file for later review:

```javascript
// Log some more messages
jslogger.info("Data fetched from API.");
jslogger.error("Failed to parse response.");

// Trigger the log download
jslogger.downloadLogs("my_app_session_logs.txt");
// This will prompt the user to download a file named 'my_app_session_logs.txt'
// containing all the console output generated by ColorJSLogger during the session.
```

### Handling Confidential Logs (Inferred)

While specific implementation details for `confidential-logs.md` are not provided, a common pattern for sensitive logging involves a special method or configuration. For instance:

```javascript
// Imagine a method for logging sensitive data that might be redacted or excluded from downloads
jslogger.internal("User token: abc-xyz-123", { userId: 456 });
// Depending on ColorJSLogger's internal configuration (which you might set),
// this could:
// - Log a redacted message to the console, e.g., "[CONFIDENTIAL] User token: [REDACTED]"
// - Be entirely excluded from the output of `jslogger.downloadLogs()`.
// - Require a special debug flag to enable its full display or inclusion.
```

For more comprehensive examples and advanced configurations, please refer to the `docs/example.md` and `docs/usage.md` files within the repository.

## 🤝 Contributing

We welcome contributions to ColorJSLogger! If you have suggestions, bug reports, or want to contribute code, please follow these steps:

1.  **Fork** the repository.
2.  **Clone** your forked repository: `git clone https://github.com/YOUR_USERNAME/colorjslogger.git`
3.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `git checkout -b bugfix/issue-description`
4.  **Make your changes**, ensuring they adhere to the project's coding style and best practices.
5.  **Test your changes** thoroughly.
6.  **Commit your changes** with a clear and descriptive message.
7.  **Push your branch** to your forked repository: `git push origin feature/your-feature-name`
8.  **Open a Pull Request** against the `main` branch of the original repository.

Please ensure your pull requests are well-described and include any relevant documentation updates.

## 📝 License

Distributed under the MIT License. See [`LICENSE.md`](LICENSE.md) for more information.
