How to Create a Chrome Extension with React, TypeScript, TailwindCSS, and Vite
Lokman Musliu Founder and CEO of Lucky Media
Lokman Musliu
September 13, 2024 · 5 min read · 6,669 views

How to create a chrome extension with React, Typescript, Tailwindcss, and Vite
Creating a Chrome extension can be a fun and rewarding project, especially when you combine powerful tools like React, TypeScript, TailwindCSS, and Vite. In this article, we’ll walk you through the entire process step-by-step, ensuring you have a clear understanding of how to build your own Chrome extension in 2024. Whether you’re a seasoned developer or just starting out, this guide will help you navigate the complexities of extension development with ease.

Creating a React Chrome Extension
Have you ever thought about creating your own Chrome extension? Maybe you have a brilliant idea that could make browsing easier or more enjoyable. Let’s create a Chrome extension using modern web technologies: React for building user interfaces, TypeScript for type safety, TailwindCSS for styling, and Vite for a fast development experience. By the end of this article, you’ll have a fully functional extension and the knowledge to expand on it.

Setting Up Your Development Environment
Installing Node.js and npm
To get started, download and install Node.js from the official website. This will also install npm, which you’ll use to manage your project dependencies.

Creating a New Vite Project
Once Node.js is installed, open your terminal and run the following command to create a new Vite project:

# npm 7+, extra double-dash is needed:
npm create vite@latest my-chrome-extension -- --template react-ts
This command sets up a new project with React and TypeScript.

Understanding Chrome Extensions
Manifest File Overview
Every Chrome extension needs a manifest file (manifest.json). This file contains metadata about your extension, including its name, version, permissions, and the background scripts it will use.

Key Components of a Chrome Extension
A typical Chrome extension consists of:

Background scripts: Run in the background and handle events.

Content scripts: Injected into web pages to interact with the DOM.

Popup UI: The interface that appears when you click the extension icon.

Integrating React with Vite
Setting Up React in Vite
After creating your Vite project, navigate to your project directory and run npm install.

Creating Your First Component
Create a new component in the src folder, for example, Popup.tsx:

import React from 'react'; 

const Popup: React.FC = () => (
  <div className="p-4">
	  <h1 className="text-lg font-bold">
		Hello, Chrome Extension!
	  </h1> 
  </div> 
);

export default Popup;
Now in our App.tsx file we need to import our Popup.tsx component that we just created:

import Popup from "./Popup";

const App: React.FC = () => {
  return <Popup />;
};

export default App;
Adding TypeScript to Your Project
Installing TypeScript
If you choose the React + TypeScript template, TypeScript will already be installed. If not, you can add it with:

npm install --save-dev typescript
Configuring TypeScript
Create a tsconfig.json file in your project root to configure TypeScript options. You can start with a basic configuration:

{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
Styling with TailwindCSS
Installing TailwindCSS
To add TailwindCSS, run the following commands:

npm install -D tailwindcss postcss autoprefixer 

npx tailwindcss init -p
Setting Up TailwindCSS with Vite
In your tailwind.config.js, configure the paths to your template files:

module.exports = {
    content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}'
	],
    theme: {
        extend: {},
    },
    plugins: [],
};
Then, include Tailwind in your CSS by adding the following lines to your src/index.css:

@tailwind base;
@tailwind components;
@tailwind utilities;
React and Vite interaction
Building Your Chrome Extension
Install the CRXJS Vite Plugin
To be able to bundle a Chrome Extension we need a plugin for Vite that will make our job a little bit easier, by handling things like HMR and static asset imports.

We can start by installing it with the command npm i @crxjs/vite-plugin@beta -D.

Update the Vite config
Update vite.config.ts to match the code below:

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
})
Create a file named manifest.json next to vite.config.js:

{
  "manifest_version": 3,
  "name": "My Chrome Extension",
  "version": "1.0.0",
  "description": "A Chrome extension built with Vite and React",
  "action": {
    "default_popup": "index.html"
  },
  "permissions": []
}
Testing Your Extension
Loading the Extension in Chrome
Now that you have everything ready, it’s time to give it a test run in the browser.

If you haven’t started Vite in the terminal, you can do it by running npm run dev.

By default, you should see a Popup when you click on the extension. The contents of that Popup.tsx component are in the App.tsx component.

To test your extension, open Chrome and navigate to chrome://extensions. Enable Developer mode and click Load unpacked. Select your project’s dist folder.

Debugging Tips
If something isn’t working, check the console for errors. You can access the console by right-clicking on your extension popup and selecting Inspect.

Publishing Your Extension
Preparing for Submission
Before publishing, ensure your extension meets the Chrome Web Store’s policies. You may need to create a promotional image and write a detailed description.

Publishing on the Chrome Web Store
Go to the Chrome Web Store Developer Dashboard, create a new item, and upload your extension package (the zip file of your project). Follow the prompts to complete the submission.

React 19 logo
Conclusion
Creating a Chrome extension with React, TypeScript, TailwindCSS, and Vite is a great way to enhance your development skills. Enjoy your extension and keep learning by experimenting with new features and technologies.

FAQs
Can I use other frameworks instead of React?
Yes, you can use any JavaScript framework or library, such as Vue or Angular, to build your Chrome extension.

Is it necessary to use TypeScript?
No, but TypeScript provides type safety and can help catch errors early in the development process.

How do I update my extension after publishing?
You can update your extension by incrementing the version number in the manifest file and re-uploading the package to the Chrome Web Store.

Can I monetize my Chrome extension?
Yes, you can monetize your extension through various methods, such as offering premium features or displaying ads.

What are some common mistakes to avoid when creating a Chrome extension?
Avoid overcomplicating your extension, neglecting user privacy, and failing to test thoroughly before publishing.